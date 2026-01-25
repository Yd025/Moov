import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkoutPlanCard from '../components/dashboard/WorkoutPlanCard';
import { workoutPlans } from '../logic/workoutPlans';
import { exercises } from '../logic/exerciseDB';
import { expandWorkoutPlan } from '../logic/workoutPlans';
import { useEffect } from 'react';

/**
 * Workout Plans Page - Displays all available workout plans
 */
export default function WorkoutPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] p-6 relative">
      {/* Profile Button - Top Right */}
      <button
        onClick={handleProfileClick}
        className="absolute top-6 right-6 min-h-[64px] min-w-[64px] p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#059669] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-sm"
        aria-label="Profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[#059669]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </button>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#059669]"
            aria-label="Back to home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-[#059669]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-4xl font-bold text-[#059669] mb-2">All Workout Plans</h1>
            <p className="text-xl text-gray-600">Choose from our complete collection of workout plans</p>
          </div>
        </div>

        {/* All Workout Plans */}
        <section>
          <div className="space-y-4">
            {workoutPlans.map((plan) => {
              const planExercises = expandWorkoutPlan(plan, exercises);
              return (
                <WorkoutPlanCard
                  key={plan.id}
                  workoutPlan={plan}
                  exercises={planExercises}
                  onStart={(exercises) => {
                    navigate('/workout', { state: { exercises } });
                  }}
                />
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}


