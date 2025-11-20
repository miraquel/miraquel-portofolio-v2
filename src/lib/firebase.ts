import { initializeApp, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};

// Get or initialize Firebase app (prevents duplicate initialization)
function getFirebaseApp(): FirebaseApp {
  try {
    return getApp();
  } catch {
    return initializeApp(firebaseConfig);
  }
}

const app = getFirebaseApp();

// Initialize Firestore
// For default database, use: getFirestore(app)
// For named database (Blaze plan only), use: getFirestore(app, 'database-name')
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Export the app for use in other modules (like analytics)
export { app };
