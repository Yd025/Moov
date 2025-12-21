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
    <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6">Your Progress</h3>

      {/* Consistency Chart */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Consistency</span>
          <span className="text-[#33E1ED] text-lg font-bold">
            {data.consistency[data.consistency.length - 1]} days active
          </span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {data.consistency.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-[#33E1ED] rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(value / maxConsistency) * 100}%`,
                minHeight: value > 0 ? '4px' : '0',
              }}
              title={`Day ${index + 1}: ${value} days active`}
            />
          ))}
        </div>
      </div>

      {/* Mobility Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-white">Mobility</span>
          <span className="text-[#33E1ED] text-lg font-bold">
            {data.mobility[data.mobility.length - 1]}% range
          </span>
        </div>
        <div className="flex items-end gap-2 h-32">
          {data.mobility.map((value, index) => (
            <div
              key={index}
              className="flex-1 bg-[#33E1ED] rounded-t transition-all hover:opacity-80"
              style={{
                height: `${(value / maxMobility) * 100}%`,
                minHeight: value > 0 ? '4px' : '0',
              }}
              title={`Day ${index + 1}: ${value}% range`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

