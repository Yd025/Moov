import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CameraFeed from '../components/workout/CameraFeed';
import SkeletonOverlay from '../components/workout/SkeletonOverlay';
import AssistantAvatar from '../components/workout/AssistantAvatar';
import { useMoovAssistant } from '../hooks/useMoovAssistant';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { getExerciseConfig, supportsAutoDetection } from '../logic/exerciseConfigs';
import { createAdaptiveEngine } from '../logic/adaptiveEngine';

/**
 * Workout Page - The core workout experience with camera, pose detection, and assistant
 * 
 * Features:
 * - Real-time camera pose detection with MediaPipe
 * - Automatic rep counting based on exercise config
 * - Adaptive difficulty adjustment
 * - Voice-guided workout experience
 * - Manual fallback for unsupported exercises
 */
export default function Workout() {
  const navigate = useNavigate();
  const location = useLocation();
  const exercises = location.state?.exercises || [];
  
  // Workout state
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const [workoutStartTime] = useState(Date.now());
  
  // Camera state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showManualButton, setShowManualButton] = useState(false);
  
  // Adaptive engine
  const [adaptiveEngine] = useState(() => createAdaptiveEngine({}));
  const [currentAdjustment, setCurrentAdjustment] = useState(null);

  const currentExercise = exercises[currentExerciseIndex];
  const exerciseConfig = currentExercise ? getExerciseConfig(currentExercise.id) : null;
  const hasAutoDetection = currentExercise && supportsAutoDetection(currentExercise.id);

  // Initialize Moov Assistant
  const {
    isSpeaking,
    showSkipButton,
    currentCue,
    speak,
    startStruggleMonitoring,
    stopStruggleMonitoring,
    introduceExercise,
    giveFormCorrection,
    setAdaptiveEncouragement,
    speakAdjustment,
    announceRest,
    announceWorkoutComplete,
  } = useMoovAssistant({
    isFormGood: true,
    repCount,
    totalReps: currentExercise?.reps || 10,
    exerciseId: currentExercise?.id,
    exerciseConfig,
  });

  // Handle rep completion from pose detection
  const handleRepComplete = useCallback((metrics = {}) => {
    const newRepCount = repCount + 1;
    setRepCount(newRepCount);
    
    // Record in adaptive engine and get adjustments
    if (adaptiveEngine && currentExercise) {
      const adjustment = adaptiveEngine.recordRepPerformance({
        repTime: metrics.repTime || 2,
        angleAchieved: metrics.angleAchieved || null,
        targetAngle: metrics.targetAngle || null,
        formScore: metrics.formScore || 1,
      });
      
      setCurrentAdjustment(adjustment);
      
      // Update assistant with encouragement type
      if (adjustment.encouragementType) {
        setAdaptiveEncouragement(adjustment.encouragementType);
      }
      
      // Speak adjustment cue if needed
      if (adjustment.suggestedCue && adjustment.encouragementType !== 'steady') {
        speakAdjustment(adjustment);
      }
    }

    // Check if exercise is complete
    if (newRepCount >= currentExercise.reps) {
      handleExerciseComplete();
    }
  }, [repCount, currentExercise, adaptiveEngine, setAdaptiveEncouragement, speakAdjustment]);

  // Handle form feedback from pose detection
  const handleFormFeedback = useCallback((feedback, severity) => {
    if (feedback) {
      giveFormCorrection(feedback, severity);
    }
  }, [giveFormCorrection]);

  // Handle performance updates from pose detection
  const handlePerformanceUpdate = useCallback((performance) => {
    // Could be used for real-time UI updates
    console.log('Performance update:', performance);
  }, []);

  // Initialize Pose Detection with callbacks
  const {
    isDetecting,
    isLoading: cameraLoading,
    error: poseError,
    formQuality,
    formFeedback,
    currentAngle,
    repPhase,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    resetTracking,
  } = usePoseDetection({
    exerciseId: currentExercise?.id,
    exerciseConfig,
    onRepComplete: hasAutoDetection ? handleRepComplete : null,
    onFormFeedback: handleFormFeedback,
    onPerformanceUpdate: handlePerformanceUpdate,
  });

  // Handle exercise completion
  const handleExerciseComplete = useCallback(() => {
    setIsResting(true);
    stopStruggleMonitoring();
    
    if (currentExerciseIndex < exercises.length - 1) {
      announceRest(5);
      setTimeout(() => {
        setIsResting(false);
        setRepCount(0);
        resetTracking();
        setCurrentExerciseIndex(prev => prev + 1);
      }, 5000);
    } else {
      // Workout complete
      const duration = Math.round((Date.now() - workoutStartTime) / 1000 / 60);
      const summary = adaptiveEngine?.getSessionSummary() || {};
      
      setWorkoutComplete(true);
      announceWorkoutComplete({ ...summary, duration });
      
      setTimeout(() => {
        navigate('/success', { 
          state: { 
            exercisesCompleted: exercises.length,
            totalReps: summary.totalReps || repCount,
            duration,
          } 
        });
      }, 3000);
    }
  }, [currentExerciseIndex, exercises.length, stopStruggleMonitoring, announceRest, announceWorkoutComplete, resetTracking, navigate, workoutStartTime, adaptiveEngine, repCount]);

  // Start camera on mount
  useEffect(() => {
    if (exercises.length === 0) {
      navigate('/home');
      return;
    }

    // Initialize adaptive engine for first exercise
    if (currentExercise && adaptiveEngine) {
      adaptiveEngine.startExercise(currentExercise);
    }

    // Start camera after a short delay
    const timer = setTimeout(async () => {
      if (hasAutoDetection) {
        try {
          const success = await startDetection();
          if (success) {
            setCameraEnabled(true);
          } else {
            setShowManualButton(true);
          }
        } catch (err) {
          console.error('Failed to start camera:', err);
          setCameraError(err.message);
          setShowManualButton(true);
        }
      } else {
        // Exercise doesn't support auto detection
        setShowManualButton(true);
      }
      
      // Introduce exercise after camera starts
      introduceExercise(currentExercise);
      startStruggleMonitoring();
    }, 500);

    return () => {
      clearTimeout(timer);
      stopStruggleMonitoring();
      stopDetection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle exercise change
  useEffect(() => {
    if (currentExerciseIndex > 0 && currentExercise) {
      // Reset state for new exercise
      setRepCount(0);
      resetTracking();
      
      // Update adaptive engine
      if (adaptiveEngine) {
        adaptiveEngine.startExercise(currentExercise);
      }
      
      // Check if new exercise supports auto detection
      const newHasAutoDetection = supportsAutoDetection(currentExercise.id);
      setShowManualButton(!newHasAutoDetection || !cameraEnabled);
      
      // Introduce new exercise
      introduceExercise(currentExercise);
      startStruggleMonitoring();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseIndex]);

  // Handle manual rep completion (fallback)
  const handleManualRep = () => {
    handleRepComplete({ formScore: 1 });
  };

  // Skip current exercise
  const handleSkip = () => {
    stopStruggleMonitoring();
    
    if (adaptiveEngine) {
      adaptiveEngine.recordSkippedExercise();
    }
    
    if (currentExerciseIndex < exercises.length - 1) {
      setRepCount(0);
      resetTracking();
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      const duration = Math.round((Date.now() - workoutStartTime) / 1000 / 60);
      navigate('/success', { 
        state: { 
          exercisesCompleted: currentExerciseIndex,
          duration,
        } 
      });
    }
  };

  // Exit workout early
  const handleFinish = () => {
    stopStruggleMonitoring();
    stopDetection();
    navigate('/home');
  };

  // Retry camera
  const handleRetryCamera = async () => {
    setCameraError(null);
    try {
      const success = await startDetection();
      if (success) {
        setCameraEnabled(true);
        setShowManualButton(false);
      }
    } catch (err) {
      setCameraError(err.message);
    }
  };

  // Workout complete screen
  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-[#121212]">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#059669] mb-4">Workout Complete!</h2>
          <p className="text-xl text-gray-600">Redirecting...</p>
          <div className="mt-8 w-16 h-16 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] relative overflow-hidden">
      {/* Camera Feed */}
      <div className="absolute inset-0">
        {cameraEnabled && isDetecting ? (
          <CameraFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            isActive={isDetecting}
            isLoading={cameraLoading}
            error={poseError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500 p-6">
              {cameraLoading ? (
                <>
                  <div className="w-16 h-16 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-lg">Starting camera...</p>
                </>
              ) : cameraError ? (
                <>
                  <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-lg mb-2 text-red-500">{cameraError}</p>
                  <button
                    onClick={handleRetryCamera}
                    className="mt-4 px-6 py-3 bg-[#059669] text-white rounded-lg hover:bg-[#047857] transition-colors"
                  >
                    Try Again
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg mb-2">
                    {hasAutoDetection ? 'Camera not available' : 'Manual tracking mode'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {hasAutoDetection 
                      ? 'Use the button below to count your reps'
                      : 'This exercise uses manual rep counting'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Bar - Counter & Exit */}
        <div className="flex justify-between items-start p-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-gray-200">
            <div className="text-sm text-gray-500">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </div>
            <div className="text-lg font-bold text-[#121212] mb-1">
              {currentExercise.name}
            </div>
            <div className="text-4xl font-bold text-[#059669]">
              {repCount} / {currentExercise.reps}
            </div>
            
            {/* Rep phase indicator (for debugging/feedback) */}
            {isDetecting && repPhase !== 'neutral' && (
              <div className="mt-2 text-xs text-gray-500">
                Phase: <span className="font-medium capitalize">{repPhase}</span>
                {currentAngle !== null && (
                  <span className="ml-2">Angle: {Math.round(currentAngle)}°</span>
                )}
              </div>
            )}
          </div>
          
          <button
            onClick={handleFinish}
            className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-[#121212] transition-colors min-h-[48px] shadow-lg border border-gray-200 font-semibold"
          >
            Exit Workout
          </button>
        </div>

        {/* Center - Form Feedback & Controls */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
          {/* Form feedback overlay */}
          <SkeletonOverlay formQuality={formQuality} formFeedback={formFeedback} />
          
          {/* Current cue display */}
          {currentCue && (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg max-w-md text-center">
              <p className="text-lg font-medium text-[#121212]">{currentCue}</p>
            </div>
          )}
          
          {/* Adaptive adjustment notification */}
          {currentAdjustment?.recommendation && currentAdjustment.recommendation !== 'same' && (
            <div className={`rounded-xl px-4 py-2 text-sm font-medium ${
              currentAdjustment.recommendation === 'easier' 
                ? 'bg-amber-100 text-amber-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {currentAdjustment.recommendation === 'easier' 
                ? 'Adjusting to easier movement' 
                : 'Great job! Increasing challenge'}
            </div>
          )}
          
          {/* Manual rep button (fallback or for non-trackable exercises) */}
          {(showManualButton || !hasAutoDetection || !cameraEnabled) && (
            <button
              onClick={handleManualRep}
              className="min-h-[80px] px-12 py-6 bg-[#059669] text-white font-bold text-2xl rounded-2xl hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 shadow-xl"
            >
              Complete Rep
            </button>
          )}
          
          {/* Instructions for camera mode */}
          {cameraEnabled && isDetecting && hasAutoDetection && !showManualButton && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 text-center max-w-md">
              <p className="text-sm text-gray-600">
                Move through the full range of motion - reps are counted automatically!
              </p>
            </div>
          )}
        </div>

        {/* Bottom Bar - Assistant & Skip */}
        <div className="flex justify-between items-end p-6">
          <AssistantAvatar isSpeaking={isSpeaking} />
          
          {showSkipButton && (
            <button
              onClick={handleSkip}
              className="min-h-[64px] px-8 py-4 bg-red-500 text-white font-bold text-xl rounded-xl hover:bg-red-600 transition-all animate-pulse focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 shadow-lg"
            >
              Skip Move
            </button>
          )}
        </div>

        {/* Rest Screen */}
        {isResting && (
          <div className="absolute inset-0 bg-[#fafafa]/95 flex items-center justify-center z-20">
            <div className="text-center">
              <h3 className="text-4xl font-bold text-[#059669] mb-4">Rest Time</h3>
              <p className="text-xl text-gray-600">Take a moment to relax</p>
              <p className="text-lg text-gray-500 mt-2">Next exercise coming up...</p>
              <div className="mt-8 w-16 h-16 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
