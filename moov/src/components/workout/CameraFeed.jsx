import { useEffect, useRef } from 'react';

/**
 * CameraFeed Component - Displays the camera feed with mirroring
 */
export default function CameraFeed({ videoRef, canvasRef, isActive }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (isActive && videoRef?.current) {
      // Mirror the video feed
      videoRef.current.style.transform = 'scaleX(-1)';
    }
  }, [isActive, videoRef]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

