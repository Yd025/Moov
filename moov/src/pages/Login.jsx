import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import LoginButton from '../components/auth/LoginButton';

/**
 * Login Page - Entry point for authentication
 * Checks if user exists in Firestore and redirects accordingly
 */
export default function Login() {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const [error, setError] = useState(null);

  // Helper function to check if user profile exists in Firestore
  // Returns: { exists: boolean, firestoreAvailable: boolean }
  const checkUserProfile = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      return { exists: userDocSnap.exists(), firestoreAvailable: true };
    } catch (error) {
      console.error('Error checking user profile:', error);
      // Handle Firestore errors - offline or permission issues
      const isOfflineError = error.message?.includes('offline') || 
                             error.code === 'unavailable';
      const isPermissionError = error.code === 'permission-denied' ||
                                error.message?.includes('permissions');
      // If permission denied, user profile likely doesn't exist yet
      return { exists: false, firestoreAvailable: !isOfflineError && !isPermissionError };
    }
  };

  useEffect(() => {
    // If user is already authenticated, check if they've completed onboarding
    if (user) {
      const redirectUser = async () => {
        const { exists, firestoreAvailable } = await checkUserProfile(user.uid);
        if (!firestoreAvailable) {
          // Firestore not available - go to home and let it handle errors there
          console.warn('Firestore unavailable, redirecting to home');
          navigate('/home');
        } else if (exists) {
          navigate('/home');
        } else {
          navigate('/onboarding');
        }
      };
      redirectUser();
    }
  }, [user, navigate]);

  const handleSignIn = async () => {
    try {
      setError(null);
      const signedInUser = await signInWithGoogle();
      
      // Navigate immediately using the returned user instead of waiting for state update
      if (signedInUser) {
        const { exists, firestoreAvailable } = await checkUserProfile(signedInUser.uid);
        if (!firestoreAvailable) {
          // Firestore not available - go to home and let it handle errors there
          console.warn('Firestore unavailable, redirecting to home');
          navigate('/home');
        } else if (exists) {
          navigate('/home');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      setError(error.message || 'Failed to sign in. Please try again.');
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
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <p className="text-sm text-gray-600">
            Sign in to track your workouts and progress
          </p>
        </div>
      </div>
    </div>
  );
}

