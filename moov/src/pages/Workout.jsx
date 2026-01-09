import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WorkoutSession from './WorkoutSession';
import { useMoovAssistant } from '../hooks/useMoovAssistant';

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
  
  // Assistant hook for exercise introduction and workout-level feedback
  const {
    speak,
    introduceExercise,
    startStruggleMonitoring,
    stopStruggleMonitoring,
  } = useMoovAssistant({ isFormGood: true, repCount: 0 });

  useEffect(() => {
    if (exercises.length === 0) {
      navigate('/home');
      return;
    }

    // Introduce first exercise
    if (currentExercise) {
      setTimeout(() => {
        introduceExercise(currentExercise);
        startStruggleMonitoring();
      }, 1000);
    }

    return () => {
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
    stopStruggleMonitoring();
    navigate('/home');
  };

  if (workoutComplete) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-[#39ff14] mb-4">Workout Complete!</h2>
          <p className="text-xl">Redirecting...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
  }

  return (
    <>
      <WorkoutSession
        exercise={currentExercise}
        repCount={repCount}
        onRepComplete={handleRepComplete}
        onSkip={handleSkip}
        onFinish={handleFinish}
      />
      
      {/* Rest Screen Overlay */}
      {isResting && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-[#39ff14] mb-4">Rest Time</h3>
            <p className="text-2xl text-white">Take a moment to relax</p>
          </div>
        </div>
      )}
    </>
  );
}

