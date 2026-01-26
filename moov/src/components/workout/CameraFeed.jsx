import { useEffect, useRef, useState } from 'react';

/**
 * CameraFeed Component - Displays the camera feed with pose skeleton overlay
 * 
 * Features:
 * - Mirrored video display for intuitive movement
 * - Loading state with spinner
 * - Error state with message
 * - Canvas overlay for skeleton drawing
 * - Responsive sizing
 * - Camera switch button for mobile
 */
export default function CameraFeed({ 
  videoRef, 
  canvasRef, 
  isActive,
  isLoading = false,
  error = null,
  onCameraSwitch = null,
}) {
  const containerRef = useRef(null);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [facingMode, setFacingMode] = useState('user');
  const [containerSize, setContainerSize] = useState({ width: 640, height: 480 });

  // Handle container resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Set up mirroring when active
  useEffect(() => {
    if (isActive && videoRef?.current) {
      // Mirror the video feed for user-facing camera
      videoRef.current.style.transform = facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)';
    }
  }, [isActive, videoRef, facingMode]);

  // Sync canvas size with video
  useEffect(() => {
    if (canvasRef?.current && videoRef?.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const syncSize = () => {
        canvas.width = video.videoWidth || containerSize.width;
        canvas.height = video.videoHeight || containerSize.height;
      };

      video.addEventListener('loadedmetadata', syncSize);
      syncSize();

      return () => video.removeEventListener('loadedmetadata', syncSize);
    }
  }, [canvasRef, videoRef, containerSize]);

  // Toggle skeleton visibility
  const handleToggleSkeleton = () => {
    setShowSkeleton(prev => !prev);
  };

  // Switch camera (front/back)
  const handleSwitchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (onCameraSwitch) {
      onCameraSwitch(newMode);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
      >
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium">Starting camera...</p>
          <p className="text-sm text-gray-400 mt-2">Please allow camera access</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
      >
        <div className="text-center text-white p-6 max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" className="text-red-500" />
          </svg>
          <p className="text-lg font-medium text-red-400 mb-2">Camera Error</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // Inactive state
  if (!isActive) {
    return (
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
      >
        <div className="text-center text-gray-500">
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-lg">Camera not active</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black overflow-hidden"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ 
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      />
      
      {/* Canvas overlay for skeleton drawing */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full pointer-events-none transition-opacity duration-200 ${
          showSkeleton ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)',
        }}
      />
      
      {/* Camera controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {/* Toggle skeleton button */}
        <button
          onClick={handleToggleSkeleton}
          className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          title={showSkeleton ? 'Hide skeleton' : 'Show skeleton'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {showSkeleton ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            )}
          </svg>
        </button>
        
        {/* Switch camera button (for mobile) */}
        {onCameraSwitch && (
          <button
            onClick={handleSwitchCamera}
            className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            title="Switch camera"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Recording indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        <span className="text-white text-sm font-medium">LIVE</span>
      </div>
      
      {/* Skeleton visibility indicator */}
      {!showSkeleton && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-white text-sm">Skeleton hidden</span>
        </div>
      )}
    </div>
  );
}
