import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Success/Accomplishment Page - Shows workout completion with stats and confetti
 */
export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const exercisesCompleted = location.state?.exercisesCompleted || 0;
  
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Confetti animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleBackToHome = () => {
    navigate('/home');
    // Scroll to progress section
    setTimeout(() => {
      const progressSection = document.getElementById('progress');
      if (progressSection) {
        progressSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
                backgroundColor: ['#059669', '#10B981', '#34D399', '#6EE7B7'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center space-y-8 max-w-md z-10">
        {/* Success Icon */}
        <div className="mx-auto w-28 h-28 bg-[#059669] rounded-full flex items-center justify-center shadow-xl">
          <svg
            className="w-14 h-14 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-[#059669]">Congratulations!</h1>

        {/* Stats */}
        <div className="space-y-4 bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div>
            <div className="text-4xl font-bold text-[#121212] mb-2">
              {exercisesCompleted} {exercisesCompleted === 1 ? 'Exercise' : 'Exercises'}
            </div>
            <div className="text-gray-600 text-lg">Completed Today</div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="text-3xl font-bold text-[#059669] mb-2">12 minutes</div>
            <div className="text-gray-600 text-lg">You moved for</div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="text-3xl font-bold text-[#059669] mb-2">+5%</div>
            <div className="text-gray-600 text-lg">Shoulder Mobility</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleBackToHome}
            className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
          >
            Back to Home
          </button>

          <button
            onClick={() => navigate('/home', { state: { scrollToProgress: true } })}
            className="w-full min-h-[64px] px-6 py-4 bg-gray-200 text-[#121212] font-bold text-xl rounded-lg hover:bg-gray-300 active:bg-gray-400 transition-colors shadow-lg"
          >
            See My Progress
          </button>
        </div>
      </div>
    </div>
  );
}
