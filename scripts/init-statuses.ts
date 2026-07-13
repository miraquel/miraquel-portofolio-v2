import dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { signInAsAdmin } from './firebase-admin-login';

const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Status {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  order: number;
  isActive: boolean;
}

const defaultStatuses: Omit<Status, 'id'>[] = [
  {
    name: 'draft',
    displayName: 'Draft',
    description: 'Post is being written and not published',
    color: '#64748b',
    order: 1,
    isActive: true
  },
  {
    name: 'published',
    displayName: 'Published',
    description: 'Post is live and visible to public',
    color: '#14b8a6',
    order: 2,
    isActive: true
  },
  {
    name: 'archived',
    displayName: 'Archived',
    description: 'Post is archived and not visible',
    color: '#94a3b8',
    order: 3,
    isActive: true
  }
];

async function initStatuses() {
  try {
    await signInAsAdmin(app);
    console.log('Initializing status collection...');

    const statusesRef = collection(db, 'statuses');
    
    // Check if statuses already exist
    const snapshot = await getDocs(statusesRef);
    
    if (snapshot.empty) {
      console.log('No statuses found. Creating default statuses...');
      
      for (const status of defaultStatuses) {
        const docRef = await addDoc(statusesRef, status);
        console.log(`✓ Created status: ${status.displayName} (ID: ${docRef.id})`);
      }
      
      console.log('\n✅ Successfully initialized status collection!');
    } else {
      console.log('Status collection already exists with the following statuses:');
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.displayName} (${doc.id})`);
      });
    }

    console.log('\nYou can now reference these statuses in your posts.');
    
  } catch (error) {
    console.error('❌ Error initializing statuses:', error);
    process.exit(1);
  }
}

initStatuses();
