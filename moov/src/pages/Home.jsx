import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkoutPlanCard from '../components/dashboard/WorkoutPlanCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import { generateDailyWorkoutPlan } from '../logic/filterEngine';
import { workoutPlans } from '../logic/workoutPlans';
import { exercises } from '../logic/exerciseDB';
import { expandWorkoutPlan } from '../logic/workoutPlans';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Home Dashboard Page - Displays today's workout and progress
 */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todayWorkoutPlan, setTodayWorkoutPlan] = useState(null);
  const [todayWorkoutExercises, setTodayWorkoutExercises] = useState([]);
  const [progressData, setProgressData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile and generate daily workout
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async () => {
    try {
      // Load user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      let profile;
      
      if (userDoc.exists()) {
        profile = userDoc.data();
      } else {
        // No profile found - redirect to onboarding
        console.log('No user profile found, redirecting to onboarding');
        navigate('/onboarding');
        return;
      }

      // Generate daily workout plan using filter engine
      const dailyPlan = generateDailyWorkoutPlan(profile, workoutPlans);
      if (dailyPlan) {
        setTodayWorkoutPlan(dailyPlan);
        // Expand the workout plan into full exercise objects
        const planExercises = expandWorkoutPlan(dailyPlan, exercises);
        setTodayWorkoutExercises(planExercises);
      } else {
        setTodayWorkoutPlan(null);
        setTodayWorkoutExercises([]);
      }

      // TODO: Load progress data from Firestore
      // For now, use mock data
      setProgressData({
        consistency: [0, 1, 2, 3, 4, 5, 6, 7],
        mobility: [0, 5, 8, 10, 12, 15, 18, 20],
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleStartWorkout = () => {
    if (todayWorkoutExercises.length > 0) {
      navigate('/workout', { state: { exercises: todayWorkoutExercises } });
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
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
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#059669] mb-2">Welcome Back!</h1>
          <p className="text-xl text-gray-600">Ready for your daily Moov?</p>
        </div>

        {/* Today's Moov Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Today's Moov</h2>
          {todayWorkoutPlan ? (
            <div className="mb-6">
              <WorkoutPlanCard
                workoutPlan={todayWorkoutPlan}
                exercises={todayWorkoutExercises}
                onStart={handleStartWorkout}
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center shadow-sm">
              <p className="text-gray-600 text-lg mb-4">No workout plan generated yet</p>
              <button
                onClick={loadUserData}
                className="w-[40%] min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-white shadow-lg mx-auto"
                aria-label="Generate workout plan"
              >
                Generate Workout Plan
              </button>
            </div>
          )}
        </section>

        {/* Custom Workout Section */}
        <section>
          <div className="bg-gradient-to-r from-[#059669] to-[#047857] rounded-lg p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Create Your Own Workout</h2>
            <p className="text-lg mb-6 text-white/90">
              Select exercises and customize repetitions to build your perfect workout plan
            </p>
            <button
              onClick={() => navigate('/custom-workout')}
              className="min-h-[64px] px-8 py-4 bg-white text-[#059669] font-bold text-xl rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#059669] shadow-lg"
              aria-label="Create custom workout"
            >
              Customize Workout →
            </button>
          </div>
        </section>

        {/* Featured Workout Plans Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Workout Plans</h2>
            <button
              onClick={() => navigate('/workout-plans')}
              className="text-[#059669] hover:text-[#047857] font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#059669] rounded px-2 py-1"
            >
              View All →
            </button>
          </div>
          <div className="space-y-4">
            {workoutPlans
              .filter(plan => 
                ['legs_workout', 'arms_workout', 'back_workout', 'abdomen_workout'].includes(plan.id)
              )
              .map((plan) => {
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

        {/* Progress Section */}
        <section id="progress">
          <ProgressChart progressData={progressData} />
        </section>
      </div>
    </div>
  );
}

