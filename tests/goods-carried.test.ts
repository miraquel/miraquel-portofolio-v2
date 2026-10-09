import assert from 'node:assert/strict';
import test from 'node:test';
import { goods } from '../src/data/profile';
import { containers } from '../src/data/work';

const carried = (slug: string) => containers.find((container) => container.slug === slug)?.carries;

test('every container carries goods lines that Description of goods lists, once each', () => {
  const ids = new Set(goods.map((line) => line.id));
  assert.equal(ids.size, goods.length, 'goods line ids are unique');
  for (const container of containers) {
    assert.ok(container.carries.length > 0, `${container.slug} carries something`);
    assert.equal(new Set(container.carries).size, container.carries.length, `${container.slug} lists each line once`);
    for (const id of container.carries) assert.ok(ids.has(id), `${container.slug}: ${id} is a goods line`);
  }
});

test('the mobile apps carry the ERP and the .NET side together', () => {
  for (const slug of ['axfinmobile', 'sparepart-management']) {
    assert.deepEqual(carried(slug), ['dotnet', 'ax2012', 'mobile-data'], slug);
  }
});

test('Futurist reads the AX data warehouse, not AX itself', () => {
  assert.deepEqual(carried('futurist'), ['dotnet', 'mobile-data']);
});
