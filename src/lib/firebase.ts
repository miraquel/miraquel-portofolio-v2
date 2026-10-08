import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from './firebase-app';

// Initialize Firestore
// For default database, use: getFirestore(app)
// For named database (Blaze plan only), use: getFirestore(app, 'database-name')
export const db = getFirestore(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Export the app for use in other modules (like analytics)
export { app };
