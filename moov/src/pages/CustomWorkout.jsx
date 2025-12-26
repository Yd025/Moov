import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { exercises } from '../logic/exerciseDB';

/**
 * Custom Workout Page - Allows users to create custom workout plans
 */
export default function CustomWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedExercises, setSelectedExercises] = useState({});
  const [exerciseReps, setExerciseReps] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Initialize reps with default values
    const defaultReps = {};
    exercises.forEach(ex => {
      defaultReps[ex.id] = ex.reps;
    });
    setExerciseReps(defaultReps);
  }, [user, navigate]);

  const toggleExercise = (exerciseId) => {
    setSelectedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const updateReps = (exerciseId, newReps) => {
    const reps = Math.max(1, Math.min(100, parseInt(newReps) || 1));
    setExerciseReps(prev => ({
      ...prev,
      [exerciseId]: reps
    }));
  };

  const handleStartWorkout = () => {
    const selectedExerciseList = exercises
      .filter(ex => selectedExercises[ex.id])
      .map(ex => ({
        ...ex,
        reps: exerciseReps[ex.id] || ex.reps
      }));

    if (selectedExerciseList.length === 0) {
      alert('Please select at least one exercise to start your workout.');
      return;
    }

    navigate('/workout', { state: { exercises: selectedExerciseList } });
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  const selectedCount = Object.values(selectedExercises).filter(Boolean).length;

  // Group exercises by category
  const exercisesByCategory = {
    'Upper Body': exercises.filter(ex => 
      ex.tags.includes('upper_body') || ex.tags.includes('arms') || ex.tags.includes('back')
    ),
    'Lower Body': exercises.filter(ex => 
      ex.tags.includes('lower_body') || ex.tags.includes('legs')
    ),
    'Core/Abdomen': exercises.filter(ex => 
      ex.tags.includes('core') || ex.tags.includes('abdomen')
    ),
    'Wellness': exercises.filter(ex => 
      ex.tags.includes('wellness') || ex.tags.includes('stretching')
    ),
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackClick}
            className="min-h-[64px] min-w-[64px] p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#059669] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 shadow-sm"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#059669]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-[#059669] mb-2">Customize Your Workout</h1>
            <p className="text-xl text-gray-600">
              Select exercises and set your repetitions
              {selectedCount > 0 && (
                <span className="ml-2 text-[#059669] font-semibold">
                  ({selectedCount} {selectedCount === 1 ? 'exercise' : 'exercises'} selected)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleStartWorkout}
            disabled={selectedCount === 0}
            className="min-h-[64px] px-8 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
            aria-label="Start custom workout"
          >
            Start Workout
          </button>
        </div>

        {/* Exercise Categories */}
        {Object.entries(exercisesByCategory).map(([category, categoryExercises]) => (
          <section key={category} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-[#121212] mb-6 pb-2 border-b border-gray-200">
              {category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryExercises.map((exercise) => {
                const isSelected = selectedExercises[exercise.id] || false;
                const reps = exerciseReps[exercise.id] || exercise.reps;

                return (
                  <div
                    key={exercise.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      isSelected
                        ? 'border-[#059669] bg-[#059669]/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {/* Exercise Selection Button */}
                    <button
                      onClick={() => toggleExercise(exercise.id)}
                      className={`w-full min-h-[64px] mb-4 px-4 py-3 rounded-lg font-bold text-lg transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                        isSelected
                          ? 'bg-[#059669] text-white hover:bg-[#047857] focus:ring-[#059669]'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400'
                      }`}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${exercise.name}`}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? '✓ Selected' : 'Select Exercise'}
                    </button>

                    {/* Exercise Info */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-[#121212] mb-2">{exercise.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{exercise.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded">{exercise.difficulty}</span>
                        {exercise.tags.includes('seated') && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">Seated</span>
                        )}
                        {exercise.tags.includes('wheelchair_friendly') && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Wheelchair Friendly</span>
                        )}
                      </div>
                    </div>

                    {/* Reps Input - Only show if selected */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label
                          htmlFor={`reps-${exercise.id}`}
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Repetitions
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateReps(exercise.id, reps - 1)}
                            className="min-h-[64px] min-w-[64px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-2xl rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2"
                            aria-label="Decrease repetitions"
                          >
                            −
                          </button>
                          <input
                            id={`reps-${exercise.id}`}
                            type="number"
                            min="1"
                            max="100"
                            value={reps}
                            onChange={(e) => updateReps(exercise.id, e.target.value)}
                            className="flex-1 min-h-[64px] text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-[#059669] focus:border-[#059669]"
                            aria-label={`Repetitions for ${exercise.name}`}
                          />
                          <button
                            onClick={() => updateReps(exercise.id, reps + 1)}
                            className="min-h-[64px] min-w-[64px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-2xl rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2"
                            aria-label="Increase repetitions"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Start Workout Button - Fixed at bottom for mobile */}
        <div className="sticky bottom-6 bg-white border-2 border-[#059669] rounded-lg p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-[#121212]">
                {selectedCount === 0
                  ? 'Select at least one exercise to start'
                  : `${selectedCount} ${selectedCount === 1 ? 'exercise' : 'exercises'} ready`}
              </p>
              {selectedCount > 0 && (
                <p className="text-sm text-gray-600">
                  Total duration: ~{Math.round(
                    exercises
                      .filter(ex => selectedExercises[ex.id])
                      .reduce((sum, ex) => sum + (ex.duration || 60), 0) / 60
                  )} minutes
                </p>
              )}
            </div>
            <button
              onClick={handleStartWorkout}
              disabled={selectedCount === 0}
              className="w-full sm:w-auto min-h-[64px] px-12 py-4 bg-[#059669] text-white font-bold text-2xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400"
              aria-label="Start custom workout"
            >
              Start Custom Workout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

