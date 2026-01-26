import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CameraFeed from '../components/workout/CameraFeed';
import { useMoovAssistant } from '../hooks/useMoovAssistant';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { getExerciseConfig, supportsAutoDetection } from '../logic/exerciseConfigs';
import { createAdaptiveEngine } from '../logic/adaptiveEngine';

/**
 * Workout Page - Camera-focused workout experience with pose detection
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
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraErrorMessage, setCameraErrorMessage] = useState('');
  const [manualMode, setManualMode] = useState(false);
  
  // Adaptive engine
  const [adaptiveEngine] = useState(() => createAdaptiveEngine({}));

  const currentExercise = exercises[currentExerciseIndex];
  const exerciseConfig = currentExercise ? getExerciseConfig(currentExercise.id) : null;
  const hasAutoDetection = currentExercise && supportsAutoDetection(currentExercise.id);
  const progressPercent = currentExercise ? (repCount / currentExercise.reps) * 100 : 0;

  // Initialize Moov Assistant
  const {
    isSpeaking,
    showSkipButton,
    currentCue,
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

  // Handle rep completion
  const handleRepComplete = useCallback((metrics = {}) => {
    const newRepCount = repCount + 1;
    setRepCount(newRepCount);
    
    if (adaptiveEngine && currentExercise) {
      const adjustment = adaptiveEngine.recordRepPerformance({
        repTime: metrics.repTime || 2,
        angleAchieved: metrics.angleAchieved || null,
        targetAngle: metrics.targetAngle || null,
        formScore: metrics.formScore || 1,
      });
      
      if (adjustment.encouragementType) {
        setAdaptiveEncouragement(adjustment.encouragementType);
      }
      
      if (adjustment.suggestedCue && adjustment.encouragementType !== 'steady') {
        speakAdjustment(adjustment);
      }
    }

    if (newRepCount >= currentExercise.reps) {
      handleExerciseComplete();
    }
  }, [repCount, currentExercise, adaptiveEngine, setAdaptiveEncouragement, speakAdjustment]);

  // Handle form feedback
  const handleFormFeedback = useCallback((feedback, severity) => {
    if (feedback) {
      giveFormCorrection(feedback, severity);
    }
  }, [giveFormCorrection]);

  // Initialize Pose Detection
  const {
    isDetecting,
    isLoading: cameraLoading,
    formFeedback,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
    resetTracking,
  } = usePoseDetection({
    exerciseId: currentExercise?.id,
    exerciseConfig,
    onRepComplete: hasAutoDetection && !manualMode ? handleRepComplete : null,
    onFormFeedback: handleFormFeedback,
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

    if (currentExercise && adaptiveEngine) {
      adaptiveEngine.startExercise(currentExercise);
    }

    // Try to start camera
    const timer = setTimeout(async () => {
      try {
        const success = await startDetection();
        if (success) {
          setCameraEnabled(true);
          introduceExercise(currentExercise);
          startStruggleMonitoring();
        } else {
          // Camera failed - show modal
          setCameraErrorMessage('Unable to access your camera. You can continue with manual rep counting.');
          setShowCameraModal(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setCameraErrorMessage(err.message || 'Camera is currently unavailable. You can continue with manual rep counting.');
        setShowCameraModal(true);
      }
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
      setRepCount(0);
      resetTracking();
      
      if (adaptiveEngine) {
        adaptiveEngine.startExercise(currentExercise);
      }
      
      introduceExercise(currentExercise);
      startStruggleMonitoring();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseIndex]);

  // Continue with manual mode
  const handleContinueManual = () => {
    setShowCameraModal(false);
    setManualMode(true);
    introduceExercise(currentExercise);
    startStruggleMonitoring();
  };

  // Exit from modal
  const handleExitFromModal = () => {
    setShowCameraModal(false);
    stopDetection();
    navigate('/home');
  };

  const handleManualRep = () => {
    handleRepComplete({ formScore: 1 });
  };

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
      navigate('/success', { state: { exercisesCompleted: currentExerciseIndex, duration } });
    }
  };

  const handleFinish = () => {
    stopStruggleMonitoring();
    stopDetection();
    navigate('/home');
  };

  // Workout complete screen
  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-4">Workout Complete!</h2>
          <p className="text-xl text-white/80">Amazing work today!</p>
          <div className="mt-8 w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Camera Feed - Full Screen Background */}
      <div className="absolute inset-0">
        {cameraEnabled && isDetecting && !manualMode ? (
          <CameraFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            isActive={isDetecting}
            isLoading={cameraLoading}
          />
        ) : (
          // Placeholder when camera not active
          <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#059669]/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-[#059669]/5 rounded-full blur-2xl" />
            </div>
            
            {/* Manual mode indicator */}
            {manualMode && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center opacity-20">
                  <svg className="w-32 h-32 mx-auto text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-4 text-lg">Manual Mode</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Camera Unavailable Modal */}
      {showCameraModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-700">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" className="text-amber-400" />
              </svg>
            </div>
            
            {/* Title */}
            <h3 className="text-xl font-bold text-white text-center mb-2">
              Camera Unavailable
            </h3>
            
            {/* Message */}
            <p className="text-slate-400 text-center mb-8">
              {cameraErrorMessage}
            </p>
            
            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleContinueManual}
                className="w-full py-4 bg-[#059669] text-white font-semibold rounded-xl hover:bg-[#047857] transition-colors"
              >
                Continue Workout
              </button>
              <button
                onClick={handleExitFromModal}
                className="w-full py-4 bg-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main UI Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          {/* Exercise info */}
          <div className="bg-black/40 backdrop-blur-md rounded-2xl px-5 py-4 border border-white/10">
            <p className="text-[#059669] text-xs font-semibold uppercase tracking-wider mb-1">
              Exercise {currentExerciseIndex + 1}/{exercises.length}
            </p>
            <h2 className="text-xl font-bold text-white">{currentExercise.name}</h2>
          </div>
          
          {/* Exit button */}
          <button
            onClick={handleFinish}
            className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Center Content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Rep Counter */}
          <div className="relative mb-6">
            {/* Progress ring */}
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                className="text-white/10"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeLinecap="round"
                className="text-[#059669] transition-all duration-500"
                strokeDasharray={553}
                strokeDashoffset={553 - (553 * progressPercent) / 100}
              />
            </svg>
            
            {/* Counter in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold text-white">{repCount}</span>
              <span className="text-white/40 text-sm mt-1">of {currentExercise.reps}</span>
            </div>
          </div>

          {/* Form feedback */}
          {formFeedback && (
            <div className="mb-4 px-5 py-3 bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl">
              <p className="text-amber-300 text-center text-sm font-medium">{formFeedback}</p>
            </div>
          )}

          {/* Current cue */}
          {currentCue && (
            <div className="mb-6 px-5 py-3 bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 max-w-xs">
              <p className="text-white text-center text-sm">{currentCue}</p>
            </div>
          )}

          {/* Manual Rep Button - Only show in manual mode */}
          {manualMode && (
            <button
              onClick={handleManualRep}
              className="group relative"
            >
              {/* Outer glow */}
              <div className="absolute inset-0 bg-[#059669] rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity" />
              
              {/* Button */}
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-white font-bold text-sm">TAP</span>
                </div>
              </div>
            </button>
          )}

          {/* Camera mode status */}
          {cameraEnabled && isDetecting && !manualMode && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#059669]/20 backdrop-blur-sm rounded-full border border-[#059669]/30">
              <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
              <span className="text-[#059669] text-sm font-medium">Tracking Active</span>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-end">
          {/* Assistant indicator */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-[#059669] to-[#047857] flex items-center justify-center shadow-lg ${isSpeaking ? 'ring-4 ring-[#059669]/30' : ''}`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            {isSpeaking && (
              <div className="flex gap-1 items-end">
                <div className="w-1 h-3 bg-[#059669] rounded-full animate-pulse" />
                <div className="w-1 h-5 bg-[#059669] rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-3 bg-[#059669] rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
          </div>
          
          {/* Mode indicator */}
          <div className="text-center">
            <span className="text-xs text-white/40">
              {manualMode ? 'Manual Mode' : cameraEnabled ? 'Camera Mode' : ''}
            </span>
          </div>
          
          {/* Skip button */}
          {showSkipButton && (
            <button
              onClick={handleSkip}
              className="px-5 py-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-all text-sm"
            >
              Skip
            </button>
          )}
        </div>

        {/* Rest Screen Overlay */}
        {isResting && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-20">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#059669]/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Rest Time</h3>
              <p className="text-white/50 mb-6">Great job! Take a breather.</p>
              <p className="text-[#059669] font-medium">Next exercise coming up...</p>
              <div className="mt-6 flex justify-center gap-2">
                <div className="w-2 h-2 bg-[#059669] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-[#059669] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
