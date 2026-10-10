import assert from 'node:assert/strict';
import test from 'node:test';
import { manifest } from '../src/data/work';
import { dropDelay, dropMs, dropProgress, laneOf, loadMs, monthIndex, quayRange, stackLayout, type StackBox } from '../src/lib/stack-layout';

const boxes = stackLayout(manifest);
const overlap = (a: StackBox, b: StackBox) => a.start < b.start + b.length && b.start < a.start + a.length;

test('each project stands in the lane its platform names', () => {
  assert.deepEqual(manifest.map((line) => laneOf(line.platform)), [
    'dotnet', 'dotnet', 'both', 'both', 'erp', 'erp', 'dotnet', 'dotnet', 'erp', 'erp',
    'erp', 'erp', 'erp', 'dotnet', 'erp', 'erp', 'dotnet', 'erp', 'erp',
  ]);
});

test('a platform that names neither side fails loudly rather than landing in a lane', () => {
  assert.throws(() => laneOf('Flutter, Dart'), /no lane for the platform "Flutter, Dart"/);
});

test('months count from January 2018, and malformed months are refused', () => {
  assert.equal(monthIndex('2018-01'), 0);
  assert.equal(monthIndex('2023-11'), 70);
  assert.throws(() => monthIndex('2023-13'));
  assert.throws(() => monthIndex('Nov 2023'));
});

test('a project runs from its start month up to its end month, at least one month', () => {
  const [box] = stackLayout([{ number: 1, platform: 'ASP.NET Core', period: { start: '2023-11', end: '2024-02' } }]);
  assert.deepEqual([box.start, box.length], [70, 3]);
  const [same] = stackLayout([{ number: 1, platform: 'ASP.NET Core', period: { start: '2024-02', end: '2024-02' } }]);
  assert.equal(same.length, 1);
  assert.throws(
    () => stackLayout([{ number: 7, platform: 'ASP.NET Core', period: { start: '2024-02', end: '2023-11' } }]),
    /line 7 ends before it starts/
  );
});

test('a project that starts the month another ends stands beside it, not on it', () => {
  const axfinmobile = boxes.find((box) => box.number === 4)!;
  const sparepart = boxes.find((box) => box.number === 3)!;
  assert.equal(axfinmobile.start + axfinmobile.length, sparepart.start);
  assert.deepEqual([axfinmobile.level, sparepart.level], [0, 0]);
});

test('no two containers in a lane share a level and a month', () => {
  for (const a of boxes) {
    for (const b of boxes) {
      if (a !== b && a.lane === b.lane && a.level === b.level) {
        assert.ok(!overlap(a, b), `lines ${a.number} and ${b.number} collide`);
      }
    }
  }
});

test('every raised container rests on one a level below it', () => {
  for (const box of boxes.filter((b) => b.level > 0)) {
    const support = boxes.some((under) => under.lane === box.lane && under.level === box.level - 1 && overlap(under, box));
    assert.ok(support, `line ${box.number} floats`);
  }
});

test('2020, the Business Central year, stacks five high in the ERP lane', () => {
  const in2020 = boxes.filter((box) => box.lane === 'erp' && box.start >= 24 && box.start < 36);
  assert.equal(Math.max(...in2020.map((box) => box.level)), 4);
});

test('the layout is the same on every run, in loading order', () => {
  assert.deepEqual(stackLayout(manifest), boxes);
  assert.equal(boxes.length, manifest.length);
  const starts = boxes.map((box) => box.start);
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
});

test('the quay spans whole years around the projects: January 2018 to January 2026', () => {
  assert.deepEqual(quayRange(boxes), { start: 0, end: 96 });
});

test('the crane lands every container within about two seconds, in loading order', () => {
  const count = boxes.length;
  assert.equal(dropDelay(0, count), 0);
  assert.equal(dropDelay(0, 1), 0);
  assert.ok(dropDelay(count - 1, count) + dropMs <= 2100);
  for (let i = 1; i < count; i++) assert.ok(dropDelay(i, count) > dropDelay(i - 1, count));
  for (let i = 0; i < count; i++) {
    assert.equal(dropProgress(i, count, dropDelay(i, count)), 0);
    assert.equal(dropProgress(i, count, loadMs), 1);
  }
});
