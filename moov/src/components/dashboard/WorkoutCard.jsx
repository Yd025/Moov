/**
 * WorkoutCard Component - Displays a workout exercise card on the dashboard
 */
export default function WorkoutCard({ exercise, onStart, index }) {
  if (!exercise) return null;

  return (
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 hover:border-[#33E1ED]/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[#33E1ED] text-sm font-medium mb-1">Exercise {index + 1}</div>
          <h3 className="text-xl font-bold text-white mb-2">{exercise.name}</h3>
          <p className="text-gray-400 text-base">{exercise.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{exercise.reps} reps</span>
          <span>•</span>
          <span>{exercise.duration}s</span>
        </div>
        <button
          onClick={() => onStart && onStart(exercise)}
          className="min-h-[48px] px-6 py-2 bg-[#33E1ED] text-[#121212] font-semibold text-lg rounded-lg hover:bg-[#2AC5D0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
        >
          Start
        </button>
      </div>
    </div>
  );
}

