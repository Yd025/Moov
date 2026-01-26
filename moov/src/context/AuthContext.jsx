import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleAuthProvider } from '../config/firebase';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

const AuthContext = createContext(null);

/**
 * AuthContext Provider - Manages authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check for existing guest session
    const guestUser = localStorage.getItem('moov_guest_user');
    if (guestUser) {
      try {
        const parsedGuest = JSON.parse(guestUser);
        setUser(parsedGuest);
        setIsGuest(true);
        setLoading(false);
        return; // Don't set up Firebase listener for guest
      } catch (e) {
        localStorage.removeItem('moov_guest_user');
      }
    }

    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Only update if not in guest mode
      if (!localStorage.getItem('moov_guest_user')) {
        setUser(firebaseUser);
        setIsGuest(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Attempting Google sign in...');
      console.log('Auth instance:', auth);
      console.log('Google provider:', googleAuthProvider);
      
      const result = await signInWithPopup(auth, googleAuthProvider);
      console.log('Sign in successful:', result.user);
      return result.user;
    } catch (error) {
      console.error('Sign in error details:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential,
        fullError: error
      });
      
      // Provide more helpful error messages
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in popup was closed. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized. Please check Firebase configuration.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Google sign-in is not enabled. Please enable it in Firebase Console.');
      } else {
        throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
      }
    }
  };

  /**
   * Continue as Guest - Creates a mock user without Firebase auth
   * Guest data is stored in localStorage only
   * Note: Guest profile is NOT created here - user goes through onboarding
   */
  const continueAsGuest = () => {
    const guestUser = {
      uid: 'guest-' + Date.now(),
      email: null,
      displayName: 'Guest User',
      photoURL: null,
      isGuest: true,
    };

    // Store guest user in localStorage (profile will be created during onboarding)
    localStorage.setItem('moov_guest_user', JSON.stringify(guestUser));
    // Clear any existing guest profile so they go through onboarding
    localStorage.removeItem('moov_guest_profile');

    setUser(guestUser);
    setIsGuest(true);

    console.log('Continuing as guest:', guestUser);
    return { user: guestUser };
  };

  const logout = async () => {
    try {
      // Clear guest data if in guest mode
      if (isGuest) {
        localStorage.removeItem('moov_guest_user');
        localStorage.removeItem('moov_guest_profile');
        setUser(null);
        setIsGuest(false);
        return;
      }

      // Firebase sign out
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isGuest,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    continueAsGuest,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

