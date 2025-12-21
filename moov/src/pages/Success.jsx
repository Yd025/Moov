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
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#33E1ED] rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="text-center space-y-8 max-w-md z-10">
        {/* Success Icon */}
        <div className="mx-auto w-24 h-24 bg-[#33E1ED] rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[#121212]"
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
        <h1 className="text-5xl font-bold text-[#33E1ED]">Congratulations!</h1>

        {/* Stats */}
        <div className="space-y-4 bg-[#1a1a1a] rounded-lg p-6 border border-gray-800">
          <div>
            <div className="text-3xl font-bold text-white mb-2">
              {exercisesCompleted} {exercisesCompleted === 1 ? 'Exercise' : 'Exercises'}
            </div>
            <div className="text-gray-400 text-lg">Completed Today</div>
          </div>
          
          <div className="border-t border-gray-800 pt-4">
            <div className="text-2xl font-bold text-[#33E1ED] mb-2">12 minutes</div>
            <div className="text-gray-400 text-lg">You moved for</div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <div className="text-2xl font-bold text-[#33E1ED] mb-2">+5%</div>
            <div className="text-gray-400 text-lg">Shoulder Mobility</div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBackToHome}
          className="w-full min-h-[48px] px-6 py-3 bg-[#33E1ED] text-[#121212] font-bold text-xl rounded-lg hover:bg-[#2AC5D0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212]"
        >
          Back to Home
        </button>

        <button
          onClick={() => navigate('/home', { state: { scrollToProgress: true } })}
          className="w-full min-h-[48px] px-6 py-3 bg-gray-800 text-white font-semibold text-lg rounded-lg hover:bg-gray-700 transition-colors"
        >
          See My Progress
        </button>
      </div>
    </div>
  );
}

