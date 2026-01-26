import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WorkoutCard from '../components/dashboard/WorkoutCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import { generateDailyMoov } from '../logic/filterEngine';
import { exercises } from '../logic/exerciseDB';
import { generateExercisesForProfile } from '../logic/exerciseTemplates';
import { generatePersonalizedExercises, isGeminiAvailable, explainWorkout } from '../services/geminiService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Home Dashboard Page - Displays today's workout and progress
 */
export default function Home() {
  const navigate = useNavigate();
  const { user, logout, isGuest } = useAuth();
  const [todayWorkout, setTodayWorkout] = useState([]);
  const [progressData, setProgressData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [workoutSource, setWorkoutSource] = useState('template'); // 'template', 'ai', 'legacy'
  const [workoutExplanation, setWorkoutExplanation] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user profile and generate daily workout
    loadUserData();
  }, [user, navigate]);

  const loadUserData = async (useAI = false) => {
    try {
      setIsLoading(true);
      let profile;

      // Check if user is a guest
      if (isGuest || user?.isGuest) {
        // Load guest profile from localStorage
        const guestProfile = localStorage.getItem('moov_guest_profile');
        if (guestProfile) {
          profile = JSON.parse(guestProfile);
          console.log('Loaded guest profile:', profile);
        } else {
          // No guest profile found - redirect to onboarding
          console.log('No guest profile found, redirecting to onboarding');
          navigate('/onboarding');
          return;
        }
      } else {
        // Load user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          profile = userDoc.data();
        } else {
          // No profile found - redirect to onboarding
          console.log('No user profile found, redirecting to onboarding');
          navigate('/onboarding');
          return;
        }
      }

      setUserProfile(profile);

      // Generate workout based on method
      let dailyWorkout = [];
      let source = 'legacy';

      if (useAI && isGeminiAvailable()) {
        // Try AI-generated exercises (with Gemini)
        try {
          console.log('Generating AI-powered exercises...');
          dailyWorkout = await generatePersonalizedExercises(profile, 5);
          source = 'ai';
          
          // Get workout explanation
          const explanation = await explainWorkout(dailyWorkout, profile);
          setWorkoutExplanation(explanation);
        } catch (aiError) {
          console.error('AI generation failed, falling back to templates:', aiError);
          dailyWorkout = generateExercisesForProfile(profile, 5);
          source = 'template';
        }
      } else {
        // Use template-based generation (no API needed)
        dailyWorkout = generateExercisesForProfile(profile, 5);
        source = 'template';
        
        // If template generation returns empty, fall back to legacy filter
        if (dailyWorkout.length === 0) {
          dailyWorkout = generateDailyMoov(profile, exercises);
          source = 'legacy';
        }
      }

      setTodayWorkout(dailyWorkout);
      setWorkoutSource(source);

      // TODO: Load progress data from Firestore
      // For now, use mock data
      setProgressData({
        consistency: [0, 1, 2, 3, 4, 5, 6, 7],
        mobility: [0, 5, 8, 10, 12, 15, 18, 20],
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
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
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">Your Profile</p>
                    {(isGuest || user?.isGuest) && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        Guest
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-[#121212]">{getPositionLabel()}</p>
                </div>
              </div>
              {(isGuest || user?.isGuest) ? (
                <button
                  onClick={() => navigate('/onboarding')}
                  className="text-[#059669] hover:underline text-sm font-medium"
                >
                  Customize Profile
                </button>
              ) : (
                <button
                  onClick={() => navigate('/profile')}
                  className="text-[#059669] hover:underline text-sm font-medium"
                >
                  Update Profile
                </button>
              )}
            </div>
            {(isGuest || user?.isGuest) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Sign in to save your progress and sync across devices.{' '}
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="text-[#059669] hover:underline font-medium"
                  >
                    Sign in now
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Today's Moov Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Today's Moov</h2>
              {workoutSource && (
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    workoutSource === 'ai' 
                      ? 'bg-purple-100 text-purple-700' 
                      : workoutSource === 'template'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {workoutSource === 'ai' ? 'AI Personalized' : 
                     workoutSource === 'template' ? 'Smart Template' : 'Standard'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isGeminiAvailable() && (
                <button
                  onClick={() => loadUserData(true)}
                  disabled={isLoading}
                  className="text-purple-600 hover:underline text-sm font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Try AI'}
                </button>
              )}
              <button
                onClick={() => loadUserData(false)}
                disabled={isLoading}
                className="text-[#059669] hover:underline text-sm font-medium disabled:opacity-50"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Workout explanation from AI */}
          {workoutExplanation && workoutSource === 'ai' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-800">{workoutExplanation}</p>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-center shadow-sm">
              <div className="w-12 h-12 border-4 border-[#059669] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Generating your personalized workout...</p>
            </div>
          ) : todayWorkout.length > 0 ? (
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
