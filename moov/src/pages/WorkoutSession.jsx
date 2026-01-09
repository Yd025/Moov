import { useEffect, useRef } from 'react';
import CameraFeed from '../components/workout/CameraFeed';
import SkeletonOverlay from '../components/workout/SkeletonOverlay';
import AssistantAvatar from '../components/workout/AssistantAvatar';
import { useMoovAssistant } from '../hooks/useMoovAssistant';
import { usePoseDetection } from '../hooks/usePoseDetection';

/**
 * WorkoutSession Component - Full-screen workout interface with camera feed and reference video
 * @param {Object} props
 * @param {Object} props.exercise - Current exercise object
 * @param {number} props.repCount - Current rep count
 * @param {Function} props.onRepComplete - Callback when rep is detected
 * @param {Function} props.onSkip - Callback when skip is clicked
 * @param {Function} props.onFinish - Callback to end workout
 */
export default function WorkoutSession({ exercise, repCount, onRepComplete, onSkip, onFinish }) {
  const videoRef = useRef(null);

  const {
    isDetecting,
    formQuality,
    formFeedback,
    isFormGood,
    videoRef: poseVideoRef,
    canvasRef,
    startDetection,
    stopDetection,
  } = usePoseDetection({
    targetAngle: exercise?.targetAngle || null,
    angleRange: exercise?.angleRange || 10,
    onRepComplete,
  });

  const {
    isSpeaking,
    showSkipButton,
    currentCue,
    startStruggleMonitoring,
    stopStruggleMonitoring,
  } = useMoovAssistant({ 
    isFormGood: isFormGood ?? true,
    repCount 
  });

  // Sync video refs
  useEffect(() => {
    if (poseVideoRef.current) {
      videoRef.current = poseVideoRef.current;
    }
  }, [poseVideoRef]);

  // Start detection and struggle monitoring on mount
  useEffect(() => {
    startDetection();
    startStruggleMonitoring();
    return () => {
      stopDetection();
      stopStruggleMonitoring();
    };
  }, [startDetection, stopDetection, startStruggleMonitoring, stopStruggleMonitoring]);

  if (!exercise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Main Camera Feed - Takes up majority of screen */}
      <div className="absolute inset-0">
        <CameraFeed
          videoRef={poseVideoRef}
          canvasRef={canvasRef}
          isActive={isDetecting}
        />
        <SkeletonOverlay formQuality={formQuality} formFeedback={formFeedback} />
      </div>

      {/* Reference Video - Floating box (top-left) */}
      <div className="absolute top-4 left-4 z-20 w-64 h-48 bg-black/80 rounded-lg border-2 border-[#39ff14] overflow-hidden shadow-2xl">
        {exercise.referenceVideoUrl ? (
          <video
            src={exercise.referenceVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center p-4">
              <div className="text-[#39ff14] text-2xl font-bold mb-2">{exercise.name}</div>
              <div className="text-gray-400 text-sm">Reference Video</div>
              <div className="text-gray-500 text-xs mt-2">Placeholder</div>
            </div>
          </div>
        )}
      </div>

      {/* Rep Counter - Top Right */}
      <div className="absolute top-4 right-4 z-20 bg-black/90 backdrop-blur-sm rounded-lg px-8 py-4 border-2 border-[#39ff14] shadow-2xl">
        <div className="text-sm text-gray-400 mb-1">Reps</div>
        <div className="text-5xl font-bold text-[#39ff14]">
          {repCount} / {exercise.reps || 10}
        </div>
      </div>

      {/* Feedback Captions - Center */}
      {currentCue && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="bg-black/90 backdrop-blur-sm rounded-lg px-6 py-4 border-2 border-[#39ff14] shadow-2xl max-w-md">
            <p className="text-xl font-semibold text-[#39ff14] text-center">{currentCue}</p>
          </div>
        </div>
      )}

      {/* Assistant Avatar - Bottom Left */}
      <div className="absolute bottom-6 left-6 z-20">
        <AssistantAvatar isSpeaking={isSpeaking} />
      </div>

      {/* Skip Button - Bottom Right (fades in when showSkipButton is true) */}
      {showSkipButton && (
        <button
          onClick={onSkip}
          className={`absolute bottom-6 right-6 z-20 min-h-[64px] px-8 py-4 bg-red-600 text-white font-bold text-xl rounded-lg hover:bg-red-700 active:bg-red-800 transition-all focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 shadow-2xl border-2 border-red-400 ${
            showSkipButton ? 'animate-pulse opacity-100' : 'opacity-0'
          }`}
          aria-label="Skip current move"
        >
          Skip Move
        </button>
      )}

      {/* Finish Button - Top Right (below rep counter) */}
      <button
        onClick={onFinish}
        className="absolute top-24 right-4 z-20 bg-black/90 backdrop-blur-sm rounded-lg px-6 py-3 text-white font-bold text-lg hover:bg-gray-900 active:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 shadow-lg border-2 border-gray-600"
        aria-label="Finish workout"
      >
        Finish
      </button>
    </div>
  );
}

