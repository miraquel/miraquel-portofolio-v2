import { initializeApp, getApp, type FirebaseApp } from 'firebase/app';

// Your Firebase configuration
export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID
};

// Get or initialize Firebase app (prevents duplicate initialization).
// Kept apart from firebase.ts so pages that only need analytics don't bundle Firestore and Auth.
function getFirebaseApp(): FirebaseApp {
  try {
    return getApp();
  } catch {
    return initializeApp(firebaseConfig);
  }
}

export const app = getFirebaseApp();
