import { db } from './firebase';
import { collection, getDocs, getDocsFromServer, getDoc, doc, query, where, limit, orderBy, type DocumentData } from 'firebase/firestore';

export interface Status {
  id: string;
  name: string;
  displayName: string;
  description: string;
  color: string;
  order: number;
  isActive: boolean;
  icon: string;
}

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
  status?: string;
  statusId?: string;
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
    imageUrl: data.imageUrl,
    status: data.status || 'published',
    statusId: data.statusId
  };
}

// Get all statuses
export async function getAllStatuses(): Promise<Status[]> {
  try {
    const statusesRef = collection(db, 'statuses');
    const q = query(statusesRef, orderBy('order', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Status))
      .filter(status => status.isActive);
  } catch (error) {
    console.error('Error fetching statuses:', error);
    return [];
  }
}

// Get status by ID
export async function getStatusById(id: string): Promise<Status | null> {
  try {
    const docRef = doc(db, 'statuses', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Status;
  } catch (error) {
    console.error('Error fetching status:', error);
    return null;
  }
}

// Get status by name
export async function getStatusByName(name: string): Promise<Status | null> {
  try {
    const statusesRef = collection(db, 'statuses');
    const querySnapshot = await getDocs(statusesRef);
    
    const statusDoc = querySnapshot.docs.find(doc => {
      const data = doc.data();
      return data.name === name;
    });
    
    if (!statusDoc) {
      return null;
    }
    
    return {
      id: statusDoc.id,
      ...statusDoc.data()
    } as Status;
  } catch (error) {
    console.error('Error fetching status by name:', error);
    return null;
  }
}

// Get all published posts, newest first. Throws when Firestore can't answer, so a page can
// tell "the read failed" apart from "there are no posts". getDocs would not throw there:
// it falls back to the empty local cache and reports zero posts.
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('status', '==', 'published'));
  const querySnapshot = await getDocsFromServer(q);

  return querySnapshot.docs
    .map(doc => docToBlogPost(doc.id, doc.data()))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

// Count how many of the given posts carry each tag
export function countTags(posts: BlogPost[]): Record<string, number> {
  const tagCounts: Record<string, number> = {};
  posts.forEach(post => {
    post.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  return tagCounts;
}

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    return await getPublishedPosts();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get recent blog posts
export async function getRecentBlogPosts(count: number = 5): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => docToBlogPost(doc.id, doc.data()))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, count);
  } catch (error) {
    console.error('Error fetching recent blog posts:', error);
    return [];
  }
}

// Find a published post by slug. Returns null when no such post exists and throws when
// Firestore can't answer (see getPublishedPosts), so a page can answer 404 and 503 differently.
export async function findPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, where('slug', '==', slug), where('status', '==', 'published'), limit(1));
  const querySnapshot = await getDocsFromServer(q);

  const postDoc = querySnapshot.docs[0];

  if (!postDoc) {
    return null;
  }

  return docToBlogPost(postDoc.id, postDoc.data());
}

// Get single blog post by slug
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    return await findPublishedPostBySlug(slug);
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

// Get all unique tags from all posts
export async function getAllTags(): Promise<string[]> {
  try {
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(query(postsRef, where('status', '==', 'published')));
    
    const tagsSet = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const tags = data.tags || [];
      tags.forEach((tag: string) => tagsSet.add(tag));
    });
    
    return Array.from(tagsSet).sort();
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

// Get blog posts filtered by tag
export async function getBlogPostsByTag(tag: string): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => docToBlogPost(doc.id, doc.data()))
      .filter(post => post.tags.includes(tag))
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  } catch (error) {
    console.error('Error fetching blog posts by tag:', error);
    return [];
  }
}

// Get tag counts for all tags
export async function getTagCounts(): Promise<Record<string, number>> {
  try {
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(query(postsRef, where('status', '==', 'published')));
    
    const tagCounts: Record<string, number> = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const tags = data.tags || [];
      tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    
    return tagCounts;
  } catch (error) {
    console.error('Error fetching tag counts:', error);
    return {};
  }
}
