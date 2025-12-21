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
      className="w-full min-h-[64px] px-6 py-4 bg-[#059669] text-white font-bold text-xl rounded-lg hover:bg-[#047857] active:bg-[#065f46] transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#059669] focus:ring-offset-2 focus:ring-offset-[#fafafa] shadow-lg"
      aria-label="Continue with Google"
    >
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </button>
  );
}

