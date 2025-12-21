import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkoutPlanCard from '../components/dashboard/WorkoutPlanCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import { generateDailyWorkoutPlan } from '../logic/filterEngine';
import { workoutPlans } from '../logic/workoutPlans';
import { exercises } from '../logic/exerciseDB';
import { expandWorkoutPlan } from '../logic/workoutPlans';
// TODO: Import Firebase functions
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../config/firebase';

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
      // TODO: Load user profile from Firestore
      // const userDoc = await getDoc(doc(db, 'users', user.uid));
      // const profile = userDoc.data();
      
      // Mock: Load from localStorage
      const storedProfile = localStorage.getItem('moov_userProfile');
      const profile = storedProfile 
        ? JSON.parse(storedProfile)
        : {
            mobility: 'wheelchair',
            mobilityAid: 'wheelchair',
            constraint: 'upper_body',
            ageFactor: 'standard',
          };

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
    <div className="min-h-screen bg-[#121212] text-white p-6 relative">
      {/* Profile Button - Top Right */}
      <button
        onClick={handleProfileClick}
        className="absolute top-6 right-6 p-3 bg-[#1a1a1a] border border-gray-800 rounded-lg hover:bg-[#2a2a2a] hover:border-[#33E1ED] transition-colors focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212]"
        aria-label="Profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-[#33E1ED]"
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
          <h1 className="text-4xl font-bold text-[#33E1ED] mb-2">Welcome Back!</h1>
          <p className="text-xl text-gray-400">Ready for your daily Moov?</p>
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
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 text-center">
              <p className="text-gray-400 text-lg mb-4">No workout plan generated yet</p>
              <button
                onClick={loadUserData}
                className="min-h-[48px] px-6 py-3 bg-[#33E1ED] text-[#121212] font-semibold text-lg rounded-lg hover:bg-[#2AC5D0] transition-colors"
              >
                Generate Workout Plan
              </button>
            </div>
          )}
        </section>

        {/* Progress Section */}
        <section id="progress">
          <ProgressChart progressData={progressData} />
        </section>
      </div>
    </div>
  );
}

