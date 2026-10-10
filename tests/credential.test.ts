import assert from 'node:assert/strict';
import test from 'node:test';
import { credentials } from '../src/data/record';
import { hasLapsed } from '../src/lib/credential';

test('a certificate is current until its expiry day, and lapsed from it', () => {
  assert.equal(hasLapsed('2027-10-03', new Date('2027-10-02T23:59:59Z')), false);
  assert.equal(hasLapsed('2027-10-03', new Date('2027-10-03T00:00:00Z')), true);
});

test('the F&O Developer Associate runs to 3 October 2027 (Microsoft Learn, checked 9 October 2026)', () => {
  const associate = credentials.find((credential) => credential.name.includes('Developer Associate'));
  assert.equal(associate?.expires, '2027-10-03');
  assert.equal(hasLapsed('2027-10-03', new Date('2026-10-09T00:00:00Z')), false);
});
