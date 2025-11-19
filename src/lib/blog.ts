import { db } from './firebase';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, type DocumentData } from 'firebase/firestore';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  tags: string[];
  imageUrl?: string;
}

// Convert Firestore document to BlogPost
function docToBlogPost(id: string, data: DocumentData): BlogPost {
  return {
    id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    content: data.content,
    author: data.author,
    publishedAt: data.publishedAt?.toDate() || new Date(),
    tags: data.tags || [],
    imageUrl: data.imageUrl
  };
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => docToBlogPost(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get recent blog posts
export async function getRecentBlogPosts(count: number = 5): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('publishedAt', 'desc'), limit(count));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => docToBlogPost(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching recent blog posts:', error);
    return [];
  }
}

// Get single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef);
    const querySnapshot = await getDocs(q);
    
    const postDoc = querySnapshot.docs.find(doc => doc.data().slug === slug);
    
    if (!postDoc) {
      return null;
    }
    
    return docToBlogPost(postDoc.id, postDoc.data());
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

// Get blog post by ID
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  try {
    const docRef = doc(db, 'posts', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return docToBlogPost(docSnap.id, docSnap.data());
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}