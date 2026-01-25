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

  useEffect(() => {
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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

  const logout = async () => {
    try {
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
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
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

