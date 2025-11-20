import { db } from './firebase';
import { collection, getDocs, getDoc, doc, query, orderBy, limit, type DocumentData } from 'firebase/firestore';

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

// Get all blog posts
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .map(doc => docToBlogPost(doc.id, doc.data()))
      .filter(post => {
        const data = querySnapshot.docs.find(d => d.id === post.id)?.data();
        return data?.status === 'published' || !data?.status;
      });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Get recent blog posts
export async function getRecentBlogPosts(count: number = 5): Promise<BlogPost[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.status === 'published' || !data.status;
      })
      .map(doc => docToBlogPost(doc.id, doc.data()))
      .slice(0, count);
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
    
    const postDoc = querySnapshot.docs.find(doc => {
      const data = doc.data();
      return data.slug === slug && (data.status === 'published' || !data.status);
    });
    
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

// Get all unique tags from all posts
export async function getAllTags(): Promise<string[]> {
  try {
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(postsRef);
    
    const tagsSet = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'published' || !data.status) {
        const tags = data.tags || [];
        tags.forEach((tag: string) => tagsSet.add(tag));
      }
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
    const q = query(postsRef, orderBy('publishedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs
      .filter(doc => {
        const data = doc.data();
        return data.status === 'published' || !data.status;
      })
      .map(doc => docToBlogPost(doc.id, doc.data()))
      .filter(post => post.tags.includes(tag));
  } catch (error) {
    console.error('Error fetching blog posts by tag:', error);
    return [];
  }
}

// Get tag counts for all tags
export async function getTagCounts(): Promise<Record<string, number>> {
  try {
    const postsRef = collection(db, 'posts');
    const querySnapshot = await getDocs(postsRef);
    
    const tagCounts: Record<string, number> = {};
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'published' || !data.status) {
        const tags = data.tags || [];
        tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    return tagCounts;
  } catch (error) {
    console.error('Error fetching tag counts:', error);
    return {};
  }
}