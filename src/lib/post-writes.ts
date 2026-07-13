import { collection, doc, getDocs, query, runTransaction, where, type DocumentData } from 'firebase/firestore';
import { db } from './firebase';

function slugKey(slug: string): string {
  return encodeURIComponent(slug.trim().toLowerCase());
}

export async function createPost(postData: DocumentData): Promise<string> {
  const existing = await getDocs(query(collection(db, 'posts'), where('slug', '==', postData.slug)));
  if (!existing.empty) {
    throw new Error(`Slug "${postData.slug}" already exists. Please use a different slug.`);
  }

  const postRef = doc(collection(db, 'posts'));
  const slugRef = doc(db, 'postSlugs', slugKey(postData.slug));

  await runTransaction(db, async transaction => {
    if ((await transaction.get(slugRef)).exists()) {
      throw new Error(`Slug "${postData.slug}" already exists. Please use a different slug.`);
    }

    transaction.set(slugRef, { postId: postRef.id, slug: postData.slug });
    transaction.set(postRef, postData);
  });

  return postRef.id;
}

export async function updatePost(
  postId: string,
  originalSlug: string,
  postData: DocumentData
): Promise<void> {
  if (postData.slug !== originalSlug) {
    const existing = await getDocs(query(collection(db, 'posts'), where('slug', '==', postData.slug)));
    if (existing.docs.some(post => post.id !== postId)) {
      throw new Error(`Slug "${postData.slug}" already exists. Please use a different slug.`);
    }
  }

  const postRef = doc(db, 'posts', postId);
  const oldSlugRef = doc(db, 'postSlugs', slugKey(originalSlug));
  const newSlugRef = doc(db, 'postSlugs', slugKey(postData.slug));

  await runTransaction(db, async transaction => {
    const newOwner = await transaction.get(newSlugRef);
    const oldOwner = oldSlugRef.path === newSlugRef.path
      ? newOwner
      : await transaction.get(oldSlugRef);

    if (newOwner.exists() && newOwner.data().postId !== postId) {
      throw new Error(`Slug "${postData.slug}" already exists. Please use a different slug.`);
    }

    transaction.set(newSlugRef, { postId, slug: postData.slug });
    transaction.update(postRef, postData);

    if (oldSlugRef.path !== newSlugRef.path) {
      if (oldOwner.exists() && oldOwner.data().postId === postId) {
        transaction.delete(oldSlugRef);
      }
    }
  });
}

export async function deletePost(postId: string, slug: string): Promise<void> {
  const postRef = doc(db, 'posts', postId);
  const slugRef = doc(db, 'postSlugs', slugKey(slug));

  await runTransaction(db, async transaction => {
    const owner = await transaction.get(slugRef);
    transaction.delete(postRef);
    if (owner.exists() && owner.data().postId === postId) {
      transaction.delete(slugRef);
    }
  });
}
