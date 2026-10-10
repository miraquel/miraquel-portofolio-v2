import assert from 'node:assert/strict';
import test from 'node:test';
import { bayOpenAngle, doorAngle, easeOut, leafOpacity, openAngle, swingMs } from '../src/lib/door-swing';

test('the swing eases like the bays: cubic-bezier(0.16, 1, 0.3, 1)', () => {
  assert.equal(easeOut(0), 0);
  assert.equal(easeOut(1), 1);
  // Halfway through the time the curve is 97% of the way, as the CSS timing function is
  assert.ok(Math.abs(easeOut(0.5) - 0.972) < 0.005, `easeOut(0.5) = ${easeOut(0.5)}`);
});

test('the doors start shut and come to rest open after the swing', () => {
  assert.equal(doorAngle(-50), 0);
  assert.equal(doorAngle(0), 0);
  assert.equal(doorAngle(swingMs), openAngle);
  assert.equal(doorAngle(swingMs * 3), openAngle);
});

test('the doors only ever open, most of the way in the first quarter', () => {
  let previous = 0;
  for (let ms = 0; ms <= swingMs; ms += 10) {
    const angle = doorAngle(ms);
    assert.ok(angle >= previous, `angle fell at ${ms}ms`);
    previous = angle;
  }
  assert.ok(doorAngle(swingMs / 4) > openAngle * 0.75);
});

test('a bay\'s doors swing to 92deg, as far as its CSS leaves do', () => {
  assert.equal(bayOpenAngle, (92 * Math.PI) / 180);
  assert.equal(doorAngle(swingMs, bayOpenAngle), bayOpenAngle);
  assert.equal(doorAngle(swingMs / 2, bayOpenAngle), bayOpenAngle * easeOut(0.5));
});

test('the leaves fade like the CSS ones: opacity 350ms ease-out from 700ms', () => {
  assert.equal(leafOpacity(0), 1);
  assert.equal(leafOpacity(700), 1);
  assert.equal(leafOpacity(1050), 0);
  assert.equal(leafOpacity(5000), 0);
  // Halfway through the fade, CSS ease-out has covered 68% of it
  assert.ok(Math.abs(leafOpacity(875) - 0.316) < 0.01, `leafOpacity(875) = ${leafOpacity(875)}`);
  let previous = 1;
  for (let ms = 700; ms <= 1050; ms += 10) {
    assert.ok(leafOpacity(ms) <= previous, `opacity rose at ${ms}ms`);
    previous = leafOpacity(ms);
  }
});
