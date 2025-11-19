import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';

dotenv.config();

console.log('Firebase Config Check:');
console.log('API Key:', process.env.PUBLIC_FIREBASE_API_KEY ? '✓ Set' : '✗ Missing');
console.log('Auth Domain:', process.env.PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', process.env.PUBLIC_FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', process.env.PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID:', process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓ Set' : '✗ Missing');
console.log('App ID:', process.env.PUBLIC_FIREBASE_APP_ID ? '✓ Set' : '✗ Missing');

const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID
};

console.log('\nInitializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log('Firestore initialized successfully');
console.log('\nAttempting to add a simple test document...');

async function testFirestore() {
  try {
    // Test with absolute minimal data
    const testData = {
      title: 'Test Project',
      description: 'Test Description'
    };
    
    console.log('Test data:', JSON.stringify(testData));
    
    const docRef = await addDoc(collection(db, 'test_projects'), testData);
    console.log('✅ Success! Document ID:', docRef.id);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.code, error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testFirestore();
