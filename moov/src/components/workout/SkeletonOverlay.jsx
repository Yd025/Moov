/**
 * SkeletonOverlay Component - Displays pose skeleton overlay on camera feed
 * This is handled by the canvas in CameraFeed, but this component can provide additional UI
 */
export default function SkeletonOverlay({ formQuality, formFeedback }) {
  if (!formFeedback) return null;

  return (
    <div className="absolute top-24 left-4 right-4 z-10">
      <div
        className={`p-4 rounded-xl shadow-lg ${
          formQuality === 'good'
            ? 'bg-[#059669]/90 border border-[#059669]'
            : 'bg-red-500/90 border border-red-500'
        }`}
      >
        <p className="text-white text-lg font-semibold text-center">{formFeedback}</p>
      </div>
    </div>
  );
}
