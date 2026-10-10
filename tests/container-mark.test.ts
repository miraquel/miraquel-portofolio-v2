import assert from 'node:assert/strict';
import test from 'node:test';
import { checkDigit, containerMark, markFromId, notFoundMark } from '../src/lib/container-mark';

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

test('the 404 page container is CAAU 000404 with its true check digit', () => {
  assert.deepEqual(notFoundMark, { owner: 'CAAU', serial: '000404', check: 7, id: 'CAAU0004047' });
});

test('a mark is read back from its compact id', () => {
  assert.deepEqual(markFromId('CAAU2022040'), containerMark('2022-04'));
  assert.deepEqual(markFromId(notFoundMark.id), notFoundMark);
});

test('an id whose check digit does not add up is refused', () => {
  assert.throws(() => markFromId('CAAU2022041'));
  assert.throws(() => markFromId('CAAU20220'));
});

test('malformed codes are refused', () => {
  assert.throws(() => checkDigit('CAA', '2022'));
});
