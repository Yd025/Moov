/**
 * ProgressChart Component - Displays user progress with consistency and mobility metrics
 */
export default function ProgressChart({ progressData }) {
  // Mock data structure: { consistency: [days active], mobility: [range of motion %] }
  const data = progressData || {
    consistency: [0, 1, 2, 3, 4, 5, 6, 7], // Days active
    mobility: [0, 5, 8, 10, 12, 15, 18, 20], // Range of motion %
  };

  const maxConsistency = Math.max(...data.consistency, 7);
  const maxMobility = Math.max(...data.mobility, 100);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-2xl font-bold text-[#121212] mb-6">Your Progress</h3>

      {/* Consistency Chart */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-[#121212]">Consistency</span>
          <span className="text-[#059669] text-lg font-bold">
            {data.consistency[data.consistency.length - 1]} days active
          </span>
        </div>
        <div className="flex items-end gap-2 h-32 bg-gray-50 rounded-lg p-4">
          {data.consistency.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-[#059669] rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(value / maxConsistency) * 100}%`,
                minHeight: value > 0 ? '4px' : '0',
              }}
              title={`Day ${index + 1}: ${value} days active`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
          <span>Today</span>
        </div>
      </div>

      {/* Mobility Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-[#121212]">Mobility</span>
          <span className="text-[#059669] text-lg font-bold">
            {data.mobility[data.mobility.length - 1]}% range
          </span>
        </div>
        <div className="flex items-end gap-2 h-32 bg-gray-50 rounded-lg p-4">
          {data.mobility.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-[#10B981] rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(value / maxMobility) * 100}%`,
                minHeight: value > 0 ? '4px' : '0',
              }}
              title={`Day ${index + 1}: ${value}% range`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Week 1</span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}
