import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import { doc, getDoc, getFirestore } from 'firebase/firestore';

export async function signInAsAdmin(app: FirebaseApp): Promise<void> {
  const email = process.env.FIREBASE_ADMIN_EMAIL;
  const password = process.env.FIREBASE_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('FIREBASE_ADMIN_EMAIL and FIREBASE_ADMIN_PASSWORD must be set.');
  }

  const credential = await signInWithEmailAndPassword(getAuth(app), email, password);
  const admin = await getDoc(doc(getFirestore(app), 'admins', credential.user.uid));
  if (!admin.exists()) {
    throw new Error(`Firebase user ${email} is not listed in the admins collection.`);
  }
}
