import { createContext, useContext, useState, useEffect } from 'react';
// TODO: Import Firebase Auth
// import { auth } from '../config/firebase';
// import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

/**
 * AuthContext Provider - Manages authentication state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Set up Firebase auth state listener
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   setUser(user);
    //   setLoading(false);
    // });
    // return () => unsubscribe();

    // Mock: Check localStorage for existing user session
    const storedUser = localStorage.getItem('moov_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('moov_user');
      }
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    try {
      // TODO: Implement Firebase Google Sign In
      // const provider = new GoogleAuthProvider();
      // const result = await signInWithPopup(auth, provider);
      // return result.user;
      
      // Mock: Create a mock user object
      const mockUser = {
        uid: 'mock-user-' + Date.now(),
        email: 'user@example.com',
        displayName: 'Mock User',
        photoURL: null,
      };
      
      // Store in localStorage for persistence
      localStorage.setItem('moov_user', JSON.stringify(mockUser));
      setUser(mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // TODO: Implement Firebase Sign Out
      // await signOut(auth);
      
      // Mock: Clear localStorage
      localStorage.removeItem('moov_user');
      localStorage.removeItem('moov_userProfile');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
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

