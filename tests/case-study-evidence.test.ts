import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';
import { containers, evidenceLabel, manifest } from '../src/data/work';

const bay = (slug: string) => {
  const found = containers.find((container) => container.slug === slug);
  assert.ok(found, slug);
  return found;
};

test('AXFinMobile links the write-up and its example XPO, which ships with the site', () => {
  const evidence = bay('axfinmobile').evidence;
  assert.ok(evidence.some((item) => item.href === '/blog/ax-2012-aif-vendor-payment-settlement' && !item.download));

  const xpo = evidence.find((item) => item.href?.endsWith('.xpo'));
  assert.ok(xpo?.download, 'the XPO is offered as a download');
  assert.ok(existsSync(new URL(`../public${xpo.href}`, import.meta.url)), `${xpo.href} is in public/`);
});

test('a manifest reference points at that line, whatever its position', () => {
  const item = bay('fo-migration').evidence.find((entry) => entry.label.startsWith('Follows my 2020'));
  assert.match(item?.href ?? '', /^#manifest-\d+$/);
  const line = manifest[Number(item!.href!.slice('#manifest-'.length)) - 1];
  assert.equal(line.title, 'Dynamics 365 F&O assessment');
});

test('the field says Evidence only when something in it can be opened', () => {
  assert.equal(evidenceLabel(bay('axfinmobile')), 'Evidence');
  assert.equal(evidenceLabel(bay('sparepart-management')), 'Evidence');
  assert.equal(evidenceLabel(bay('futurist')), 'Evidence');
  // A delivery note and a cross-reference to the manifest are facts on file, not artifacts
  assert.equal(evidenceLabel(bay('fo-migration')), 'Record');
});
