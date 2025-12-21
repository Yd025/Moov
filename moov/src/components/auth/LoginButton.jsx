import { useState } from 'react';

/**
 * LoginButton Component - Google Sign In button for authentication
 */
export default function LoginButton({ onSignIn }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement Firebase Google Sign In
      // This will be connected to Firebase Auth in the AuthContext
      if (onSignIn) {
        await onSignIn();
      }
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className="w-full min-h-[48px] px-6 py-3 bg-[#33E1ED] text-[#121212] font-semibold text-lg rounded-lg hover:bg-[#2AC5D0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#33E1ED] focus:ring-offset-2 focus:ring-offset-[#121212]"
      aria-label="Continue with Google"
    >
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
}

