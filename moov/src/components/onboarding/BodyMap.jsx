import { useState, useEffect } from 'react';

/**
 * BodyMap Component - Interactive body map for selecting pain/restriction zones
 * Users can tap body areas to flag them as "red zones" to avoid
 */

const BODY_ZONES = [
  { id: 'head_neck', label: 'Head / Neck', x: 50, y: 8, width: 20, height: 8 },
  { id: 'left_shoulder', label: 'Left Shoulder', x: 25, y: 18, width: 15, height: 8 },
  { id: 'right_shoulder', label: 'Right Shoulder', x: 60, y: 18, width: 15, height: 8 },
  { id: 'chest', label: 'Chest', x: 35, y: 22, width: 30, height: 12 },
  { id: 'upper_back', label: 'Upper Back', x: 35, y: 22, width: 30, height: 12, isBack: true },
  { id: 'left_arm', label: 'Left Arm', x: 15, y: 26, width: 12, height: 20 },
  { id: 'right_arm', label: 'Right Arm', x: 73, y: 26, width: 12, height: 20 },
  { id: 'left_elbow', label: 'Left Elbow', x: 12, y: 35, width: 10, height: 8 },
  { id: 'right_elbow', label: 'Right Elbow', x: 78, y: 35, width: 10, height: 8 },
  { id: 'left_wrist_hand', label: 'Left Wrist / Hand', x: 8, y: 48, width: 12, height: 10 },
  { id: 'right_wrist_hand', label: 'Right Wrist / Hand', x: 80, y: 48, width: 12, height: 10 },
  { id: 'core_abdomen', label: 'Core / Abdomen', x: 35, y: 35, width: 30, height: 12 },
  { id: 'lower_back', label: 'Lower Back', x: 35, y: 45, width: 30, height: 10 },
  { id: 'hips', label: 'Hips', x: 30, y: 48, width: 40, height: 8 },
  { id: 'left_thigh', label: 'Left Thigh', x: 30, y: 56, width: 15, height: 15 },
  { id: 'right_thigh', label: 'Right Thigh', x: 55, y: 56, width: 15, height: 15 },
  { id: 'left_knee', label: 'Left Knee', x: 30, y: 70, width: 12, height: 8 },
  { id: 'right_knee', label: 'Right Knee', x: 58, y: 70, width: 12, height: 8 },
  { id: 'left_lower_leg', label: 'Left Lower Leg', x: 30, y: 78, width: 12, height: 12 },
  { id: 'right_lower_leg', label: 'Right Lower Leg', x: 58, y: 78, width: 12, height: 12 },
  { id: 'left_ankle_foot', label: 'Left Ankle / Foot', x: 28, y: 90, width: 14, height: 8 },
  { id: 'right_ankle_foot', label: 'Right Ankle / Foot', x: 58, y: 90, width: 14, height: 8 },
];

export default function BodyMap({
  step,
  totalSteps,
  title,
  instruction,
  selectedZones = [],
  onSelect,
  onNext,
  onBack,
}) {
  const [localZones, setLocalZones] = useState(selectedZones);

  useEffect(() => {
    setLocalZones(selectedZones);
  }, [selectedZones]);

  const toggleZone = (zoneId) => {
    const newZones = localZones.includes(zoneId)
      ? localZones.filter(z => z !== zoneId)
      : [...localZones, zoneId];
    setLocalZones(newZones);
    if (onSelect) {
      onSelect(newZones);
    }
  };

  const isSelected = (zoneId) => localZones.includes(zoneId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#fafafa] text-[#121212]">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress indicator */}
        <div className="text-center space-y-2">
          <div className="flex justify-center gap-2">
            {Array.from({ length: totalSteps || 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i + 1 <= step ? 'bg-[#059669]' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-[#059669] text-lg font-medium">Step {step} of {totalSteps || 5}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center leading-tight text-[#121212]">
          {title}
        </h1>

        {/* Instruction */}
        {instruction && (
          <p className="text-gray-600 text-center">{instruction}</p>
        )}

        {/* Body Map */}
        <div className="relative bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <svg
            viewBox="0 0 100 100"
            className="w-full max-w-xs mx-auto"
            style={{ aspectRatio: '1/1.2' }}
          >
            {/* Simple body outline */}
            <ellipse cx="50" cy="10" rx="12" ry="10" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="38" y="18" width="24" height="30" rx="4" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="20" y="20" width="18" height="8" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="62" y="20" width="18" height="8" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="15" y="28" width="8" height="25" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="77" y="28" width="8" height="25" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="35" y="48" width="30" height="10" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="35" y="58" width="12" height="30" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="53" y="58" width="12" height="30" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="33" y="88" width="14" height="8" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
            <rect x="53" y="88" width="14" height="8" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="0.5" />
          </svg>

          {/* Clickable zones overlay */}
          <div className="absolute inset-0 p-4">
            <div className="relative w-full max-w-xs mx-auto" style={{ aspectRatio: '1/1.2' }}>
              {BODY_ZONES.filter(z => !z.isBack).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => toggleZone(zone.id)}
                  className={`absolute rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#059669] ${
                    isSelected(zone.id)
                      ? 'bg-red-500/60 border-2 border-red-500'
                      : 'bg-transparent hover:bg-[#059669]/20 border border-transparent hover:border-[#059669]/50'
                  }`}
                  style={{
                    left: `${zone.x}%`,
                    top: `${zone.y}%`,
                    width: `${zone.width}%`,
                    height: `${zone.height}%`,
                  }}
                  title={zone.label}
                  aria-label={`Toggle ${zone.label} ${isSelected(zone.id) ? '(selected)' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/60 border border-red-500" />
            <span className="text-gray-600">Avoid this area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border border-gray-300" />
            <span className="text-gray-600">No restriction</span>
          </div>
        </div>

        {/* Selected zones list */}
        {localZones.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-red-600 font-semibold mb-2">Areas to avoid:</h3>
            <div className="flex flex-wrap gap-2">
              {localZones.map(zoneId => {
                const zone = BODY_ZONES.find(z => z.id === zoneId);
                return (
                  <span
                    key={zoneId}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {zone?.label}
                    <button
                      onClick={() => toggleZone(zoneId)}
                      className="hover:text-red-900"
                      aria-label={`Remove ${zone?.label}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-4 pt-4">
          {step > 1 && (
            <button
              onClick={onBack}
              className="flex-1 min-h-[64px] px-6 py-4 bg-gray-200 text-[#121212] font-bold text-xl rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="flex-1 min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
          >
            {localZones.length === 0 ? 'Skip (No restrictions)' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
