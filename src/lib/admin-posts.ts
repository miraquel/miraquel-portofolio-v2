// Posts as the admin screens read them from Firestore, and the few facts they all derive from one.
import type { Timestamp } from 'firebase/firestore';
import { formatDay } from './format';

export interface AdminPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status?: string;
  tags?: string[];
  publishedAt?: Timestamp;
}

/** A post saved without a status counts as a draft */
export function statusOf(post: AdminPost): string {
  return post.status || 'draft';
}

function publishedMillis(post: AdminPost): number {
  return post.publishedAt?.toMillis?.() ?? 0;
}

export function newestFirst(a: AdminPost, b: AdminPost): number {
  return publishedMillis(b) - publishedMillis(a);
}

/** "8 October 2026", as the blog prints it */
export function publishedOn(post: AdminPost): string {
  const date = post.publishedAt?.toDate?.();
  return date ? formatDay(date) : 'No date';
}
