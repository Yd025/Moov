import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkoutCard from '../components/dashboard/WorkoutCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import { generateDailyMoov } from '../logic/filterEngine';
import { exercises } from '../logic/exerciseDB';
import { expandWorkoutPlan } from '../logic/workoutPlans';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Home Dashboard Page - Displays today's workout and progress
 */
export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

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
      
      // Mock: Load from localStorage
      const storedProfile = localStorage.getItem('moov_userProfile');
      const profile = storedProfile 
        ? JSON.parse(storedProfile)
        : {
            // Default profile matching new onboarding structure
            movementPosition: 'sitting',
            wheelchairTransfer: '',
            assistiveGear: [],
            overheadRange: 'full',
            asymmetryConfig: '',
            gripStrength: 'strong',
            energyFlow: 'standard',
            redZones: [],
            movementBox: null,
            // Legacy compatibility
            mobility: 'seated',
            mobilityAid: 'sitting',
          };
      if (userDoc.exists()) {
        profile = userDoc.data();
      } else {
        // No profile found - redirect to onboarding
        console.log('No user profile found, redirecting to onboarding');
        navigate('/onboarding');
        return;
      }

      setUserProfile(profile);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get display text for user's movement position
  const getPositionLabel = () => {
    const labels = {
      'standing_unassisted': 'Standing',
      'standing_supported': 'Standing (Supported)',
      'sitting': 'Seated',
      'wheelchair': 'Wheelchair',
      'lying': 'Lying Down',
    };
    return labels[userProfile?.movementPosition] || 'Not set';
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#121212] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-[#059669] mb-2">Welcome Back!</h1>
            <p className="text-xl text-gray-600">Ready for your daily Moov?</p>
          </div>
          <button
            onClick={handleLogout}
            className="min-h-[48px] px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 hover:text-[#121212] transition-colors"
          >
            Logout
          </button>
        </div>

        {/* User Profile Summary */}
        {userProfile && (
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#059669]/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#059669]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Your Profile</p>
                  <p className="font-semibold text-[#121212]">{getPositionLabel()}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('moov_userProfile');
                  navigate('/onboarding');
                }}
                className="text-[#059669] hover:underline text-sm font-medium"
              >
                Update Profile
              </button>
            </div>
          </div>
        )}

        {/* Today's Moov Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Today's Moov</h2>
            <button
              onClick={loadUserData}
              className="text-[#059669] hover:underline text-sm font-medium"
            >
              Refresh
            </button>
          </div>

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
            <div className="bg-white rounded-lg p-6 border border-gray-200 text-center shadow-sm">
              <p className="text-gray-600 text-lg mb-4">No exercises match your profile</p>
              <p className="text-sm text-gray-500 mb-4">
                Try updating your profile or check your red zone settings
              </p>
              <button
                onClick={loadUserData}
                className="min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] transition-colors shadow-lg"
              >
                Regenerate Workout
              </button>
            </div>
          )}
          
          {todayWorkout.length > 0 && (
            <button
              onClick={handleStartWorkout}
              className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
            >
              Start Daily Moov ({todayWorkout.length} exercises)
            </button>
          )}
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="text-3xl font-bold text-[#059669]">{todayWorkout.length}</div>
            <div className="text-sm text-gray-600">Exercises Today</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="text-3xl font-bold text-[#059669]">
              {todayWorkout.reduce((acc, ex) => acc + (ex.reps || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Reps</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 text-center shadow-sm">
            <div className="text-3xl font-bold text-[#059669]">
              {Math.ceil(todayWorkout.reduce((acc, ex) => acc + (ex.duration || 60), 0) / 60)}
            </div>
            <div className="text-sm text-gray-600">Est. Minutes</div>
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
