import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CameraFeed from '../components/workout/CameraFeed';
import SkeletonOverlay from '../components/workout/SkeletonOverlay';
import AssistantAvatar from '../components/workout/AssistantAvatar';
import { useMoovAssistant } from '../hooks/useMoovAssistant';
import { usePoseDetection } from '../hooks/usePoseDetection';

/**
 * Workout Page - The core workout experience with camera, pose detection, and assistant
 */
export default function Workout() {
  const navigate = useNavigate();
  const location = useLocation();
  const exercises = location.state?.exercises || [];
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [repCount, setRepCount] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutComplete, setWorkoutComplete] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const {
    isSpeaking,
    showSkipButton,
    struggleTimer,
    speak,
    recordRep,
    startStruggleMonitoring,
    stopStruggleMonitoring,
    giveFormCorrection,
    introduceExercise,
    countRep,
  } = useMoovAssistant();

  const {
    isDetecting,
    formQuality,
    formFeedback,
    videoRef,
    canvasRef,
    startDetection,
    stopDetection,
  } = usePoseDetection();

  useEffect(() => {
    if (exercises.length === 0) {
      navigate('/home');
      return;
    }

    // TODO: Start camera and pose detection
    // startDetection();

    // Introduce first exercise
    if (currentExercise) {
      setTimeout(() => {
        introduceExercise(currentExercise);
        startStruggleMonitoring();
      }, 1000);
    }

    return () => {
      // TODO: Stop camera and pose detection
      // stopDetection();
      stopStruggleMonitoring();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentExercise) {
      introduceExercise(currentExercise);
      startStruggleMonitoring();
      setRepCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentExerciseIndex]);

  const handleRepComplete = () => {
    const newRepCount = repCount + 1;
    setRepCount(newRepCount);
    recordRep();
    countRep(newRepCount, currentExercise.reps);

    if (newRepCount >= currentExercise.reps) {
      // Exercise complete
      setIsResting(true);
      stopStruggleMonitoring();
      
      if (currentExerciseIndex < exercises.length - 1) {
        speak('Great job! Rest for a moment, then we\'ll continue.', 0.9, 1);
        setTimeout(() => {
          setIsResting(false);
          setCurrentExerciseIndex(prev => prev + 1);
        }, 5000);
      } else {
        // Workout complete
        setWorkoutComplete(true);
        speak('Congratulations! You completed your workout!', 0.9, 1.1);
        setTimeout(() => {
          navigate('/success', { state: { exercisesCompleted: exercises.length } });
        }, 3000);
      }
    }
  };

  const handleSkip = () => {
    stopStruggleMonitoring();
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      navigate('/success', { state: { exercisesCompleted: exercises.length - 1 } });
    }
  };

  const handleFinish = () => {
    stopDetection();
    stopStruggleMonitoring();
    navigate('/home');
  };

  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#33E1ED] mb-4">Workout Complete!</h2>
          <p className="text-xl">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white relative overflow-hidden">
      {/* Camera Feed - TODO: Enable when camera is implemented */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
        {/* TODO: Uncomment when camera is ready */}
        {/* <CameraFeed
          videoRef={videoRef}
          canvasRef={canvasRef}
          isActive={isDetecting}
        /> */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg mb-2">Camera Feed Placeholder</p>
            <p className="text-sm">TODO: Implement MediaPipe Pose Detection</p>
          </div>
        </div>
      </div>

      {/* Overlay Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Top Bar - Counter */}
        <div className="flex justify-between items-start p-6">
          <div className="bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg px-6 py-3">
            <div className="text-sm text-gray-400">Exercise {currentExerciseIndex + 1} of {exercises.length}</div>
            <div className="text-4xl font-bold text-[#33E1ED]">
              {repCount} / {currentExercise.reps}
            </div>
          </div>
          
          <button
            onClick={handleFinish}
            className="bg-[#1a1a1a]/90 backdrop-blur-sm rounded-lg px-4 py-2 text-white hover:bg-[#2a2a2a] transition-colors min-h-[48px]"
          >
            Finish
          </button>
        </div>

        {/* Center - Form Feedback & Mock Rep Button */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <SkeletonOverlay formQuality={formQuality} formFeedback={formFeedback} />
          
          {/* TODO: Remove this mock button when pose detection is implemented */}
          <button
            onClick={handleRepComplete}
            className="min-h-[48px] px-8 py-4 bg-[#33E1ED] text-[#121212] font-bold text-xl rounded-lg hover:bg-[#2AC5D0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212]"
          >
            Complete Rep (Mock)
          </button>
          <p className="text-sm text-gray-500 text-center max-w-md">
            TODO: This button will be removed when MediaPipe pose detection<br />
            automatically detects completed reps from camera movement
          </p>
        </div>

        {/* Bottom Bar - Assistant & Skip */}
        <div className="flex justify-between items-end p-6">
          <AssistantAvatar isSpeaking={isSpeaking} />
          
          {showSkipButton && (
            <button
              onClick={handleSkip}
              className="min-h-[48px] px-8 py-3 bg-red-500 text-white font-bold text-lg rounded-lg hover:bg-red-600 transition-all animate-pulse focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              Skip Move
            </button>
          )}
        </div>

        {/* Rest Screen */}
        {isResting && (
          <div className="absolute inset-0 bg-[#121212]/90 flex items-center justify-center z-20">
            <div className="text-center">
              <h3 className="text-3xl font-bold text-[#33E1ED] mb-4">Rest Time</h3>
              <p className="text-xl text-gray-400">Take a moment to relax</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

