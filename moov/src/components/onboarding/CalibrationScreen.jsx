import { useState, useRef, useEffect } from 'react';

/**
 * CalibrationScreen Component - Camera-based movement range calibration
 * Captures the user's maximum comfortable range of motion
 * TODO: Integrate with MediaPipe Pose for actual skeleton detection
 */

const CALIBRATION_STATES = {
  PERMISSION: 'permission',
  POSITIONING: 'positioning',
  READY: 'ready',
  CAPTURING: 'capturing',
  SUCCESS: 'success',
  ERROR: 'error',
};

export default function CalibrationScreen({
  step,
  totalSteps,
  onComplete,
  onBack,
  onSkip,
}) {
  const [calibrationState, setCalibrationState] = useState(CALIBRATION_STATES.PERMISSION);
  const [countdown, setCountdown] = useState(3);
  const [movementBox, setMovementBox] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      // TODO: Implement actual camera access
      // const stream = await navigator.mediaDevices.getUserMedia({
      //   video: { facingMode: 'user', width: 640, height: 480 }
      // });
      // streamRef.current = stream;
      // if (videoRef.current) {
      //   videoRef.current.srcObject = stream;
      // }
      
      // Mock: Simulate camera access
      setCalibrationState(CALIBRATION_STATES.POSITIONING);
    } catch (error) {
      console.error('Camera access error:', error);
      setErrorMessage('Unable to access camera. Please check your permissions.');
      setCalibrationState(CALIBRATION_STATES.ERROR);
    }
  };

  const startCalibration = () => {
    setCalibrationState(CALIBRATION_STATES.READY);
    setCountdown(3);
    
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          captureMovementRange();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const captureMovementRange = () => {
    setCalibrationState(CALIBRATION_STATES.CAPTURING);
    
    // TODO: Implement actual MediaPipe pose detection
    // This should:
    // 1. Detect user skeleton
    // 2. Capture max X and Y coordinates of wrist joints
    // 3. Save this coordinate box as the user's "Personal Movement Box"
    
    // Mock: Simulate capture with timeout
    setTimeout(() => {
      // Mock movement box data
      const mockMovementBox = {
        // Normalized coordinates (0-1 range)
        leftWrist: { maxX: 0.15, maxY: 0.25, minX: 0.2, minY: 0.7 },
        rightWrist: { maxX: 0.85, maxY: 0.25, minX: 0.8, minY: 0.7 },
        overheadReach: 0.25, // Y coordinate at max height
        sideReach: { left: 0.15, right: 0.85 }, // X coordinates at max width
        calibratedAt: new Date().toISOString(),
      };
      
      setMovementBox(mockMovementBox);
      setCalibrationState(CALIBRATION_STATES.SUCCESS);
    }, 2000);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(movementBox);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      // Default movement box for skipped calibration
      const defaultMovementBox = {
        leftWrist: { maxX: 0.1, maxY: 0.2, minX: 0.25, minY: 0.6 },
        rightWrist: { maxX: 0.9, maxY: 0.2, minX: 0.75, minY: 0.6 },
        overheadReach: 0.2,
        sideReach: { left: 0.1, right: 0.9 },
        calibratedAt: null,
        skipped: true,
      };
      onSkip(defaultMovementBox);
    }
  };

  const retryCalibration = () => {
    setErrorMessage('');
    setCalibrationState(CALIBRATION_STATES.PERMISSION);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#fafafa] text-[#121212]">
      <div className="w-full max-w-md space-y-6">
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

        {/* Permission State */}
        {calibrationState === CALIBRATION_STATES.PERMISSION && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-[#059669]/10 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Let's Calibrate Your Range</h1>
            <p className="text-gray-600">
              Position your device so you're in the frame. We'll customize the AI to YOUR comfortable movement range.
            </p>
            <button
              onClick={requestCameraPermission}
              className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
            >
              Enable Camera
            </button>
            <button
              onClick={handleSkip}
              className="w-full min-h-[48px] px-6 py-2 text-gray-600 hover:text-[#121212] transition-colors"
            >
              Skip for now (use defaults)
            </button>
          </div>
        )}

        {/* Positioning State */}
        {calibrationState === CALIBRATION_STATES.POSITIONING && (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold">Position Yourself</h1>
            
            {/* Camera preview placeholder */}
            <div className="relative bg-white rounded-2xl overflow-hidden aspect-[4/3] border-2 border-dashed border-gray-300 shadow-sm">
              {/* TODO: Replace with actual video feed */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="text-sm">Camera Preview</p>
                  <p className="text-xs text-gray-400 mt-1">TODO: MediaPipe integration</p>
                </div>
              </div>
              
              {/* Skeleton guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1/2 h-3/4 border-2 border-[#059669]/30 rounded-lg" />
              </div>
            </div>

            <p className="text-gray-600 text-lg">
              Make sure your full upper body is visible in the frame
            </p>

            <button
              onClick={startCalibration}
              className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
            >
              I'm Ready - Start Calibration
            </button>
          </div>
        )}

        {/* Ready/Countdown State */}
        {calibrationState === CALIBRATION_STATES.READY && (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold">Get Ready!</h1>
            
            <div className="bg-white rounded-2xl p-8 aspect-[4/3] flex items-center justify-center shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="text-8xl font-bold text-[#059669] animate-pulse">
                  {countdown}
                </div>
                <p className="text-xl text-gray-600 mt-4">
                  Stretch your arms as wide and high as comfortable
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Capturing State */}
        {calibrationState === CALIBRATION_STATES.CAPTURING && (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-[#059669]">Hold Still...</h1>
            
            <div className="bg-white rounded-2xl p-8 aspect-[4/3] flex items-center justify-center shadow-sm border border-gray-200">
              <div className="text-center">
                <div className="w-20 h-20 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xl text-gray-600 mt-6">
                  Capturing your movement range...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {calibrationState === CALIBRATION_STATES.SUCCESS && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-green-600">Calibration Complete!</h1>
            <p className="text-gray-600 text-lg">
              We've customized the AI to YOUR range. Every movement will be measured against what's comfortable for you.
            </p>

            {/* Movement box visualization */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Your Personal Movement Box</h3>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#059669]">↕</div>
                  <div className="text-sm text-gray-600">Vertical Range</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#059669]">↔</div>
                  <div className="text-sm text-gray-600">Horizontal Range</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleComplete}
              className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        )}

        {/* Error State */}
        {calibrationState === CALIBRATION_STATES.ERROR && (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-red-600">Camera Error</h1>
            <p className="text-gray-600">{errorMessage}</p>

            <div className="space-y-3">
              <button
                onClick={retryCalibration}
                className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] transition-colors shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={handleSkip}
                className="w-full min-h-[48px] px-6 py-2 text-gray-600 hover:text-[#121212] transition-colors"
              >
                Skip for now (use defaults)
              </button>
            </div>
          </div>
        )}

        {/* Back button (only in permission/positioning states) */}
        {(calibrationState === CALIBRATION_STATES.PERMISSION || 
          calibrationState === CALIBRATION_STATES.POSITIONING ||
          calibrationState === CALIBRATION_STATES.ERROR) && step > 1 && (
          <button
            onClick={onBack}
            className="w-full min-h-[64px] px-6 py-4 bg-gray-200 text-[#121212] font-bold text-xl rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors shadow-lg mt-4"
          >
            Back
          </button>
        )}
      </div>
    </div>
  );
}
