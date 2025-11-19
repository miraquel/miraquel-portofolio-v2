import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, collection, Timestamp } from 'firebase/firestore';
import 'dotenv/config';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample blog post
const samplePost = {
  title: "Getting Started with Astro and Firebase",
  slug: "getting-started-astro-firebase",
  excerpt: "Learn how to build a modern portfolio website with Astro and integrate Firebase Firestore for dynamic content.",
  content: `
    <h2>Introduction</h2>
    <p>Astro is a modern static site builder that delivers lightning-fast performance. Combined with Firebase Firestore, you can create dynamic, data-driven websites that are both fast and flexible.</p>
    
    <h2>Why Astro?</h2>
    <p>Astro offers several advantages:</p>
    <ul>
      <li>Zero JavaScript by default</li>
      <li>Component framework agnostic</li>
      <li>Excellent performance</li>
      <li>Great developer experience</li>
    </ul>
    
    <h2>Why Firebase?</h2>
    <p>Firebase Firestore provides:</p>
    <ul>
      <li>Real-time database capabilities</li>
      <li>Easy to use SDK</li>
      <li>Generous free tier</li>
      <li>Scalable infrastructure</li>
    </ul>
    
    <h2>Getting Started</h2>
    <p>To get started with this stack, you'll need to set up both Astro and Firebase. Follow the setup instructions in the BLOG_SETUP.md file.</p>
    
    <h2>Conclusion</h2>
    <p>Combining Astro's performance with Firebase's flexibility creates a powerful platform for modern web applications.</p>
  `,
  author: "Chaidir Ali Assegaf",
  publishedAt: Timestamp.now(),
  tags: ["astro", "firebase", "web development", "tutorial"],
  imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800"
};

async function addSamplePost() {
  try {
    console.log('Adding sample blog post to Firestore...\n');

    // print firebase configuration for debugging
    console.log('Firebase Configuration:');
    console.log(JSON.stringify(firebaseConfig, null, 2));
    console.log('\n');
    
    const docRef = await addDoc(collection(db, 'posts'), samplePost);
    
    console.log('✅ Sample post added successfully!');
    console.log(`Document ID: ${docRef.id}`);
    console.log(`Title: ${samplePost.title}`);
    console.log(`URL: /blog/${samplePost.slug}`);
    console.log(`\nYou can view this post at: http://localhost:4321/blog/${samplePost.slug}`);
    
  } catch (error) {
    console.error('❌ Error adding sample post:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
addSamplePost();
