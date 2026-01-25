// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { 
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'your-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-auth-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-storage-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your-sender-id',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'your-app-id',
};

// Validate Firebase configuration
const isConfigValid = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const hasPlaceholders = Object.values(firebaseConfig).some(
    value => typeof value === 'string' && value.includes('your-')
  );
  
  if (hasPlaceholders) {
    console.error('⚠️ Firebase configuration contains placeholder values!');
    console.error('Please set up your Firebase project and add credentials to .env file');
    return false;
  }
  
  return requiredFields.every(field => firebaseConfig[field] && firebaseConfig[field] !== `your-${field.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Log configuration status
if (!isConfigValid()) {
  console.error('❌ Firebase is not properly configured. Google Sign-In will not work.');
  console.error('📝 To fix this:');
  console.error('   1. Create a Firebase project at https://console.firebase.google.com');
  console.error('   2. Enable Google Sign-In in Authentication > Sign-in method');
  console.error('   3. Add your domain to Authorized domains');
  console.error('   4. Create a .env file with your Firebase credentials');
} else {
  console.log('✅ Firebase configuration loaded');
}

// Initialize Firebase services
export const auth = getAuth(app);
// Connect to Firebase Emulator if running locally
if (import.meta.env.VITE_USE_EMULATOR) {
  connectAuthEmulator(auth, 'http://localhost:9099');
}
export const db = getFirestore(app);
export const googleAuthProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
googleAuthProvider.setCustomParameters({
  prompt: 'select_account' // Force account selection
});

// Enable persistence explicitly for offline support
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs open, persistence can only be enabled in one tab
    console.warn('Firestore persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    // Browser doesn't support persistence
    console.warn('Firestore persistence not supported: The current browser does not support all features required for persistence.');
  } else {
    console.error('Firestore persistence error:', err);
  }
});

export default app;

