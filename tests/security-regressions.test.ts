import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { sanitizePostContent } from '../src/lib/sanitize';

test('post content removes executable HTML', () => {
  const dirty = '<h2>Hello</h2><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(2)">';
  const clean = sanitizePostContent(dirty);

  assert.match(clean, /<h2>Hello<\/h2>/);
  assert.doesNotMatch(clean, /script|onerror|javascript:/i);
});

test('Firestore writes require membership in the admin allowlist', async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');

  assert.match(rules, /documents\/admins\/\$\(request\.auth\.uid\)/);
  assert.doesNotMatch(rules, /allow create, update, delete: if true/);
  assert.doesNotMatch(rules, /allow create, update, delete: if request\.auth != null/);
});

test('public post reads are limited to published content', async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
  assert.match(rules, /resource\.data\.status == 'published' \|\| isAdmin\(\)/);
});

test('post edits check legacy posts as well as transactional slug reservations', async () => {
  const writes = await readFile(new URL('../src/lib/post-writes.ts', import.meta.url), 'utf8');
  assert.match(writes, /postData\.slug !== originalSlug/);
  assert.match(writes, /where\('slug', '==', postData\.slug\)/);
  assert.match(writes, /transaction\.get\(newSlugRef\)/);
});

test('edit page waits for authenticated admin state before reading a post', async () => {
  const editPage = await readFile(new URL('../src/pages/admin/posts/edit/[id].astro', import.meta.url), 'utf8');
  assert.match(editPage, /onAuthStateChanged\(auth/);
  assert.match(editPage, /if \(await isAdmin\(user\)\) await loadPost\(\)/);
  assert.doesNotMatch(editPage, /\n  loadPost\(\);/);
});

test('clearing optional edit fields removes their stored Firestore values', async () => {
  const editPage = await readFile(new URL('../src/pages/admin/posts/edit/[id].astro', import.meta.url), 'utf8');
  assert.match(editPage, /imageUrl \|\| deleteField\(\)/);
  assert.match(editPage, /readingTimeInput \? parseInt\(readingTimeInput\) : deleteField\(\)/);
});
