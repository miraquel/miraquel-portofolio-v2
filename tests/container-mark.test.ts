import assert from 'node:assert/strict';
import test from 'node:test';
import { checkDigit, containerMark } from '../src/lib/container-mark';

test('check digits match published ISO 6346 examples', () => {
  assert.equal(checkDigit('CSQU', '305438'), 3);
  assert.equal(checkDigit('MSKU', '907032'), 3);
});

test('container marks use the project start month as the serial', () => {
  const mark = containerMark('2022-04');
  assert.equal(mark.owner, 'CAAU');
  assert.equal(mark.serial, '202204');
  assert.equal(mark.id, `CAAU202204${mark.check}`);
});

test('malformed codes are refused', () => {
  assert.throws(() => checkDigit('CAA', '2022'));
});
