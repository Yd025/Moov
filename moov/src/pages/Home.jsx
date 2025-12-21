import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkoutCard from '../components/dashboard/WorkoutCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import { generateDailyMoov } from '../logic/filterEngine';
import { exercises } from '../logic/exerciseDB';
// TODO: Import Firebase functions
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../config/firebase';

/**
 * Home Dashboard Page - Displays today's workout and progress
 */
export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState([]);
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

      // Generate daily workout using filter engine
      const dailyWorkout = generateDailyMoov(profile, exercises);
      setTodayWorkout(dailyWorkout);

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
    navigate('/workout', { state: { exercises: todayWorkout } });
  };

  const handleStartExercise = (exercise) => {
    navigate('/workout', { state: { exercises: [exercise] } });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#33E1ED] mb-2">Welcome Back!</h1>
          <p className="text-xl text-gray-400">Ready for your daily Moov?</p>
        </div>

        {/* Today's Moov Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Today's Moov</h2>
          {todayWorkout.length > 0 ? (
            <div className="space-y-4 mb-6">
              {todayWorkout.map((exercise, index) => (
                <WorkoutCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  onStart={handleStartExercise}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 text-center">
              <p className="text-gray-400 text-lg mb-4">No workout generated yet</p>
              <button
                onClick={loadUserData}
                className="min-h-[48px] px-6 py-3 bg-[#33E1ED] text-[#121212] font-semibold text-lg rounded-lg hover:bg-[#2AC5D0] transition-colors"
              >
                Generate Workout
              </button>
            </div>
          )}
          
          {todayWorkout.length > 0 && (
            <button
              onClick={handleStartWorkout}
              className="w-full min-h-[48px] px-6 py-3 bg-[#33E1ED] text-[#121212] font-bold text-xl rounded-lg hover:bg-[#2AC5D0] transition-colors focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              Start Daily Moov
            </button>
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

