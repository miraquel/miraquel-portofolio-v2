import assert from 'node:assert/strict';
import test from 'node:test';
import { postSocialMeta } from '../src/lib/social-meta';

const post = {
  title: 'Settling AX 2012 vendor invoices: a custom AIF service',
  author: 'Chaidir Ali Assegaf',
  publishedAt: new Date('2026-10-08T15:40:00Z'),
};

test('a post shares as an article under its own title', () => {
  const meta = postSocialMeta(post, 'Chaidir Ali Assegaf');
  assert.equal(meta.title, 'Settling AX 2012 vendor invoices: a custom AIF service | Chaidir Ali Assegaf');
  assert.equal(meta.ogTitle, post.title);
  assert.equal(meta.type, 'article');
  assert.equal(meta.publishedTime, '2026-10-08T15:40:00.000Z');
});

test('a post without its own card keeps the site card', () => {
  assert.equal(postSocialMeta(post, 'Chaidir Ali Assegaf').image, undefined);
});

test('a post card on the site is used, with alt text naming the post', () => {
  const meta = postSocialMeta(
    { ...post, socialImage: '/blog/ax-2012-aif-vendor-payment-settlement/og.png' },
    'Chaidir Ali Assegaf'
  );
  assert.deepEqual(meta.image, {
    path: '/blog/ax-2012-aif-vendor-payment-settlement/og.png',
    alt: `Notice by Chaidir Ali Assegaf: ${post.title}`,
  });
});

test('a card that is not an image path on this site is ignored', () => {
  for (const socialImage of [
    'https://example.com/card.png',
    '//example.com/card.png',
    'javascript:alert(1)',
    '/blog/post/card.svg',
    'blog/post/og.png',
    '',
  ]) {
    assert.equal(postSocialMeta({ ...post, socialImage }, 'Chaidir Ali Assegaf').image, undefined, socialImage);
  }
});
