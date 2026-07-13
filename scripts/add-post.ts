import { initializeApp } from 'firebase/app';
import { getFirestore, Timestamp } from 'firebase/firestore';
import * as readline from 'readline';
import 'dotenv/config';
import { signInAsAdmin } from './firebase-admin-login';
import { createPost } from './create-post';

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function addBlogPost() {
  try {
    await signInAsAdmin(app);
    console.log('\n=== Add New Blog Post ===\n');

    const title = await question('Title: ');
    const slug = await question('Slug (URL-friendly, e.g., my-blog-post): ');
    const excerpt = await question('Excerpt (short description): ');
    const author = await question('Author: ');
    
    console.log('\nContent (HTML, end with a line containing only "END"):');
    let content = '';
    let line = '';
    while ((line = await question('')) !== 'END') {
      content += line + '\n';
    }

    const tagsInput = await question('Tags (comma-separated): ');
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const imageUrl = await question('Image URL (optional, press Enter to skip): ');

    const newPost = {
      title,
      slug,
      excerpt,
      content: content.trim(),
      author,
      publishedAt: Timestamp.now(),
      tags,
      status: 'published',
      ...(imageUrl && { imageUrl })
    };

    console.log('\nAdding post to Firestore...');
    const postId = await createPost(db, newPost);
    
    console.log('\n✅ Post added successfully!');
    console.log(`Document ID: ${postId}`);
    console.log(`URL: /blog/${slug}`);

  } catch (error) {
    console.error('\n❌ Error adding post:', error);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

// Run the script
addBlogPost();
