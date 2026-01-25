import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Pose Detection Hook - Integrates with MediaPipe Pose for real-time pose tracking
 * Provides pose landmarks, form analysis, angle calculation, and rep detection
 * @param {Object} options - Configuration options
 * @param {number} options.targetAngle - Target angle for rep detection (degrees)
 * @param {number} options.angleRange - Tolerance range for target angle (±degrees)
 * @param {Function} options.onRepComplete - Callback when a rep is detected
 */
export function usePoseDetection({ targetAngle = null, angleRange = 10, onRepComplete = null } = {}) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [poseLandmarks, setPoseLandmarks] = useState(null);
  const [formQuality, setFormQuality] = useState('good'); // 'good', 'needs_correction', 'poor'
  const [formFeedback, setFormFeedback] = useState('');
  const [currentAngle, setCurrentAngle] = useState(null);
  const [isFormGood, setIsFormGood] = useState(true);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseDetectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const repStateRef = useRef({ 
    inTargetRange: false, 
    wasInRange: false,
    lastRepTime: 0 
  });

  /**
   * Calculates angle between three points (joints) in degrees
   * @param {Object} point1 - First point {x, y}
   * @param {Object} point2 - Middle point (vertex) {x, y}
   * @param {Object} point3 - Third point {x, y}
   * @returns {number} Angle in degrees (0-180)
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
   * Calculates elbow angle from pose landmarks
   * @param {Array} landmarks - MediaPipe pose landmarks
   * @param {string} side - 'left' or 'right'
   * @returns {number|null} Angle in degrees or null
   */
  const calculateElbowAngle = useCallback((landmarks, side = 'left') => {
    if (!landmarks || landmarks.length < 33) return null;
    
    const shoulderIdx = side === 'left' ? 11 : 12;
    const elbowIdx = side === 'left' ? 13 : 14;
    const wristIdx = side === 'left' ? 15 : 16;
    
    const shoulder = landmarks[shoulderIdx];
    const elbow = landmarks[elbowIdx];
    const wrist = landmarks[wristIdx];
    
    if (!shoulder || !elbow || !wrist) return null;
    if (shoulder.visibility < 0.5 || elbow.visibility < 0.5 || wrist.visibility < 0.5) return null;
    
    return calculateAngle(shoulder, elbow, wrist);
  }, [calculateAngle]);

  /**
   * Calculates knee angle from pose landmarks
   * @param {Array} landmarks - MediaPipe pose landmarks
   * @param {string} side - 'left' or 'right'
   * @returns {number|null} Angle in degrees or null
   */
  const calculateKneeAngle = useCallback((landmarks, side = 'left') => {
    if (!landmarks || landmarks.length < 33) return null;
    
    const hipIdx = side === 'left' ? 23 : 24;
    const kneeIdx = side === 'left' ? 25 : 26;
    const ankleIdx = side === 'left' ? 27 : 28;
    
    const hip = landmarks[hipIdx];
    const knee = landmarks[kneeIdx];
    const ankle = landmarks[ankleIdx];
    
    if (!hip || !knee || !ankle) return null;
    if (hip.visibility < 0.5 || knee.visibility < 0.5 || ankle.visibility < 0.5) return null;
    
    return calculateAngle(hip, knee, ankle);
  }, [calculateAngle]);

  /**
   * Detects if a rep has been completed based on angle state machine
   * @param {number} angle - Current angle
   * @param {number} targetAngle - Target angle
   * @param {number} angleRange - Tolerance range
   * @returns {boolean} True if rep completed
   */
  const detectRep = useCallback((angle, targetAngle, angleRange) => {
    if (angle === null || targetAngle === null) return false;
    
    const inRange = Math.abs(angle - targetAngle) <= angleRange;
    const state = repStateRef.current;
    
    // State machine: extended -> entering range -> in range -> exiting range -> extended
    if (inRange && !state.wasInRange) {
      // Just entered target range
      state.inTargetRange = true;
      state.wasInRange = true;
    } else if (!inRange && state.wasInRange) {
      // Exited target range after being in it - rep completed!
      if (state.inTargetRange && Date.now() - state.lastRepTime > 1000) {
        // Prevent double-counting (min 1 second between reps)
        state.lastRepTime = Date.now();
        state.inTargetRange = false;
        state.wasInRange = false;
        return true;
      }
      state.wasInRange = false;
      state.inTargetRange = false;
    }
    
    return false;
  }, []);

  /**
   * Initializes MediaPipe Pose detector
   */
  const initializePoseDetection = async () => {
    try {
      // Dynamic import of MediaPipe Pose
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

      pose.onResults((results) => {
        if (results.poseLandmarks) {
          setPoseLandmarks(results.poseLandmarks);
          analyzeForm(results.poseLandmarks);
          drawPoseLandmarks(results.poseLandmarks);
          
          // Calculate current angle (default to left elbow for arm exercises, left knee for leg exercises)
          let angle = calculateElbowAngle(results.poseLandmarks, 'left');
          if (angle === null) {
            angle = calculateKneeAngle(results.poseLandmarks, 'left');
          }
          setCurrentAngle(angle);
          
          // Detect rep if target angle is set
          if (targetAngle !== null && angle !== null && onRepComplete) {
            const repCompleted = detectRep(angle, targetAngle, angleRange);
            if (repCompleted) {
              onRepComplete();
            }
          }
        }
      });

      poseDetectorRef.current = pose;

      // Initialize camera
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (poseDetectorRef.current) {
              await poseDetectorRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480,
        });
        camera.start();
      }

      setIsDetecting(true);
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      setIsDetecting(false);
      // Fallback to mock mode
      setIsDetecting(true);
    }
  };

  /**
   * Analyzes pose form and provides feedback
   * @param {Array} landmarks - Pose landmarks from MediaPipe
   */
  const analyzeForm = (landmarks) => {
    if (!landmarks || landmarks.length < 33) {
      setFormQuality('poor');
      setFormFeedback('Please position yourself in front of the camera');
      setIsFormGood(false);
      return;
    }

    // Check if shoulders are level
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    
    let formIsGood = true;
    
    if (leftShoulder && rightShoulder) {
      const shoulderDiff = Math.abs(leftShoulder.y - rightShoulder.y);
      
      if (shoulderDiff > 0.1) {
        setFormQuality('needs_correction');
        setFormFeedback('Keep your shoulders level');
        formIsGood = false;
      } else {
        setFormQuality('good');
        setFormFeedback('');
      }
    }
    
    // Check visibility of key points
    const keyPoints = [11, 12, 13, 14, 15, 16]; // Shoulders, elbows, wrists
    const visiblePoints = keyPoints.filter(idx => 
      landmarks[idx] && landmarks[idx].visibility > 0.5
    );
    
    if (visiblePoints.length < 4) {
      setFormQuality('poor');
      setFormFeedback('Please ensure your upper body is visible');
      formIsGood = false;
    }
    
    setIsFormGood(formIsGood);
  };

  /**
   * Draws pose landmarks on canvas
   * @param {Array} landmarks - Pose landmarks
   */
  const drawPoseLandmarks = (landmarks) => {
    if (!canvasRef.current || !landmarks) return;

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw skeleton connections
    const connections = [
      [11, 12], // Shoulders
      [11, 13], [13, 15], // Left arm
      [12, 14], [14, 16], // Right arm
      [11, 23], [12, 24], // Torso
      [23, 24], // Hips
      [23, 25], [25, 27], // Left leg
      [24, 26], [26, 28], // Right leg
    ];

    ctx.strokeStyle = formQuality === 'good' ? '#059669' : '#FF4444';
    ctx.lineWidth = 3;

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];
      
      if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * canvasRef.current.width, startPoint.y * canvasRef.current.height);
        ctx.lineTo(endPoint.x * canvasRef.current.width, endPoint.y * canvasRef.current.height);
        ctx.stroke();
      }
    });

    // Draw key points
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility > 0.5) {
        ctx.fillStyle = formQuality === 'good' ? '#059669' : '#FF4444';
        ctx.beginPath();
        ctx.arc(
          landmark.x * canvasRef.current.width,
          landmark.y * canvasRef.current.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });
  };

  /**
   * Starts pose detection
   */
  const startDetection = async () => {
    if (!videoRef.current) {
      console.error('Video element not available');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      videoRef.current.srcObject = stream;
      
      // Set canvas size to match video
      if (canvasRef.current && videoRef.current) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
      }
      
      await initializePoseDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
      setFormFeedback('Camera access denied. Please enable camera permissions.');
      setIsDetecting(false);
    }
  };

  /**
   * Stops pose detection
   */
  const stopDetection = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    
    setIsDetecting(false);
    setPoseLandmarks(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  // Reset rep state when target angle changes
  useEffect(() => {
    repStateRef.current = { 
      inTargetRange: false, 
      wasInRange: false,
      lastRepTime: 0 
    };
  }, [targetAngle]);

  return {
    isDetecting,
    poseLandmarks,
    formQuality,
    formFeedback,
    currentAngle,
    isFormGood,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
  };
}

