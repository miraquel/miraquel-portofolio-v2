import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function isAdmin(user: User | null): Promise<boolean> {
  return user !== null && (await getDoc(doc(db, 'admins', user.uid))).exists();
}
