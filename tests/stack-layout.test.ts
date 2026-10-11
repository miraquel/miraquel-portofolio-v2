import assert from 'node:assert/strict';
import test from 'node:test';
import { manifest } from '../src/data/work';
import { dropDelay, dropMs, dropProgress, followMonth, geometry, heightNear, hoverOffset, laneOf, listProgress, loadMs, monthIndex, monthOf, quayRange, stackLayout, type StackBox } from '../src/lib/stack-layout';

// A project in progress runs to the month of the build, so the tests build in October 2026
const boxes = stackLayout(manifest, '2026-10');
const lineOf = (title: string) => manifest.find((line) => line.title === title)!.number;
const last = manifest.length;
const overlap = (a: StackBox, b: StackBox) => a.start < b.start + b.length && b.start < a.start + a.length;

test('each project stands in the lane its platform names', () => {
  assert.deepEqual(manifest.map((line) => laneOf(line.platform)), [
    'erp', 'dotnet', 'dotnet', 'both', 'both', 'erp', 'erp', 'dotnet', 'dotnet', 'erp',
    'erp', 'erp', 'erp', 'erp', 'dotnet', 'erp', 'erp', 'erp', 'dotnet', 'erp',
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
  const axfinmobile = boxes.find((box) => box.number === lineOf('AXFinMobile'))!;
  const sparepart = boxes.find((box) => box.number === lineOf('Sparepart Management System v2'))!;
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
  assert.deepEqual(stackLayout(manifest, '2026-10'), boxes);
  assert.equal(boxes.length, manifest.length);
  const starts = boxes.map((box) => box.start);
  assert.deepEqual(starts, [...starts].sort((a, b) => a - b));
});

test('the quay spans whole years around the projects: January 2018 to January 2027', () => {
  assert.deepEqual(quayRange(boxes), { start: 0, end: 108 });
});

test('a project in progress runs to the month of the build, at least one month, and says so', () => {
  const lines = [{ number: 1, platform: 'Dynamics 365 F&O, X++', period: { start: '2026-08' } }];
  assert.deepEqual(stackLayout(lines, '2026-10'), [{ number: 1, lane: 'erp', start: 103, length: 2, level: 0, ongoing: true }]);
  assert.equal(stackLayout(lines, '2026-08')[0].length, 1, 'in its first month');
  assert.equal(stackLayout(lines, '2026-06')[0].length, 1, 'built before it starts');
  assert.equal(stackLayout(lines, '2027-03')[0].length, 7, 'and longer with each later build');
  assert.equal('ongoing' in boxes.find((box) => box.number === 2)!, false, 'a finished project says nothing');
});

test('the build month is read in UTC', () => {
  assert.equal(monthOf(new Date('2026-10-31T23:30:00Z')), '2026-10');
  assert.equal(monthOf(new Date('2027-01-01T00:00:00Z')), '2027-01');
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

test('a hovered container slides toward the viewer, never up into the containers stacked on it', () => {
  const [dx, dy, dz] = hoverOffset(geometry.pullDepth);
  assert.deepEqual([dx, dy], [0, 0]);
  assert.ok(dz > 0 && dz < geometry.lanePitch - geometry.boxDepth, 'clear of the lane in front');
  assert.ok(dz < geometry.quayMargin, 'still on the quay');
});

test('a phone view of the newest years stands one container high', () => {
  assert.equal(heightNear(boxes, 90, 20, 20), 1);
});

test('a phone view near 2020 stands as high as its five-high stack', () => {
  assert.equal(heightNear(boxes, 30, 20, 20), 5);
  assert.equal(heightNear(boxes, 50, 20, 20), 5, 'the stack is within reach, so it counts in full');
});

test('a stack beyond reach counts less the further away it is, and not at all past the fade', () => {
  const tower: StackBox[] = [0, 1, 2, 3, 4].map((level) => ({ number: level + 1, lane: 'erp', start: 0, length: 10, level }));
  assert.equal(heightNear(tower, 40, 10, 10), 1, 'past the fade');
  let previous = 1;
  for (let centre = 40; centre >= 10; centre -= 0.5) {
    const height = heightNear(tower, centre, 10, 10);
    assert.ok(height >= previous, `the height fell at month ${centre}`);
    assert.ok(height - previous < 0.4, `the height jumped at month ${centre}`);
    previous = height;
  }
  assert.equal(previous, 5, 'in full once within reach');
  const halfway = heightNear(tower, 25, 10, 10);
  assert.ok(halfway > 1 && halfway < 5, `halfway through the fade: ${halfway}`);
});

test('a long container counts from its nearer end', () => {
  const long: StackBox[] = [
    { number: 1, lane: 'dotnet', start: 0, length: 40, level: 0 },
    { number: 2, lane: 'dotnet', start: 0, length: 40, level: 1 },
  ];
  assert.equal(heightNear(long, 45, 6, 6), 2);
  assert.equal(heightNear(long, 20, 0, 6), 2, 'standing over it');
});

test('the list stands at -1 until its top reaches the reading line, then counts rows past it', () => {
  // The table's top at 100, its rows at 140, 200, 260 and 320
  const rows = [140, 200, 260, 320];
  assert.equal(listProgress(100, rows, 50), -1, 'the list still below the line');
  assert.equal(listProgress(100, rows, 100), -1, 'its top on the line');
  assert.equal(listProgress(100, rows, 120), -0.5, 'halfway down its head');
  assert.equal(listProgress(100, rows, 140), 0, 'the first row on the line');
  assert.equal(listProgress(100, rows, 215), 1.25, 'a quarter of the way through the second row');
  assert.equal(listProgress(100, rows, 320), 3, 'the last row on the line');
  assert.equal(listProgress(100, rows, 900), 3, 'past the end it stays on the last row');
});

test('the list moves on smoothly and never backwards as it scrolls', () => {
  const rows = [140, 200, 260, 320];
  let previous = -1;
  for (let line = 0; line <= 400; line += 1) {
    const progress = listProgress(100, rows, line);
    assert.ok(progress >= previous, `went back at ${line}`);
    assert.ok(progress - previous <= 0.05, `jumped at ${line}`);
    previous = progress;
  }
});

test('a head the same height as nothing goes straight to the first row', () => {
  assert.equal(listProgress(140, [140, 200], 139), -1);
  assert.equal(listProgress(140, [140, 200], 140), 0);
});

test("the camera centres on the middle of the row's container, gliding to the next", () => {
  const middle = (number: number) => {
    const box = boxes.find((b) => b.number === number)!;
    return box.start + box.length / 2;
  };
  assert.equal(followMonth(boxes, 0), middle(1), 'line 01');
  assert.equal(followMonth(boxes, 4), middle(5), 'line 05');
  assert.equal(followMonth(boxes, 4.5), (middle(5) + middle(6)) / 2, 'halfway to line 06');
  assert.equal(followMonth(boxes, last - 1), middle(last), 'the last line');
  assert.equal(followMonth(boxes, 40), middle(last), 'past the last line');
  assert.equal(followMonth(boxes, -1), middle(1), 'before the first line');
});

test('scrolling down the list travels back in time', () => {
  assert.ok(followMonth(boxes, 0) > followMonth(boxes, last - 1));
  assert.ok(followMonth(boxes, 0) >= 96, 'opens in 2026, where line 01 runs');
  assert.ok(followMonth(boxes, last - 1) < 12, 'ends in 2018');
});
