import assert from 'node:assert/strict';
import test from 'node:test';
import { doorAngle, easeOut, openAngle, swingMs } from '../src/lib/door-swing';

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
