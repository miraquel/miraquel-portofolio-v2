import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// LinkedIn keeps an image it has fetched for as long as its URL stays the same, so a
// re-rendered public/og.png only reaches link previews under a new ?v= version
test('the site card URL carries the version of public/og.png', () => {
  const card = readFileSync(new URL('../public/og.png', import.meta.url));
  const version = createHash('sha256').update(card).digest('hex').slice(0, 8);
  const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');

  assert.match(layout, new RegExp(`path: '/og\\.png\\?v=${version}'`));
});
