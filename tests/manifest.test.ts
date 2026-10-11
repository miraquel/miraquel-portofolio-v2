import assert from 'node:assert/strict';
import test from 'node:test';
import { manifest } from '../src/data/work';

test('the manifest runs newest first, as its note says', () => {
  for (let i = 1; i < manifest.length; i++) {
    assert.ok(manifest[i - 1].period.start >= manifest[i].period.start, `line ${i} starts before line ${i + 1}`);
  }
});

test('the Natural Java Spice reports ran March to December 2019', () => {
  const line = manifest.find((entry) => entry.client === 'PT Natural Java Spice');
  assert.deepEqual(line?.period, { start: '2019-03', end: '2019-12' });
});

test('the AX 2012 R2 migration to Dynamics 365 F&O at PT Gandum Mas Kencana runs from August 2026, in progress', () => {
  const [line] = manifest;
  assert.equal(line.title, 'Dynamics AX 2012 R2 migration to Dynamics 365 Finance and Operations');
  assert.equal(line.client, 'PT Gandum Mas Kencana');
  assert.equal(line.platform, 'Dynamics 365 F&O, X++');
  assert.deepEqual(line.period, { start: '2026-08' });
});
