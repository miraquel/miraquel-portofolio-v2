import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
  type DocumentData,
  type Firestore
} from 'firebase/firestore';

function slugKey(slug: string): string {
  return encodeURIComponent(slug.trim().toLowerCase());
}

export async function createPost(db: Firestore, postData: DocumentData): Promise<string> {
  const existing = await getDocs(query(collection(db, 'posts'), where('slug', '==', postData.slug)));
  if (!existing.empty) {
    throw new Error(`Slug "${postData.slug}" already exists.`);
  }

  const postRef = doc(collection(db, 'posts'));
  const slugRef = doc(db, 'postSlugs', slugKey(postData.slug));

  await runTransaction(db, async transaction => {
    if ((await transaction.get(slugRef)).exists()) {
      throw new Error(`Slug "${postData.slug}" already exists.`);
    }
    transaction.set(slugRef, { postId: postRef.id, slug: postData.slug });
    transaction.set(postRef, postData);
  });

  return postRef.id;
}
