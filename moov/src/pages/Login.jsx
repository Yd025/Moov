import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginButton from '../components/auth/LoginButton';

/**
 * Login Page - Entry point for authentication
 * Checks if user exists in Firestore and redirects accordingly
 */
export default function Login() {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  useEffect(() => {
    // If user is already authenticated, check if they've completed onboarding
    if (user) {
      // TODO: Check Firestore for user profile
      // const userProfile = await getDoc(doc(db, 'users', user.uid));
      // If profile exists, redirect to Home
      // If no profile, redirect to Onboarding
      
      // Mock: Check localStorage for user profile
      const userProfile = localStorage.getItem('moov_userProfile');
      if (userProfile) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    try {
      // TODO: Implement Firebase Google Sign In
      await signInWithGoogle();
      
      // After sign in, check Firestore for user profile
      // Navigate to onboarding if new user, home if existing
      // Mock: Check localStorage
      const userProfile = localStorage.getItem('moov_userProfile');
      if (userProfile) {
        navigate('/home');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12 text-center">
        {/* Logo */}
        <div>
          <h1 className="text-6xl font-bold text-[#059669] mb-2">Moov</h1>
          <p className="text-xl text-gray-600">Accessible Fitness for Everyone</p>
        </div>

        {/* Sign In Button */}
        <div className="space-y-4">
          <LoginButton onSignIn={handleSignIn} />
          <p className="text-sm text-gray-600">
            Sign in to track your workouts and progress
          </p>
          <p className="text-xs text-gray-600 mt-4">
            (Mock Mode: Click to continue without Firebase)
          </p>
        </div>
      </div>
    </div>
  );
}

