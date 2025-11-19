# Blog Setup Guide

## Overview
This portfolio now includes a blog feature powered by Firebase Firestore as the backend database.

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on "Web" (</>) to add a web app
4. Copy the Firebase configuration values

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials in `.env`:
   ```
   PUBLIC_FIREBASE_API_KEY=your_api_key_here
   PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### 3. Set Up Firestore Database
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" or "Start in test mode" (for development)
4. Select a location for your database

### 4. Create the Blog Posts Collection
In Firestore, create a collection called `posts` with documents containing:

```javascript
{
  title: "Your Blog Post Title",
  slug: "your-blog-post-slug",  // URL-friendly version
  excerpt: "A short description of your post",
  content: "<p>Your HTML content here</p>",
  author: "Your Name",
  publishedAt: Timestamp,  // Firebase Timestamp
  tags: ["tag1", "tag2"],
  imageUrl: "https://example.com/image.jpg"  // Optional
}
```

### 5. Example: Adding a Blog Post via Firebase Console
1. Go to Firestore Database
2. Click "Start collection" and enter `posts` as the collection ID
3. Add a document with an auto-generated ID
4. Add the following fields:
   - `title` (string): "Getting Started with Astro"
   - `slug` (string): "getting-started-with-astro"
   - `excerpt` (string): "Learn how to build fast websites with Astro"
   - `content` (string): "<p>Astro is an amazing framework...</p>"
   - `author` (string): "Chaidir Ali Assegaf"
   - `publishedAt` (timestamp): Click "Add timestamp" and select current date/time
   - `tags` (array): ["astro", "web development"]
   - `imageUrl` (string): "https://example.com/astro.jpg" (optional)

## Blog Structure

### Files Created
- `src/lib/firebase.ts` - Firebase configuration
- `src/lib/blog.ts` - Helper functions for fetching blog posts
- `src/components/Blog.astro` - Blog section component (shows recent posts on homepage)
- `src/pages/blog/index.astro` - Blog listing page
- `src/pages/blog/[slug].astro` - Individual blog post page

### Features
- ✅ Display recent blog posts on homepage
- ✅ Full blog listing page at `/blog`
- ✅ Individual blog post pages with dynamic routes
- ✅ Tags support
- ✅ Featured images
- ✅ Responsive design with Tailwind CSS
- ✅ Navigation link to blog section

## Usage

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Firestore Security Rules

For production, set up proper security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to all posts
    match /posts/{post} {
      allow read: if true;
      // Only allow write access to authenticated users (you'll need to set up Firebase Auth)
      allow write: if request.auth != null;
    }
  }
}
```

## Adding Blog Posts Programmatically

You can also use the Firebase Admin SDK or create an admin panel to add posts. Here's an example using the Admin SDK:

```javascript
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from './src/lib/firebase';

const newPost = {
  title: "My New Blog Post",
  slug: "my-new-blog-post",
  excerpt: "This is a short excerpt",
  content: "<p>Full content goes here...</p>",
  author: "Your Name",
  publishedAt: Timestamp.now(),
  tags: ["javascript", "typescript"],
  imageUrl: "https://example.com/image.jpg"
};

await addDoc(collection(db, 'posts'), newPost);
```

## Troubleshooting

### Posts not showing up
- Check that your `.env` file has the correct Firebase credentials
- Verify that the Firestore collection is named `posts` (case-sensitive)
- Check browser console for any errors
- Ensure Firestore rules allow read access

### Build errors
- Make sure Firebase is properly initialized
- Check that all environment variables are prefixed with `PUBLIC_`
- Verify that the blog collection exists in Firestore

## Future Enhancements
- Add search functionality
- Implement pagination
- Add comments using Firestore
- Create an admin panel for managing posts
- Add markdown support
- Implement draft/publish states
