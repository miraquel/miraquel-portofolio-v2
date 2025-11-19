// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './src/lib/firebase';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId isx optional
const firebaseConfig = {
  apiKey: "AIzaSyDdabIzDl9EWdliFqwjzKuaU8MXY4_nHx0",
  authDomain: "miraquel-db33e.firebaseapp.com",
  projectId: "miraquel-db33e",
  storageBucket: "miraquel-db33e.firebasestorage.app",
  messagingSenderId: "729809060501",
  appId: "1:729809060501:web:f3ea6a8755a13db0a2519c",
  measurementId: "G-VB67HZZCFF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const newPost = {
  title: "My New Blog Post",
  slug: "my-new-blog-post",
  excerpt: "This is a short excerpt",
  content: "<p>Full content goes here...</p>",
  author: "Chaidir Ali Assegaf",
  publishedAt: Timestamp.now(),
  tags: ["javascript", "typescript"],
  imageUrl: "https://example.com/image.jpg"
};

await addDoc(collection(db, 'posts'), newPost);