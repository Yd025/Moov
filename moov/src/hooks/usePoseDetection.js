import { useState, useEffect, useRef, useCallback } from 'react';
import { getExerciseConfig, TRACKING_TYPES } from '../logic/exerciseConfigs';
import { runFormChecks, getOverallFormScore } from '../logic/formChecks';

/**
 * Enhanced Pose Detection Hook
 * 
 * Integrates with MediaPipe Pose for real-time pose tracking with:
 * - Exercise-specific configuration support
 * - Multi-phase rep detection (start → peak → return)
 * - Bilateral tracking for symmetrical exercises
 * - Form analysis with exercise-specific checks
 * - Performance metrics for adaptive engine
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.exerciseId - Exercise ID for loading config
 * @param {Object} options.exerciseConfig - Direct exercise config (overrides exerciseId)
 * @param {Function} options.onRepComplete - Callback when a rep is detected
 * @param {Function} options.onFormFeedback - Callback for form feedback
 * @param {Function} options.onPerformanceUpdate - Callback with performance metrics
 */
export function usePoseDetection({
  exerciseId = null,
  exerciseConfig = null,
  onRepComplete = null,
  onFormFeedback = null,
  onPerformanceUpdate = null,
} = {}) {
  // State
  const [isDetecting, setIsDetecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [formQuality, setFormQuality] = useState('good');
  const [formFeedback, setFormFeedback] = useState('');
  const [currentAngle, setCurrentAngle] = useState(null);
  const [isFormGood, setIsFormGood] = useState(true);
  const [repPhase, setRepPhase] = useState('neutral'); // 'neutral', 'contracting', 'peak', 'returning'
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const cameraRef = useRef(null);
  const configRef = useRef(null);
  const repStateRef = useRef({
    phase: 'neutral',
    lastAngle: null,
    peakAngle: null,
    startTime: null,
    lastRepTime: 0,
    repCount: 0,
  });
  const performanceRef = useRef({
    repTimes: [],
    anglesAchieved: [],
    formScores: [],
  });

  // Load exercise config
  useEffect(() => {
    if (exerciseConfig) {
      configRef.current = exerciseConfig;
    } else if (exerciseId) {
      configRef.current = getExerciseConfig(exerciseId);
    } else {
      configRef.current = null;
    }
    
    // Reset rep state when config changes
    repStateRef.current = {
      phase: 'neutral',
      lastAngle: null,
      peakAngle: null,
      startTime: null,
      lastRepTime: 0,
      repCount: 0,
    };
    performanceRef.current = {
      repTimes: [],
      anglesAchieved: [],
      formScores: [],
    };
    setRepPhase('neutral');
  }, [exerciseId, exerciseConfig]);

  /**
   * Calculates angle between three points (joints) in degrees
   */
  const calculateAngle = useCallback((point1, point2, point3) => {
    if (!point1 || !point2 || !point3) return null;
    
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                    Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    
    return angle;
  }, []);

  /**
   * Gets angle from landmarks using joint config
   */
  const getAngleFromConfig = useCallback((landmarks, joints, minVisibility = 0.5) => {
    if (!landmarks || !joints) return null;
    
    const { point1, vertex, point3 } = joints;
    
    const p1 = landmarks[point1];
    const v = landmarks[vertex];
    const p3 = landmarks[point3];
    
    if (!p1 || !v || !p3) return null;
    if (p1.visibility < minVisibility || v.visibility < minVisibility || p3.visibility < minVisibility) {
      return null;
    }
    
    return calculateAngle(p1, v, p3);
  }, [calculateAngle]);

  /**
   * Multi-phase rep detection
   * Tracks: neutral → contracting → peak → returning → neutral (rep complete)
   */
  const detectRepPhase = useCallback((angle, config) => {
    if (angle === null || !config?.tracking?.repPhases) return false;
    
    const { repPhases, bilateral } = config.tracking;
    const { start, peak } = repPhases;
    const state = repStateRef.current;
    const now = Date.now();
    
    // Determine if angle is near start or peak
    const nearStart = Math.abs(angle - start.angle) <= start.tolerance;
    const nearPeak = Math.abs(angle - peak.angle) <= peak.tolerance;
    
    // Determine movement direction
    const movingToPeak = start.angle > peak.angle 
      ? angle < state.lastAngle  // Decreasing angle (like arm raise)
      : angle > state.lastAngle; // Increasing angle
    
    let repCompleted = false;
    
    switch (state.phase) {
      case 'neutral':
        // Waiting at start position
        if (nearStart) {
          // Ready to start a rep
          state.phase = 'ready';
          state.startTime = now;
        }
        break;
        
      case 'ready':
        // At start, waiting for movement toward peak
        if (movingToPeak && !nearStart) {
          state.phase = 'contracting';
        }
        break;
        
      case 'contracting':
        // Moving toward peak
        if (nearPeak) {
          state.phase = 'peak';
          state.peakAngle = angle;
        } else if (nearStart) {
          // Went back to start without reaching peak - reset
          state.phase = 'ready';
        }
        break;
        
      case 'peak':
        // At peak, waiting for return movement
        if (!nearPeak && !movingToPeak) {
          state.phase = 'returning';
        }
        break;
        
      case 'returning':
        // Moving back to start
        if (nearStart) {
          // Rep completed!
          const timeSinceLastRep = now - state.lastRepTime;
          if (timeSinceLastRep > 800) { // Min 800ms between reps
            state.lastRepTime = now;
            state.repCount++;
            repCompleted = true;
            
            // Record performance
            const repTime = (now - state.startTime) / 1000;
            performanceRef.current.repTimes.push(repTime);
            performanceRef.current.anglesAchieved.push(state.peakAngle);
          }
          state.phase = 'ready';
          state.startTime = now;
          state.peakAngle = null;
        } else if (nearPeak) {
          // Went back to peak - continue from there
          state.phase = 'peak';
        }
        break;
    }
    
    state.lastAngle = angle;
    setRepPhase(state.phase);
    
    return repCompleted;
  }, []);

  /**
   * Analyzes form based on exercise config
   */
  const analyzeForm = useCallback((landmarks) => {
    if (!landmarks || landmarks.length < 33) {
      setFormQuality('poor');
      setFormFeedback('Please position yourself in front of the camera');
      setIsFormGood(false);
      return 0;
    }

    const config = configRef.current;
    
    // If we have exercise-specific form rules, use them
    if (config?.formRules && config.formRules.length > 0) {
      const result = runFormChecks(landmarks, config.formRules);
      
      if (result.isCorrect) {
        setFormQuality('good');
        setFormFeedback('');
        setIsFormGood(true);
      } else {
        setFormQuality(result.severity === 'warning' ? 'poor' : 'needs_correction');
        setFormFeedback(result.feedback);
        setIsFormGood(false);
        
        // Notify about form feedback
        if (onFormFeedback && result.feedback) {
          onFormFeedback(result.feedback, result.severity);
        }
      }
      
      // Record form score
      performanceRef.current.formScores.push(result.score);
      
      return result.score;
    }
    
    // Default form analysis
    const score = getOverallFormScore(landmarks);
    
    if (score > 0.8) {
      setFormQuality('good');
      setFormFeedback('');
      setIsFormGood(true);
    } else if (score > 0.5) {
      setFormQuality('needs_correction');
      setFormFeedback('Adjust your position for better form');
      setIsFormGood(false);
    } else {
      setFormQuality('poor');
      setFormFeedback('Please ensure you are visible to the camera');
      setIsFormGood(false);
    }
    
    performanceRef.current.formScores.push(score);
    return score;
  }, [onFormFeedback]);

  /**
   * Draws pose landmarks on canvas
   */
  const drawPoseLandmarks = useCallback((landmarks) => {
    if (!canvasRef.current || !landmarks) return;

    const ctx = canvasRef.current.getContext('2d');
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    ctx.clearRect(0, 0, width, height);

    // Skeleton connections
    const connections = [
      [11, 12], // Shoulders
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 23], [12, 24], // Torso
      [23, 24], // Hips
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
    ];

    // Color based on form quality
    const color = formQuality === 'good' ? '#059669' : 
                  formQuality === 'needs_correction' ? '#F59E0B' : '#EF4444';
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Draw connections
    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (startPoint && endPoint && 
          startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw key points
    ctx.fillStyle = color;
    landmarks.forEach((landmark) => {
      if (landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(
          landmark.x * width,
          landmark.y * height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });

    // Highlight tracked joints if we have config
    const config = configRef.current;
    if (config?.tracking?.primaryJoints) {
      ctx.fillStyle = '#3B82F6'; // Blue for tracked joints
      const joints = config.tracking.primaryJoints;
      [joints.point1, joints.vertex, joints.point3].forEach(idx => {
        const lm = landmarks[idx];
        if (lm && lm.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(lm.x * width, lm.y * height, 8, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  }, [formQuality]);

  /**
   * Handles pose detection results
   */
  const handlePoseResults = useCallback((results) => {
    if (!results.poseLandmarks) return;
    
    const landmarks = results.poseLandmarks;
    setPoseLandmarks(landmarks);
    
    // Analyze form
    const formScore = analyzeForm(landmarks);
    
    // Draw landmarks
    drawPoseLandmarks(landmarks);
    
    // Get config and calculate angle
    const config = configRef.current;
    let angle = null;
    
    if (config?.tracking?.type === TRACKING_TYPES.ANGLE && config.tracking.primaryJoints) {
      angle = getAngleFromConfig(
        landmarks, 
        config.tracking.primaryJoints,
        config.tracking.minVisibility || 0.5
      );
      
      // Also check secondary joints for bilateral exercises
      if (config.tracking.bilateral && config.tracking.secondaryJoints) {
        const secondaryAngle = getAngleFromConfig(
          landmarks,
          config.tracking.secondaryJoints,
          config.tracking.minVisibility || 0.5
        );
        
        // Use average of both sides or whichever is available
        if (angle !== null && secondaryAngle !== null) {
          angle = (angle + secondaryAngle) / 2;
        } else if (secondaryAngle !== null) {
          angle = secondaryAngle;
        }
      }
    }
    
    setCurrentAngle(angle);
    
    // Detect rep completion
    if (config && angle !== null) {
      const repCompleted = detectRepPhase(angle, config);
      
      if (repCompleted && onRepComplete) {
        // Calculate performance metrics for this rep
        const perf = performanceRef.current;
        const metrics = {
          repTime: perf.repTimes[perf.repTimes.length - 1] || 0,
          angleAchieved: perf.anglesAchieved[perf.anglesAchieved.length - 1] || 0,
          targetAngle: config.tracking.repPhases?.peak?.angle || 0,
          formScore: formScore,
        };
        
        onRepComplete(metrics);
        
        // Notify performance update
        if (onPerformanceUpdate) {
          onPerformanceUpdate({
            completedReps: repStateRef.current.repCount,
            avgFormScore: perf.formScores.length > 0 
              ? perf.formScores.reduce((a, b) => a + b, 0) / perf.formScores.length 
              : 1,
            avgROM: perf.anglesAchieved.length > 0 && config.tracking.repPhases?.peak?.angle
              ? perf.anglesAchieved.reduce((a, b) => a + b, 0) / perf.anglesAchieved.length / config.tracking.repPhases.peak.angle
              : 1,
          });
        }
      }
    }
  }, [analyzeForm, drawPoseLandmarks, getAngleFromConfig, detectRepPhase, onRepComplete, onPerformanceUpdate]);

  /**
   * Initializes MediaPipe Pose detector
   */
  const initializePoseDetection = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Dynamic import of MediaPipe
      const { Pose } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');
      
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(handlePoseResults);
      
      poseDetectorRef.current = pose;

      // Initialize camera
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseDetectorRef.current && videoRef.current) {
              await poseDetectorRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        
        cameraRef.current = camera;
        await camera.start();
      }

      setIsDetecting(true);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Error initializing pose detection:', err);
      setError(err.message || 'Failed to initialize pose detection');
      setIsLoading(false);
      setIsDetecting(false);
    }
  }, [handlePoseResults]);

  /**
   * Starts pose detection
   */
  const startDetection = useCallback(async () => {
    if (!videoRef.current) {
      setError('Video element not available');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => {
          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth || 640;
            canvasRef.current.height = videoRef.current.videoHeight || 480;
          }
          resolve();
        };
      });
      
      await initializePoseDetection();
      return true;
      
    } catch (err) {
      console.error('Error starting detection:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera permissions.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera.');
      } else {
        setError(err.message || 'Failed to access camera');
      }
      
      setIsLoading(false);
      setIsDetecting(false);
      return false;
    }
  }, [initializePoseDetection]);

  /**
   * Stops pose detection and releases resources
   */
  const stopDetection = useCallback(() => {
    // Stop camera
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    // Stop video stream
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Close pose detector
    if (poseDetectorRef.current) {
      poseDetectorRef.current.close();
      poseDetectorRef.current = null;
    }
    
    setIsDetecting(false);
    setPoseLandmarks(null);
    setCurrentAngle(null);
    setRepPhase('neutral');
  }, []);

  /**
   * Resets rep tracking for new exercise
   */
  const resetTracking = useCallback(() => {
    repStateRef.current = {
      phase: 'neutral',
      lastAngle: null,
      peakAngle: null,
      startTime: null,
      lastRepTime: 0,
      repCount: 0,
    };
    performanceRef.current = {
      repTimes: [],
      anglesAchieved: [],
      formScores: [],
    };
    setRepPhase('neutral');
  }, []);

  /**
   * Gets current performance metrics
   */
  const getPerformanceMetrics = useCallback(() => {
    const perf = performanceRef.current;
    const config = configRef.current;
    
    return {
      repCount: repStateRef.current.repCount,
      avgRepTime: perf.repTimes.length > 0
        ? perf.repTimes.reduce((a, b) => a + b, 0) / perf.repTimes.length
        : 0,
      avgFormScore: perf.formScores.length > 0
        ? perf.formScores.reduce((a, b) => a + b, 0) / perf.formScores.length
        : 1,
      avgAngle: perf.anglesAchieved.length > 0
        ? perf.anglesAchieved.reduce((a, b) => a + b, 0) / perf.anglesAchieved.length
        : null,
      targetAngle: config?.tracking?.repPhases?.peak?.angle || null,
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return {
    // State
    isDetecting,
    isLoading,
    error,
    poseLandmarks,
    formQuality,
    formFeedback,
    currentAngle,
    isFormGood,
    repPhase,
    
    // Refs for components
    videoRef,
    canvasRef,
    
    // Actions
    startDetection,
    stopDetection,
    resetTracking,
    getPerformanceMetrics,
  };
}
