/**
 * SkeletonOverlay Component - Displays pose skeleton overlay on camera feed
 * This is handled by the canvas in CameraFeed, but this component can provide additional UI
 */
export default function SkeletonOverlay({ formQuality, formFeedback }) {
  if (!formFeedback) return null;

  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <div
        className={`p-4 rounded-lg ${
          formQuality === 'good'
            ? 'bg-[#33E1ED]/20 border border-[#33E1ED]'
            : 'bg-red-500/20 border border-red-500'
        }`}
      >
        <p className="text-white text-lg font-semibold">{formFeedback}</p>
      </div>
    </div>
  );
}

