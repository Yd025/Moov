/**
 * WorkoutCard Component - Displays a workout exercise card on the dashboard
 */
export default function WorkoutCard({ exercise, onStart, index }) {
  if (!exercise) return null;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#059669]/50 transition-colors shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[#059669] text-sm font-medium mb-1">Exercise {index + 1}</div>
          <h3 className="text-xl font-bold text-[#121212] mb-2">{exercise.name}</h3>
          <p className="text-gray-600 text-base">{exercise.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="font-medium">{exercise.reps} reps</span>
          <span>•</span>
          <span>{exercise.duration}s</span>
          <span>•</span>
          <span className="capitalize">{exercise.difficulty}</span>
        </div>
        <button
          onClick={() => onStart && onStart(exercise)}
          className="min-h-[48px] px-6 py-2 bg-[#059669] text-white font-bold text-lg rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 shadow-md"
        >
          Start
        </button>
      </div>
    </div>
  );
}
