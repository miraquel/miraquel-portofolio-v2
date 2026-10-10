# Career Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show all 19 manifest projects as a 3D container stack on a quay above the All projects table. Time runs along the quay, platform across it, overlaps stack up, the four case studies are painted with their marks, and a crane loads it once.

**Architecture:** A pure, tested layout module (`stack-layout.ts`) turns manifest lines into lanes, month spans, stack levels and a crane schedule. An Astro component serializes that layout with label data into its slot at build time. Its script checks for WebGL 2, keeps or hides the slot, and lazy-imports the three.js scene (`career-stack.ts`) when the slot approaches. The scene draws on demand, with HTML labels laid over the canvas.

**Tech Stack:** Astro 7 (server-rendered on Vercel), TypeScript, three.js 0.186 (already a dependency), Tailwind CSS 4, `node:test` via `tsx --test`, Python Playwright for browser checks.

**Spec:** `docs/superpowers/specs/2026-10-10-career-stack-design.md`

## Global Constraints

- Lanes, back to front: Dynamics ERP (platform names Dynamics, no .NET tech), ERP + .NET (both), .NET (ASP.NET, .NET, Blazor or C#, no Dynamics product). Today: 11 / 2 / 6. The SSIS + C# migrations are .NET.
- A project spans `start` to `end`, the end month not counted, minimum one month.
- Stacking is crane order: start ascending, then longer first, then line number. Each container sits one level above the highest overlapping container already in its lane.
- Paint: the four case studies use their bay's paint (`cobalt` / `oxide`) with their mark in stencil white; the other 15 are printed (paper faces, form-green edges). No new colours. Cobalt and oxide appear only as container steel.
- Lane names are plain words: "Dynamics ERP", "ERP + .NET", ".NET".
- Crane: each container descends over 420 ms on cubic-bezier(0.16, 1, 0.3, 1). Starts are staggered so the whole load finishes within 2.1 s. It runs once, at 40% in view. Reduced motion shows it already loaded, with instant lifts.
- From 1024px (`min-width: 64rem`) the whole quay is in view and panning is off. Below that, 36 months are in view, opening on the most recent, and a sideways drag pans (`touch-action: pan-y`).
- Click, or a second tap, sets `location.hash = 'manifest-N'`. The canvas and labels are `aria-hidden`. The table is unchanged.
- The slot is reserved by default and hidden only without WebGL 2 or on load failure. three.js loads when the slot comes within one viewport (`rootMargin: '100% 0px'`).
- Frames are drawn only while something changes. At rest no `requestAnimationFrame` is pending.
- The three.js chunk is named `three`.
- Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Write messages to a file and use `git commit -F`; never use backticks inside `-m`.

## Review Focus

- A future manifest line whose platform names neither side (e.g. "Flutter, Dart") must fail the build with a message naming it, not land silently in a lane. Pinned in Task 1.
- A period whose end is before its start must be refused, naming the line. A same-month period is one month long. Pinned in Task 1.
- A vertical swipe that starts on a container (phone) must scroll the page and never select or navigate. Checked in Task 4 with CDP touch events.
- The hover label of the first and last containers must stay fully inside the slot. Checked in Task 4.
- Switching to the night print must redraw the printed edges in the night ink without a reload, and leave the steel unchanged. Checked in Task 4.

---

### Task 1: The stack layout (pure, tested)

**Files:**
- Create: `src/lib/stack-layout.ts`
- Test: `tests/stack-layout.test.ts`

**Interfaces:**
- Consumes: `easeOut(t: number): number` from `src/lib/door-swing.ts` (exists on master); `manifest` from `src/data/work.ts` (items have `number`, `platform`, `period: { start: string; end: string }`).
- Produces:
  - `type Lane = 'erp' | 'both' | 'dotnet'`;
  - `lanes: readonly Lane[]` (back to front);
  - `laneNames: Record<Lane, string>`;
  - `laneOf(platform: string): Lane`;
  - `monthIndex(month: string): number`;
  - `interface StackInput { number; platform; period: { start; end } }`;
  - `interface StackBox { number: number; lane: Lane; start: number; length: number; level: number }`;
  - `stackLayout(lines: readonly StackInput[]): StackBox[]` (in loading order);
  - `quayRange(boxes: readonly StackBox[]): { start: number; end: number }`;
  - `dropMs = 420`, `loadMs = 2000`;
  - `dropDelay(index: number, count: number): number`;
  - `dropProgress(index: number, count: number, elapsed: number): number`.

- [ ] **Step 1: Write the failing tests**

Create `tests/stack-layout.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx tsx --test tests/stack-layout.test.ts`
Expected: FAIL with `Cannot find module ... src\lib\stack-layout`.

- [ ] **Step 3: Write the layout module**

Create `src/lib/stack-layout.ts`:

```ts
// The career stack's layout, kept free of three.js so it can be tested: the lane each project
// stands in (its platform), where along the quay it sits and how long it is (its months), how
// high overlapping projects stack, and the crane's schedule for loading them.
import { easeOut } from './door-swing';

export type Lane = 'erp' | 'both' | 'dotnet';

/** The lanes from the back of the quay to the front, and the names printed beside them */
export const lanes: readonly Lane[] = ['erp', 'both', 'dotnet'];
export const laneNames: Record<Lane, string> = { erp: 'Dynamics ERP', both: 'ERP + .NET', dotnet: '.NET' };

const dynamics = /\bDynamics\b/;
const dotnet = /ASP\.NET|\.NET\b|Blazor|C#/;

/** A project's lane, read from its platform text; a platform naming neither side fails the build */
export function laneOf(platform: string): Lane {
  const erp = dynamics.test(platform);
  const net = dotnet.test(platform);
  if (erp && net) return 'both';
  if (erp) return 'erp';
  if (net) return 'dotnet';
  throw new Error(`The career stack has no lane for the platform "${platform}"`);
}

/** Months since January 2018 for a YYYY-MM month (earlier months are negative) */
export function monthIndex(month: string): number {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error(`Not a YYYY-MM month: "${month}"`);
  return (Number(match[1]) - 2018) * 12 + Number(match[2]) - 1;
}

export interface StackInput {
  number: number;
  platform: string;
  period: { start: string; end: string };
}

export interface StackBox {
  /** The manifest line number */
  number: number;
  lane: Lane;
  /** Months since January 2018 at which the project started */
  start: number;
  /** Months it ran, start to end with the end month not counted, at least one */
  length: number;
  /** How many containers it stands on; 0 is the quay */
  level: number;
}

/**
 * Every project placed as the crane loads them: in date order (start, then longer first, then
 * line number), each one level above the highest container already in its lane whose months
 * overlap its own, or on the quay. Returned in that loading order.
 */
export function stackLayout(lines: readonly StackInput[]): StackBox[] {
  const spans = lines.map((line) => {
    const start = monthIndex(line.period.start);
    const end = monthIndex(line.period.end);
    if (end < start) throw new Error(`Manifest line ${line.number} ends before it starts`);
    return { line, start, length: Math.max(1, end - start) };
  });
  spans.sort((a, b) => a.start - b.start || b.length - a.length || a.line.number - b.line.number);

  const placed: StackBox[] = [];
  for (const { line, start, length } of spans) {
    const lane = laneOf(line.platform);
    const beneath = placed.filter((box) => box.lane === lane && box.start < start + length && start < box.start + box.length);
    const level = beneath.length ? Math.max(...beneath.map((box) => box.level)) + 1 : 0;
    placed.push({ number: line.number, lane, start, length, level });
  }
  return placed;
}

/** The quay's ends in months, widened to whole years around the projects */
export function quayRange(boxes: readonly StackBox[]): { start: number; end: number } {
  const start = Math.min(...boxes.map((box) => box.start));
  const end = Math.max(...boxes.map((box) => box.start + box.length));
  return { start: Math.floor(start / 12) * 12, end: Math.ceil(end / 12) * 12 };
}

/** The crane: each container takes dropMs to come down, and the last one lands at loadMs */
export const dropMs = 420;
export const loadMs = 2000;

/** When the container at `index` of `count`, in loading order, starts coming down */
export function dropDelay(index: number, count: number): number {
  return count > 1 ? (index * (loadMs - dropMs)) / (count - 1) : 0;
}

/** How far down that container is, `elapsed` ms into the loading: 0 still above, 1 landed */
export function dropProgress(index: number, count: number, elapsed: number): number {
  return easeOut((elapsed - dropDelay(index, count)) / dropMs);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: all tests pass (36 existing + 11 new = 47), 0 fail.

- [ ] **Step 5: Commit**

```bash
git add src/lib/stack-layout.ts tests/stack-layout.test.ts
git commit -F <message file>   # "feat(stack): lay out the projects as a container stack" + Co-Authored-By line
```

---

### Task 2: The three.js scene

**Files:**
- Create: `src/lib/css-color.ts`
- Create: `src/lib/career-stack.ts`
- Modify: `src/lib/lost-container.ts` (drop its private `token`, import `cssColor`)
- Modify: `astro.config.mjs` (name the three.js chunk)

**Interfaces:**
- Consumes: everything Task 1 produces; `ContainerMark` (`{ owner: string; serial: string; check: number; id: string }`) from `src/lib/container-mark.ts`.
- Produces:
  - `cssColor(name: string, fallback: string, from?: Element): Color`;
  - `interface StackItem extends StackBox { title: string; client: string; period: string; mark?: ContainerMark; steel?: 'cobalt' | 'oxide' }`;
  - `mountCareerStack(slot: HTMLElement): Promise<void>`. The slot must contain a `canvas`, a `[data-stack-marks]` layer and a `[data-stack-label]` element, and carry `data-stack` (a JSON `StackItem[]` in loading order). It throws when WebGL is unavailable.

- [ ] **Step 1: Move the colour reader into its own module**

Create `src/lib/css-color.ts`:

```ts
// A colour from the site's CSS custom properties, for the three.js scenes, so they paint with
// the page's own tokens (and pick up the night print when read again)
import { Color } from 'three';

export function cssColor(name: string, fallback: string, from: Element = document.documentElement): Color {
  const value = getComputedStyle(from).getPropertyValue(name).trim();
  return new Color(value || fallback);
}
```

In `src/lib/lost-container.ts`:
- delete the `function token(name: string, fallback: string): Color { ... }` block;
- add `import { cssColor } from './css-color';` after the `door-swing` import;
- replace the three calls `token('--color-cobalt', …)`, `token('--color-cobalt-deep', …)` and `token('--color-stencil', …)` with `cssColor(` and the same arguments.

Keep the `Color` import: `leafFace` still uses it as a type.

- [ ] **Step 2: Name the three.js chunk**

In `astro.config.mjs`, inside `manualChunks(id)`, after the `ckeditor` line add:

```js
            // three.js, shared by the 404 container and the career stack, both loaded on demand
            if (/[\\/]node_modules[\\/]three[\\/]/.test(id)) return 'three';
```

- [ ] **Step 3: Write the scene**

Create `src/lib/career-stack.ts`:

```ts
// The career stack: every project in the manifest as a container on a quay, drawn with
// three.js. Time runs along the quay, platform across it (three lanes), and projects that
// overlap stack up. The four case studies are painted steel with their marks; the rest are
// printed, paper faces and form-green edges. A crane loads the stack once, the first time
// it comes into view. Frames are drawn only while something changes.
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import type { ContainerMark } from './container-mark';
import { cssColor } from './css-color';
import { dropProgress, laneNames, lanes, loadMs, quayRange, type Lane, type StackBox } from './stack-layout';

/** A container as the page hands it over: its place, and what its label says */
export interface StackItem extends StackBox {
  title: string;
  client: string;
  /** Already formatted, e.g. "Nov 2023 – Feb 2024" */
  period: string;
  /** Case studies only: their mark and their bay's paint */
  mark?: ContainerMark;
  steel?: 'cobalt' | 'oxide';
}

// World units: one month along the quay (x); a container's height and depth in the same units
const boxHeight = 2;
const boxDepth = 2.2;
const lanePitch = 3.2;
const seam = 0.2;
const liftHeight = 0.5;
const liftMs = 150;
const fov = 26;
const elevation = MathUtils.degToRad(24);
/** Below 1024px the view holds three years and pans */
const narrowMonths = 36;

/** Lanes run from the back (-z) to the front (+z) */
const laneZ = (lane: Lane) => (lanes.indexOf(lane) - 1) * lanePitch;
const quayBack = -lanePitch - boxDepth / 2 - 0.8;
const quayFront = lanePitch + boxDepth / 2 + 0.8;

type Point = [number, number, number];

function segments(points: Point[], material: LineBasicMaterial): LineSegments {
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(points.flat(), 3));
  return new LineSegments(geometry, material);
}

/** A case study's long side: its bay paint, corrugated, with its mark stencilled on */
function paintSide(mark: ContainerMark, steel: Color, stencil: Color, length: number): CanvasTexture {
  const scale = 96;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(length * scale);
  canvas.height = Math.round(boxHeight * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = `#${steel.getHexString()}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const pitch = 0.3 * scale;
  for (let x = 0; x < canvas.width; x += pitch) {
    ctx.fillStyle = 'rgb(0 0 0 / 0.14)';
    ctx.fillRect(x + pitch * 0.64, 0, pitch * 0.18, canvas.height);
    ctx.fillStyle = 'rgb(255 255 255 / 0.06)';
    ctx.fillRect(x + pitch * 0.82, 0, pitch * 0.18, canvas.height);
  }

  const words = `${mark.owner} ${mark.serial} `;
  const check = String(mark.check);
  const font = (size: number) => `800 ${size}px "Big Shoulders Stencil Variable", "Arial Narrow", sans-serif`;
  ctx.font = font(100);
  // The words and the digit, plus the box's padding (0.12 each side), per pixel of size
  const perPixel = (ctx.measureText(words).width + ctx.measureText(check).width) / 100 + 0.24;
  const size = Math.min(canvas.height * 0.34, (canvas.width * 0.84) / perPixel);
  ctx.font = font(size);
  ctx.fillStyle = `#${stencil.getHexString()}`;
  ctx.strokeStyle = ctx.fillStyle;
  const wordsWidth = ctx.measureText(words).width;
  const checkWidth = ctx.measureText(check).width;
  const pad = size * 0.12;
  const left = (canvas.width - (wordsWidth + checkWidth + pad * 2)) / 2;
  const baseline = canvas.height * 0.16 + size;
  ctx.fillText(words, left, baseline);
  ctx.fillText(check, left + wordsWidth + pad, baseline);
  ctx.lineWidth = size * 0.07;
  ctx.strokeRect(left + wordsWidth, baseline - size * 0.86, checkWidth + pad * 2, size * 0.98);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** The label's content: title, client, period, and a case study's mark with its boxed check digit */
function labelContent(item: StackItem): HTMLElement[] {
  const element = (tag: 'p' | 'span', className: string, text = '') => {
    const node = document.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  };
  const parts = [
    element('p', 'font-bold leading-snug', item.title),
    element('p', 'text-[0.8125rem] leading-snug', item.client),
    element('p', 'mt-1 font-data text-xs', item.period),
  ];
  if (item.mark) {
    const mark = element('p', 'mt-2 flex items-center gap-[0.3em] font-stencil text-[1.125rem] font-extrabold uppercase leading-none tracking-[0.04em]');
    mark.append(
      element('span', '', item.mark.owner),
      element('span', '', item.mark.serial),
      element('span', 'border-[0.07em] border-current px-[0.14em] leading-[0.95]', String(item.mark.check))
    );
    parts.push(mark);
  }
  return parts;
}

interface Container {
  item: StackItem;
  group: Group;
  mesh: Mesh;
  restY: number;
  lift: number;
  cable: LineSegments;
}

/** Draws the stack into its slot, with its labels laid over the canvas. Throws without WebGL. */
export async function mountCareerStack(slot: HTMLElement): Promise<void> {
  const items: StackItem[] = JSON.parse(slot.dataset.stack ?? '[]');
  const canvas = slot.querySelector('canvas')!;
  const marks = slot.querySelector<HTMLElement>('[data-stack-marks]')!;
  const label = slot.querySelector<HTMLElement>('[data-stack-label]')!;
  // The case studies' marks are painted in the stencil face
  await document.fonts.load('800 100px "Big Shoulders Stencil Variable"');

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Lit so a painted side facing the viewer shows its bay paint exactly: three.js divides
  // diffuse light by pi, and ambient 1.83 plus the key's 2.2 at cos 0.6 to that side sum to pi.
  // Tops catch more light, the ends less. The printed containers are unlit.
  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 1.83));
  const key = new DirectionalLight(0xffffff, 2.2);
  key.position.set(-0.3, 0.75, 0.6);
  scene.add(key);

  // The printed parts take the page's paper and ink, and are recoloured for the night print
  const printedFace = new MeshBasicMaterial({ polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const ink = new LineBasicMaterial();
  const faintInk = new LineBasicMaterial({ transparent: true, opacity: 0.35 });
  const recolor = () => {
    printedFace.color.copy(cssColor('--color-paper', '#e3ede3'));
    const form = cssColor('--color-form', '#24543f');
    ink.color.copy(form);
    faintInk.color.copy(form);
  };
  recolor();
  const stencil = cssColor('--color-stencil', '#f5f7f2');
  const paints = { cobalt: cssColor('--color-cobalt', '#1d4a96'), oxide: cssColor('--color-oxide', '#9a3a25') };

  // The quay: its outline, faint lane dividers, and a tick at each January on the front edge
  const quay = quayRange(items);
  const left = quay.start - 1;
  const right = quay.end + 1;
  const years = Array.from({ length: (quay.end - quay.start) / 12 + 1 }, (_, i) => quay.start + i * 12);
  const outline: Point[] = [
    [left, 0, quayBack], [right, 0, quayBack],
    [right, 0, quayBack], [right, 0, quayFront],
    [right, 0, quayFront], [left, 0, quayFront],
    [left, 0, quayFront], [left, 0, quayBack],
  ];
  const ticks = years.flatMap((x): Point[] => [[x, 0, quayFront], [x, 0, quayFront + 0.9]]);
  const dividers = [-0.5, 0.5].flatMap((between): Point[] => [[left, 0, between * lanePitch], [right, 0, between * lanePitch]]);
  scene.add(segments([...outline, ...ticks], ink), segments(dividers, faintInk));

  const top = Math.max(...items.map((item) => item.level + 1)) * boxHeight + liftHeight;
  const dropHeight = top * 1.5 + 4;
  const containers: Container[] = items.map((item) => {
    const length = item.length - seam;
    const geometry = new BoxGeometry(length, boxHeight, boxDepth);
    const group = new Group();
    let mesh: Mesh;
    if (item.mark && item.steel) {
      const paint = new MeshLambertMaterial({ color: paints[item.steel] });
      const side = new MeshLambertMaterial({ map: paintSide(item.mark, paints[item.steel], stencil, length) });
      // Box faces run +x, -x, +y, -y, +z, -z; the long side facing the viewer (+z) carries the mark
      mesh = new Mesh(geometry, [paint, paint, paint, paint, side, paint]);
      group.add(mesh);
    } else {
      mesh = new Mesh(geometry, printedFace);
      group.add(mesh, new LineSegments(new EdgesGeometry(geometry), ink));
    }
    const restY = boxHeight / 2 + item.level * boxHeight;
    group.position.set(item.start + item.length / 2, restY, laneZ(item.lane));
    const cable = segments([[0, 0, 0], [0, 0, 0]], ink);
    cable.visible = false;
    scene.add(group, cable);
    return { item, group, mesh, restY, lift: 0, cable };
  });

  // The camera looks along -z from above the front; the view holds `span` months around `centre`
  const camera = new PerspectiveCamera(fov, 1, 0.5, 2000);
  const toCamera = new Vector3(0, Math.sin(elevation), Math.cos(elevation));
  const up = new Vector3(0, Math.cos(elevation), -Math.sin(elevation));
  const targetY = top * 0.38;
  const wide = matchMedia('(min-width: 64rem)');
  let span = 0;
  let centre = 0;
  let distance = 0;
  const pannable = () => span < right - left;

  /** How far back the camera stands so `months` of the quay, the whole stack and the years fit */
  const fit = (months: number, aspect: number) => {
    const vertical = Math.tan(MathUtils.degToRad(fov / 2));
    const horizontal = vertical * aspect;
    let needed = 0;
    for (const x of [-months / 2, months / 2]) {
      for (const y of [0, top]) {
        for (const z of [quayBack, quayFront + 2]) {
          const corner = new Vector3(x, y - targetY, z);
          const along = corner.dot(toCamera);
          needed = Math.max(needed, along + Math.abs(corner.x) / (horizontal * 0.96), along + Math.abs(corner.dot(up)) / (vertical * 0.92));
        }
      }
    }
    return needed;
  };
  const aim = () => {
    centre = pannable() ? MathUtils.clamp(centre, left + span / 2, right - span / 2) : (left + right) / 2;
    camera.position.set(centre, targetY, 0).addScaledVector(toCamera, distance);
    camera.lookAt(centre, targetY, 0);
  };

  const project = (x: number, y: number, z: number) => {
    const point = new Vector3(x, y, z).project(camera);
    return { x: ((point.x + 1) / 2) * canvas.clientWidth, y: ((1 - point.y) / 2) * canvas.clientHeight };
  };

  // Printed labels laid over the canvas: years under the ticks, lane names at the newest end
  const yearLabels = years.map((x) => {
    const element = document.createElement('span');
    element.className = 'absolute -translate-x-1/2 font-data text-xs text-form';
    element.textContent = String(2018 + x / 12);
    marks.append(element);
    return { x, element };
  });
  const laneLabels = lanes.map((lane) => {
    const element = document.createElement('span');
    element.className = 'absolute -translate-x-full -translate-y-1/2 whitespace-nowrap pr-2 text-[0.8125rem] font-semibold leading-tight text-form';
    element.textContent = laneNames[lane];
    marks.append(element);
    return { lane, element };
  });

  let hovered: Container | null = null;
  const placeLabels = () => {
    const width = canvas.clientWidth;
    for (const { x, element } of yearLabels) {
      const at = project(x, 0, quayFront + 1.5);
      element.hidden = at.x < 0 || at.x > width;
      element.style.left = `${at.x}px`;
      element.style.top = `${at.y}px`;
    }
    // A lane's name stays pinned to the canvas edge while the view is panned back
    for (const { lane, element } of laneLabels) {
      const at = project(quay.end, 0, laneZ(lane));
      element.style.left = `${Math.min(at.x, width - 4)}px`;
      element.style.top = `${at.y}px`;
    }
    if (!hovered || label.hidden) return;
    const { group } = hovered;
    const anchor = project(group.position.x, group.position.y + boxHeight / 2, group.position.z + boxDepth / 2);
    const labelWidth = label.offsetWidth;
    const labelHeight = label.offsetHeight;
    const above = anchor.y - labelHeight - 10;
    label.style.left = `${MathUtils.clamp(anchor.x - labelWidth / 2, 4, width - labelWidth - 4)}px`;
    label.style.top = `${above >= 4 ? above : Math.min(anchor.y + 10, canvas.clientHeight - labelHeight - 4)}px`;
  };

  // Drawing on demand: the crane, the lifts and anything that moved
  let loaded = reduced;
  let loadStart = -1;
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    frame = 0;
    const dt = last ? now - last : 16;
    last = now;
    let busy = false;
    if (!loaded && loadStart >= 0) {
      const elapsed = now - loadStart;
      containers.forEach((container, index) => {
        const progress = dropProgress(index, containers.length, elapsed);
        const { group, cable, restY } = container;
        group.visible = progress > 0;
        group.position.y = restY + (1 - progress) * dropHeight;
        cable.visible = progress > 0 && progress < 1;
        if (cable.visible) {
          const position = cable.geometry.getAttribute('position');
          position.setXYZ(0, group.position.x, group.position.y + boxHeight / 2, group.position.z);
          position.setXYZ(1, group.position.x, restY + dropHeight + boxHeight * 4, group.position.z);
          position.needsUpdate = true;
        }
      });
      if (elapsed >= loadMs) loaded = true;
      else busy = true;
    }
    for (const container of containers) {
      const target = container === hovered ? liftHeight : 0;
      if (container.lift === target) continue;
      const step = reduced ? liftHeight : (liftHeight * dt) / liftMs;
      container.lift = target > container.lift ? Math.min(target, container.lift + step) : Math.max(target, container.lift - step);
      container.group.position.y = container.restY + container.lift;
      if (container.lift !== target) busy = true;
    }
    renderer.render(scene, camera);
    placeLabels();
    if (busy) requestRender();
    else last = 0;
  };
  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    const wasWhole = !pannable();
    span = wide.matches ? right - left : narrowMonths;
    distance = fit(span, camera.aspect);
    // A narrow view opens on the most recent years
    if (pannable() && (wasWhole || !centre)) centre = right - span / 2;
    aim();
    canvas.style.cursor = pannable() ? 'grab' : '';
    requestRender();
  };

  // Hover (mouse) or first tap (touch) lifts a container and shows its label; a click or a
  // second tap goes to its row in the manifest; a sideways drag pans a narrow view
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const meshes = containers.map((container) => container.mesh);
  const containerAt = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit ? containers[meshes.indexOf(hit.object as Mesh)] : null;
  };
  const hover = (container: Container | null) => {
    if (container === hovered) return;
    hovered = container;
    canvas.style.cursor = container ? 'pointer' : pannable() ? 'grab' : '';
    if (container) {
      label.replaceChildren(...labelContent(container.item));
      label.hidden = false;
    } else {
      label.hidden = true;
    }
    requestRender();
  };
  const goTo = (container: Container) => {
    hover(null);
    location.hash = `manifest-${container.item.number}`;
  };

  let press: { x: number; centre: number; moved: boolean } | null = null;
  canvas.addEventListener('pointerdown', (event) => {
    if (!loaded) return;
    press = { x: event.clientX, centre, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!loaded) return;
    if (press) {
      const dx = event.clientX - press.x;
      if (Math.abs(dx) > 6) press.moved = true;
      if (press.moved && pannable()) {
        centre = press.centre - (dx / canvas.clientWidth) * span;
        aim();
        requestRender();
      }
      return;
    }
    if (event.pointerType === 'mouse') hover(containerAt(event));
  });
  canvas.addEventListener('pointerleave', (event) => {
    if (event.pointerType === 'mouse' && !press) hover(null);
  });
  // The browser took the gesture over (a vertical swipe scrolling the page): nothing is chosen
  canvas.addEventListener('pointercancel', () => {
    press = null;
  });
  canvas.addEventListener('pointerup', (event) => {
    const tap = press !== null && !press.moved;
    press = null;
    if (!loaded || !tap) return;
    const container = containerAt(event);
    if (event.pointerType === 'mouse') {
      if (container) goTo(container);
      return;
    }
    if (container && container === hovered) goTo(container);
    else hover(container);
  });

  // The night print: re-read the paper and ink when the look changes
  const repaint = () => {
    recolor();
    requestRender();
  };
  new MutationObserver(repaint).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', repaint);

  containers.forEach((container) => (container.group.visible = loaded));
  new ResizeObserver(resize).observe(canvas);
  wide.addEventListener('change', resize);
  resize();

  if (!loaded) {
    // The crane starts once 40% of the stack is in view, and only ever once
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadStart = performance.now();
        requestRender();
      },
      { threshold: 0.4 }
    );
    observer.observe(slot);
  }
}
```

- [ ] **Step 4: Type-check and build**

Run: `npx astro check`
Expected: `0 errors`, `0 warnings`.
Run: `npm test`
Expected: 47 pass, 0 fail.
Run: `npx astro build`
Expected: `Complete!`, and `.vercel/output/static/_astro/` contains a `three.*.js` chunk (about 131 KB gzipped).

- [ ] **Step 5: Check the 404 container still works after the colour move**

Start dev: `npx astro dev --port 4321 --host 127.0.0.1` (it detaches; stop later with `npx astro dev stop`).
Run the existing scratchpad check: `python lost-behaviour.py http://127.0.0.1:4321`
Expected:
- `rAF calls in 2s at rest: 0`
- `drag changed the picture: True`
- `three.js chunk requested (WebGL off): False | three errors: 0`

- [ ] **Step 6: Commit**

```bash
git add src/lib/css-color.ts src/lib/career-stack.ts src/lib/lost-container.ts astro.config.mjs
git commit -F <message file>   # "feat(stack): the three.js scene for the career stack" + Co-Authored-By line
```

---

### Task 3: Put the stack on the page

**Files:**
- Create: `src/components/lading/CareerStack.astro`
- Modify: `src/components/lading/Manifest.astro` (render it between the section head and the table)
- Modify: `DESIGN.md` (Career Stack entry, two motions, depth note)

**Interfaces:**
- Consumes: `stackLayout` (Task 1); `StackItem` type and `mountCareerStack(slot)` (Task 2); `manifest` from `src/data/work.ts`; `formatPeriod` from `src/lib/format.ts`.
- Produces: the `[data-career-stack]` slot on the homepage, which Task 4's checks drive.

- [ ] **Step 1: Write the component**

Create `src/components/lading/CareerStack.astro`:

```astro
---
// All projects as a 3D stack of containers on a quay (src/lib/career-stack.ts): time along
// the quay, platform across it, overlaps stacked, the case studies painted with their marks.
// It repeats the manifest below, which stays the complete, accessible list, so the stack is
// decorative. Its space is kept unless the browser lacks WebGL 2; three.js loads on approach.
import { manifest } from '../../data/work';
import type { StackItem } from '../../lib/career-stack';
import { formatPeriod } from '../../lib/format';
import { stackLayout } from '../../lib/stack-layout';

const items: StackItem[] = stackLayout(manifest).map((box) => {
  const line = manifest[box.number - 1];
  return {
    ...box,
    title: line.title,
    client: line.client,
    period: formatPeriod(line.period),
    ...(line.container && { mark: line.container.mark, steel: line.container.steel }),
  };
});
---

<div data-career-stack data-stack={JSON.stringify(items)} aria-hidden="true" class="relative mt-8 h-[17rem] lg:h-[20rem]">
  <canvas class="absolute inset-0 size-full"></canvas>
  <div data-stack-marks class="pointer-events-none absolute inset-0 overflow-hidden"></div>
  <div
    data-stack-label
    hidden
    class="pointer-events-none absolute left-0 top-0 z-10 w-max max-w-[17rem] border-2 border-form bg-paper px-3 py-2 text-ink"
  >
  </div>
</div>

<style>
  /* A sideways drag pans the quay on a phone; a vertical one still scrolls the page */
  canvas {
    touch-action: pan-y;
  }
</style>

<script>
  const slot = document.querySelector<HTMLElement>('[data-career-stack]');
  if (slot) {
    // three.js draws with WebGL 2; without it the slot gives its space back to the table
    const probe = document.createElement('canvas').getContext('webgl2');
    probe?.getExtension('WEBGL_lose_context')?.loseContext();
    if (!probe) slot.hidden = true;
    else {
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          import('../../lib/career-stack')
            .then(({ mountCareerStack }) => mountCareerStack(slot))
            .catch(() => (slot.hidden = true));
        },
        { rootMargin: '100% 0px' }
      );
      observer.observe(slot);
    }
  }
</script>
```

- [ ] **Step 2: Place it in the manifest section**

In `src/components/lading/Manifest.astro`, add the import after `import Mark from './Mark.astro';`:

```astro
import CareerStack from './CareerStack.astro';
```

Then insert the component between the closing `/>` of `<SectionHead … />` and `<table role="table" …>`:

```astro
    <CareerStack />
```

- [ ] **Step 3: Record it in DESIGN.md**

In `DESIGN.md`:

1. Replace the key-characteristics line
   `- One authored motion: container door leaves swinging open on arrival.`
   with
   `- Two authored motions: container door leaves swinging open on arrival, and a crane loading the career stack once.`
2. In "Elevation & Depth", replace
   `the only dimensional object is the container door leaf during its swing.`
   with
   `the only dimensional objects are the container door leaf during its swing and the career stack, whose painted containers are lit but cast nothing onto the paper.`
3. Replace the Do line
   `- **Do** keep smooth scrolling and the door swing behind \`prefers-reduced-motion: no-preference\`.`
   with
   `- **Do** keep smooth scrolling, the door swing and the crane behind \`prefers-reduced-motion: no-preference\`.`
4. Insert this section before `### Admin Workspace`:

```markdown
### Career Stack
All projects as a 3D stack of containers on a quay, drawn with three.js (`src/lib/career-stack.ts`, layout in `src/lib/stack-layout.ts`), between the All projects heading and the manifest.

- **Time** runs along the quay, January to January in whole years. A container spans its project's months, the end month not counted.
- **Platform** runs across it in three lanes, back to front: Dynamics ERP, ERP + .NET, .NET. The lane is read from the manifest's platform text, and a platform naming neither side fails the build.
- **Overlaps** stack as a crane drops them: in date order, each one level above the highest overlapping container in its lane.
- **Paint:** the four case studies are their bay's steel, lit to show the paint exactly on the side facing the viewer, with their mark in stencil white. The rest are printed: paper faces, unlit, with form-green edges.
- **The quay** is form-green lines: an outline, faint lane dividers, a tick at each January. The year labels (mono) and the lane names (label style, at the newest end, pinned to the canvas edge when panned back) are HTML over the canvas.
- **Hover or first tap:** a container lifts 0.5 units over 150ms and a field-style label gives its title, client, period and, for a case study, its mark. **Click or second tap:** goes to its manifest line. **Sideways drag:** pans the view below 1024px, which holds three years and opens on the most recent; from 1024px the whole quay is in view.
- **Crane:** the first time 40% of it is in view, each container is lowered on a form-green cable over 420ms on the bays' curve, staggered so all have landed by 2s.
- **Reduced motion:** stacked from the start, with instant lifts.
- **Night print:** the printed parts are redrawn in the night paper and ink; the steel is the same.
- **Drawing and loading:** it draws only while something changes. It's decorative (`aria-hidden`); the manifest stays the complete list. Its space is reserved and given back only without WebGL 2; three.js loads when it is a screen away.
```

- [ ] **Step 4: Check, test and build**

Run: `npx astro check` → `0 errors`, `0 warnings`.
Run: `npm test` → 47 pass, 0 fail.
Run: `npx astro build` → `Complete!`.

- [ ] **Step 5: Look at it on dev**

With the dev server running, screenshot the section at both sizes:

```bash
python -c "
from playwright.sync_api import sync_playwright
import time
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in ((1440, 900), (390, 844)):
        pg = b.new_page(viewport={'width': w, 'height': h})
        pg.goto('http://127.0.0.1:4321/#manifest', wait_until='load')
        time.sleep(4)
        pg.screenshot(path=f'stack-{w}.png')
    b.close()
"
```

Expected:
- the quay with nineteen containers, the four case studies painted with their marks;
- years 2018–2026 under the ticks, and lane names at the right end;
- the table below unmoved.

If the stack's content fills less than about half the slot's height, adjust the slot height within 16–22rem (`h-[…] lg:h-[…]`) and note the values in DESIGN.md.

- [ ] **Step 6: Commit**

```bash
git add src/components/lading/CareerStack.astro src/components/lading/Manifest.astro DESIGN.md
git commit -F <message file>   # "feat(stack): show the career stack above the manifest" + Co-Authored-By line
```

---

### Task 4: Browser checks, including the Review Focus cases

**Files:**
- Create (scratchpad, not committed): `stack-check.py` in the session scratchpad directory

**Interfaces:**
- Consumes: the homepage slot `[data-career-stack]` with its `canvas`, `[data-stack-label]` and `[data-stack-marks]`; the `three.*.js` chunk name; manifest rows `#manifest-N`.
- Produces: a pass/fail report printed to the terminal, plus screenshots for the summary.

- [ ] **Step 1: Write the check script**

Create `stack-check.py` in the scratchpad:

```python
"""The career stack in a browser: loading, crane frames, hover, click, phone pan and swipe, night
print, reduced motion, no WebGL, idle drawing.

usage: [SHARE=<vercel share link>] python stack-check.py BASE OUTDIR
"""
import os
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

base, out = sys.argv[1].rstrip('/'), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
results = []


def ink_pixels(png, rgb, tolerance=14):
    """How many pixels of a screenshot are within `tolerance` of a colour"""
    from io import BytesIO
    from PIL import Image
    image = Image.open(BytesIO(png)).convert('RGB')
    return sum(1 for pixel in image.get_flattened_data() if all(abs(a - b) <= tolerance for a, b in zip(pixel, rgb)))


def check(name, ok, detail=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (f' ({detail})' if detail else ''))


def open_page(p, width, height, *, webgl=True, motion='no-preference', touch=False, clock=False):
    browser = p.chromium.launch(args=[] if webgl else ['--disable-webgl', '--disable-3d-apis'])
    context = browser.new_context(viewport={'width': width, 'height': height}, reduced_motion=motion,
                                  has_touch=touch, is_mobile=touch, device_scale_factor=2 if touch else 1)
    page = context.new_page()
    scripts = []
    page.on('request', lambda r: r.resource_type == 'script' and scripts.append(r.url.rsplit('/', 1)[-1]))
    if os.environ.get('SHARE'):
        page.goto(os.environ['SHARE'])
    if clock:
        page.clock.install()
    page.goto(base + '/', wait_until='load')
    return browser, context, page, scripts


three = lambda scripts: [s for s in scripts if s.startswith('three') or 'career-stack' in s]
SLOT = '[data-career-stack]'
COUNT_FRAMES = """() => new Promise((done) => {
  let frames = 0; const original = window.requestAnimationFrame;
  window.requestAnimationFrame = (cb) => { frames++; return original.call(window, cb); };
  setTimeout(() => { window.requestAnimationFrame = original; done(frames); }, 2000);
})"""

with sync_playwright() as p:
    # Desktop: nothing on load at the top, three.js on approach, crane frames with a paused clock
    browser, context, page, scripts = open_page(p, 1440, 900, clock=True)
    time.sleep(2)
    check('no three.js at the top of the page', not three(scripts), str(three(scripts)))
    page.clock.pause_at(page.evaluate('Date.now()') + 50)
    page.locator(SLOT).scroll_into_view_if_needed()
    time.sleep(2.5)  # the import and the mount run on real time
    check('three.js fetched on approach', bool(three(scripts)), str(three(scripts)))
    box = page.locator(SLOT).bounding_box()
    clip = {'x': 0, 'y': box['y'] - 10, 'width': 1440, 'height': box['height'] + 20}
    elapsed = 0
    for ms in (16, 600, 1200, 2200):
        page.clock.run_for(ms - elapsed)
        elapsed = ms
        page.screenshot(path=str(out / f'crane-{ms:04d}.png'), clip=clip)
    page.clock.resume()
    time.sleep(0.5)
    check('at rest no frames are requested', page.evaluate(COUNT_FRAMES) == 0)

    # Hover the first and last containers along the quay: the right label, inside the slot
    canvas = page.locator(f'{SLOT} canvas')
    cb = canvas.bounding_box()
    label = page.locator('[data-stack-label]')
    seen = {}
    for frac in [i / 60 for i in range(1, 60)]:
        page.mouse.move(cb['x'] + cb['width'] * frac, cb['y'] + cb['height'] * 0.62)
        time.sleep(0.05)
        if label.is_visible():
            seen.setdefault('first', (frac, label.inner_text()))
            seen['last'] = (frac, label.inner_text())
            lb = label.bounding_box()
            inside = lb['x'] >= cb['x'] - 1 and lb['x'] + lb['width'] <= cb['x'] + cb['width'] + 1 and lb['y'] >= cb['y'] - 1
            if not inside:
                check('label stays inside the slot', False, f'at {frac:.2f}: {lb}')
                break
    else:
        check('label stays inside the slot', bool(seen), str({k: v[1].splitlines()[0] for k, v in seen.items()}))
    page.screenshot(path=str(out / 'hover.png'), clip=clip)

    # Click the container under the pointer: the location hash names its manifest row
    frac, text = seen['last']
    page.mouse.move(cb['x'] + cb['width'] * frac, cb['y'] + cb['height'] * 0.62)
    time.sleep(0.1)
    page.mouse.click(cb['x'] + cb['width'] * frac, cb['y'] + cb['height'] * 0.62)
    time.sleep(1)
    hash_ = page.evaluate('location.hash')
    row = page.locator(hash_).inner_text() if hash_ else ''
    check('a click goes to that project\'s manifest row', bool(hash_) and text.splitlines()[0] in row, f'{hash_}: {text.splitlines()[0]}')

    # Night print: the canvas's printed edges change from the day ink to the night ink without
    # a reload (the HTML labels are hidden for the count, since CSS recolours them anyway)
    page.locator(SLOT).scroll_into_view_if_needed()
    page.evaluate("document.querySelector('[data-stack-marks]').style.visibility = 'hidden'")
    ink_counts = lambda png: ink_pixels(png, (0x24, 0x54, 0x3f)), ink_pixels(png, (0x86, 0xb8, 0x9b))
    day = ink_counts(canvas.screenshot())
    page.evaluate("document.documentElement.dataset.theme = 'dark'")
    time.sleep(0.4)
    night = ink_counts(canvas.screenshot())
    check('the night print redraws the printed edges in the night ink',
          day[0] > 200 and night[0] < day[0] * 0.05 and night[1] > 200, f'day ink/night ink: {day} -> {night}')
    page.evaluate("document.querySelector('[data-stack-marks]').style.visibility = ''")
    page.screenshot(path=str(out / 'night.png'), clip=clip)
    browser.close()

    # Phone: opens on the most recent years, pans by a sideways swipe, scrolls on a vertical one
    browser, context, page, scripts = open_page(p, 390, 844, touch=True)
    page.locator(SLOT).scroll_into_view_if_needed()
    time.sleep(4)
    canvas = page.locator(f'{SLOT} canvas')
    cb = canvas.bounding_box()
    page.screenshot(path=str(out / 'phone.png'), clip={'x': 0, 'y': cb['y'] - 10, 'width': 390, 'height': cb['height'] + 20})
    cdp = context.new_cdp_session(page)

    def swipe(x0, y0, x1, y1):
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y0}]})
        for i in range(1, 13):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / 12, 'y': y0 + (y1 - y0) * i / 12}]})
            time.sleep(0.016)
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
        time.sleep(0.6)

    cx, cy = cb['x'] + cb['width'] * 0.5, cb['y'] + cb['height'] * 0.6
    years_before = page.locator('[data-stack-marks] span:not([hidden])').all_inner_texts()
    swipe(cx - 100, cy, cx + 100, cy)
    years_after = page.locator('[data-stack-marks] span:not([hidden])').all_inner_texts()
    check('a sideways swipe pans back in time', years_before != years_after, f'{years_before} -> {years_after}')
    y0, hash0 = page.evaluate('scrollY'), page.evaluate('location.hash')
    swipe(cx, cy + 80, cx, cy - 80)
    check('a vertical swipe on a container scrolls the page',
          page.evaluate('scrollY') > y0 and page.evaluate('location.hash') == hash0
          and not page.locator('[data-stack-label]').is_visible(),
          f'scrollY {y0} -> {page.evaluate("scrollY")}')
    browser.close()

    # Reduced motion: stacked at once (the picture does not change after the first draw)
    browser, context, page, scripts = open_page(p, 1440, 900, motion='reduce')
    page.locator(SLOT).scroll_into_view_if_needed()
    time.sleep(3)
    first = page.locator(f'{SLOT} canvas').screenshot()
    time.sleep(1)
    check('reduced motion shows the stack already loaded', first == page.locator(f'{SLOT} canvas').screenshot())
    browser.close()

    # No WebGL: the slot is hidden, three.js never fetched, the table where it was
    browser, context, page, scripts = open_page(p, 1440, 900, webgl=False)
    time.sleep(1)
    page.locator('#manifest').scroll_into_view_if_needed()
    time.sleep(2)
    check('without WebGL the slot is hidden and three.js is not fetched',
          not page.locator(SLOT).is_visible() and not three(scripts))
    browser.close()

print(f'{sum(results)}/{len(results)} checks passed')
```

- [ ] **Step 2: Run it on dev**

Run: `python stack-check.py http://127.0.0.1:4321 stack-shots`
Expected: every line `PASS`, ending `N/N checks passed`. Then look at `crane-0000.png` (empty quay), `crane-0600.png` (containers coming down on cables), `crane-2200.png` (full stack), `hover.png`, `night.png` and `phone.png`.

If a check fails, fix the code in the task that owns it (Task 2 for scene behaviour, Task 3 for the slot), re-run the full script, then commit that fix with a message naming the check.

- [ ] **Step 3: Re-run the 404 checks and the suite**

Run: `python lost-behaviour.py http://127.0.0.1:4321` → the same results as in Task 2, Step 5.
Run: `npm test` → 47 pass.
Stop the dev server: `npx astro dev stop`.
