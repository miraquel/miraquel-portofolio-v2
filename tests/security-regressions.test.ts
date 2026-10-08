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

test('sanitize-html and its whole dependency tree are bundled into the server build', async () => {
  // Vercel's function loader cannot require() an ES module. sanitize-html is CommonJS and
  // requires the ESM-only htmlparser2 family, so if it stays external every post page fails
  // in production with ERR_REQUIRE_ESM (plain Node 24 allows it, which hides the bug locally).
  // Vercel's file tracing also ignores require() calls inside bundled chunks, so the bundle
  // must take sanitize-html's dependencies with it.
  const { default: config } = await import('../astro.config.mjs');
  const bundled = config.vite?.ssr?.noExternal;
  assert.ok(Array.isArray(bundled), 'astro.config.mjs must list ssr.noExternal packages');

  const manifest = JSON.parse(await readFile(new URL('../node_modules/sanitize-html/package.json', import.meta.url), 'utf8'));
  const required = ['sanitize-html', ...Object.keys(manifest.dependencies), 'domhandler', 'entities'];
  for (const name of required) {
    assert.ok(bundled.includes(name), `${name} must be bundled (vite.ssr.noExternal)`);
  }
});
