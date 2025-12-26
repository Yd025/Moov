import { useState } from 'react';

/**
 * WorkoutPlanCard Component - Displays a workout plan card on the dashboard
 */
export default function WorkoutPlanCard({ workoutPlan, exercises, onStart }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!workoutPlan) return null;

  // Calculate total duration and exercise count
  const exerciseCount = workoutPlan.exerciseIds?.length || 0;
  const durationMinutes = Math.round(workoutPlan.estimatedDuration / 60);

  const handleCardClick = (e) => {
    // Don't expand if clicking on the Start Plan button
    if (e.target.closest('button')) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className="bg-white rounded-lg p-6 border border-gray-200 hover:border-[#059669]/50 transition-colors cursor-pointer shadow-sm"
      onClick={handleCardClick}
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3 flex-1">
            <h3 className="text-xl font-bold text-[#121212]">{workoutPlan.name}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-[#059669] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <span className="px-3 py-1 bg-[#059669]/10 text-[#059669] text-xs font-semibold rounded-full">
            {workoutPlan.difficulty}
          </span>
        </div>
        <p className="text-gray-600 text-base mb-4">{workoutPlan.description}</p>
        
        {/* Exercise list - expandable */}
        {exercises && exercises.length > 0 && (
          <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-3 font-medium">Exercises in this plan:</p>
              <div className="space-y-3">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-[#059669]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#059669] text-sm font-semibold">Exercise {index + 1}</span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-600 text-sm">{exercise.reps} reps</span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-600 text-sm">{exercise.duration}s</span>
                        </div>
                        <h4 className="text-[#121212] font-semibold mb-1">{exercise.name}</h4>
                        <p className="text-gray-600 text-sm">{exercise.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{exerciseCount} exercises</span>
          <span>•</span>
          <span>~{durationMinutes} min</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStart && onStart(exercises || []);
          }}
          className="w-[40%] min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-white shadow-lg"
          aria-label="Start workout plan"
        >
          Start Plan
        </button>
      </div>
    </div>
  );
}

