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
import { dropProgress, followMonth, geometry, heightNear, hoverOffset, laneNames, lanes, listProgress, loadMs, quayRange, type Lane, type StackBox } from './stack-layout';

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
const { boxHeight, boxDepth, lanePitch, quayMargin, pullDepth } = geometry;
const seam = 0.2;
const pullMs = 150;
const fov = 26;
/** The camera's angle above the quay: the whole quay's, and a panning view's, steeper so the
 *  quay's lanes take more of a short slot */
const elevation = MathUtils.degToRad(30);
const phoneElevation = MathUtils.degToRad(40);
const tanHalf = Math.tan(MathUtils.degToRad(fov / 2));

/** Lanes run from the back (-z) to the front (+z) */
const laneZ = (lane: Lane) => (lanes.indexOf(lane) - 1) * lanePitch;
const quayBack = -lanePitch - boxDepth / 2 - quayMargin;
const quayFront = lanePitch + boxDepth / 2 + quayMargin;

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
  /** The container's shape at rest, for picking, so a container sliding out never slips from under the pointer */
  hit: Mesh;
  restY: number;
  restZ: number;
  /** How far it has slid toward the viewer, 0 to pullDepth */
  pull: number;
  cable: LineSegments;
  /** Marks it as the current row's: paper-deep faces if printed, a stencil-white outline if painted,
   *  nothing more if it is the yellow one in progress */
  mark: (on: boolean) => void;
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
  const markedFace = printedFace.clone();
  const ink = new LineBasicMaterial();
  const faintInk = new LineBasicMaterial({ transparent: true, opacity: 0.35 });
  const recolor = () => {
    printedFace.color.copy(cssColor('--color-paper', '#e3ede3'));
    markedFace.color.copy(cssColor('--color-paper-deep', '#d2e2d5'));
    const form = cssColor('--color-form', '#24543f');
    ink.color.copy(form);
    faintInk.color.copy(form);
  };
  recolor();
  const stencil = cssColor('--color-stencil', '#f5f7f2');
  const stencilInk = new LineBasicMaterial({ color: stencil });
  // A project in progress is printed on signal stock, the same by night, so it keeps the day ink
  const signalFace = new MeshBasicMaterial({ color: cssColor('--color-signal', '#f2c21b'), polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
  const dayInk = new LineBasicMaterial({ color: cssColor('--color-day-form', '#24543f') });
  const paints = { cobalt: cssColor('--color-cobalt', '#1d4a96'), oxide: cssColor('--color-oxide', '#9a3a25') };

  // The quay: its outline, faint lane dividers, and a tick at each January on the front edge
  const quay = quayRange(items);
  const left = quay.start - 1;
  const right = quay.end + 1;
  /** The view reaches past the quay's end by a margin that holds the lane names */
  const viewRight = right + 8;
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

  const top = Math.max(...items.map((item) => item.level + 1)) * boxHeight;
  const dropHeight = top * 1.5 + 4;
  const containers: Container[] = items.map((item) => {
    const length = item.length - seam;
    const geometry = new BoxGeometry(length, boxHeight, boxDepth);
    const group = new Group();
    let mark: (on: boolean) => void;
    if (item.mark && item.steel) {
      const paint = new MeshLambertMaterial({ color: paints[item.steel] });
      const side = new MeshLambertMaterial({ map: paintSide(item.mark, paints[item.steel], stencil, length) });
      const outline = new LineSegments(new EdgesGeometry(geometry), stencilInk);
      outline.visible = false;
      // Box faces run +x, -x, +y, -y, +z, -z; the long side facing the viewer (+z) carries the mark
      group.add(new Mesh(geometry, [paint, paint, paint, paint, side, paint]), outline);
      mark = (on) => (outline.visible = on);
    } else if (item.ongoing) {
      // The one live fact on the quay is already yellow: as the current row's it only slides out
      group.add(new Mesh(geometry, signalFace), new LineSegments(new EdgesGeometry(geometry), dayInk));
      mark = () => {};
    } else {
      const face = new Mesh(geometry, printedFace);
      group.add(face, new LineSegments(new EdgesGeometry(geometry), ink));
      mark = (on) => (face.material = on ? markedFace : printedFace);
    }
    const restY = boxHeight / 2 + item.level * boxHeight;
    const restZ = laneZ(item.lane);
    group.position.set(item.start + item.length / 2, restY, restZ);
    const hit = new Mesh(geometry);
    hit.position.copy(group.position);
    hit.updateMatrixWorld();
    const cable = segments([[0, 0, 0], [0, 0, 0]], ink);
    cable.visible = false;
    scene.add(group, cable);
    return { item, group, hit, restY, restZ, pull: 0, cable, mark };
  });

  // The camera looks along -z from above the front, at the month `centre`.
  // A desktop shows the whole quay. Below 1024px, unless the whole quay fits or the screen is too
  // short for the stack to stick, the camera follows the manifest: it centres on the container of
  // the row at the stack's foot, standing as close as the stacks around it allow, in close over
  // the newest years and pulled back to frame the 2020 tower.
  const camera = new PerspectiveCamera(fov, 1, 0.5, 2000);
  const toCamera = new Vector3();
  const up = new Vector3();
  const tilt = (angle: number) => {
    toCamera.set(0, Math.sin(angle), Math.cos(angle));
    up.set(0, Math.cos(angle), -Math.sin(angle));
  };
  tilt(elevation);
  const targetY = top * 0.38;
  const wide = matchMedia('(min-width: 64rem)');
  /** The stack sticks under the strip only where that leaves room for the list (CareerStack.astro) */
  const tall = matchMedia('(min-height: 36rem)');
  let centre = 0;
  let distance = 0;
  let whole = true;
  /** Within this many months of the view's centre a stack is framed in full */
  let reach = 0;

  /** How far back the camera stands so `months` of the quay, the whole stack and the years fit */
  const fit = (months: number, aspect: number) => {
    const horizontal = tanHalf * aspect;
    let needed = 0;
    for (const x of [-months / 2, months / 2]) {
      for (const y of [0, top]) {
        for (const z of [quayBack, quayFront + 2]) {
          const corner = new Vector3(x, y - targetY, z);
          const along = corner.dot(toCamera);
          needed = Math.max(needed, along + Math.abs(corner.x) / (horizontal * 0.96), along + Math.abs(corner.dot(up)) / (tanHalf * 0.92));
        }
      }
    }
    return needed;
  };
  /** The months a camera `back` from its aim at `aimY` shows across the front lane's floor */
  const monthsShown = (back: number, aimY: number) =>
    2 * (back - new Vector3(0, -aimY, lanePitch).dot(toCamera)) * tanHalf * camera.aspect;
  /** A following view around `at`: the height it aims at, how far back it stands, the months it shows */
  const standAt = (at: number, height = heightNear(items, at, reach, reach) * boxHeight) => {
    // Aimed so the stack's top and the row of years stand equally far inside the frame
    const need = (y: number, z: number) => {
      const corner = new Vector3(0, y, z);
      return corner.dot(toCamera) + Math.abs(corner.dot(up)) / (tanHalf * 0.92);
    };
    let low = 0;
    let high = height;
    for (let i = 0; i < 24; i++) {
      const mid = (low + high) / 2;
      if (need(height - mid, quayBack) > need(-mid, quayFront + 2)) low = mid;
      else high = mid;
    }
    const aimY = (low + high) / 2;
    const back = Math.max(need(height - aimY, quayBack), need(-aimY, quayFront + 2));
    return { aimY, back, months: monthsShown(back, aimY) };
  };
  /** The newest a following view goes: just past the quay's end by its lane names */
  const newestAt = ({ aimY, back }: ReturnType<typeof standAt>) => {
    const half = canvas.clientWidth / 2;
    return Math.max(...laneLabels.map(({ lane, element }) => {
      const depth = back - new Vector3(0, -aimY, laneZ(lane)).dot(toCamera);
      const perMonth = half / (depth * tanHalf * camera.aspect);
      return right - (half - element.offsetWidth - 6) / perMonth;
    }));
  };
  /** A following view as near `at` as the quay allows: from the oldest year to just past the
   *  newest end. Its width depends on where it stands, so the limits settle in a few steps. */
  const settle = (at: number) => {
    let stand = standAt(at);
    for (let i = 0; i < 3; i++) {
      at = MathUtils.clamp(at, left + stand.months / 2, newestAt(stand));
      stand = standAt(at);
    }
    return { at, stand };
  };
  const aim = () => {
    if (whole) {
      centre = (left + viewRight) / 2;
      camera.position.set(centre, targetY, 0).addScaledVector(toCamera, distance);
      camera.lookAt(centre, targetY, 0);
      return;
    }
    const { at, stand } = settle(centre);
    centre = at;
    camera.position.set(centre, stand.aimY, 0).addScaledVector(toCamera, stand.back);
    camera.lookAt(centre, stand.aimY, 0);
  };

  const project = (x: number, y: number, z: number) => {
    const point = new Vector3(x, y, z).project(camera);
    return { x: ((point.x + 1) / 2) * canvas.clientWidth, y: ((1 - point.y) / 2) * canvas.clientHeight };
  };

  // Printed labels laid over the canvas: years under the ticks, lane names just past the
  // quay's newest end, where no container stands
  const yearLabels = years.map((x) => {
    const element = document.createElement('span');
    element.className = 'absolute -translate-x-1/2 font-data text-xs text-form';
    element.textContent = String(2018 + x / 12);
    marks.append(element);
    return { x, element };
  });
  const laneLabels = lanes.map((lane) => {
    const element = document.createElement('span');
    element.className = 'absolute -translate-y-1/2 whitespace-nowrap pl-2 text-xs font-semibold leading-tight text-form';
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
    // A lane's name stands past the quay's end, so a following view slides it away with the quay
    // rather than laying it over the containers
    for (const { lane, element } of laneLabels) {
      const at = project(right, 0, laneZ(lane));
      element.style.left = `${whole ? Math.min(at.x, width - element.offsetWidth - 4) : at.x}px`;
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

  // The manifest under the stack: the row at the stack's foot is the current one. Its container
  // slides forward and is marked; a following camera centres on it, gliding between rows as the list scrolls
  // (stepping from row to row under reduced motion). While the stack is stuck, a rule marks its foot.
  const table = slot.parentElement?.querySelector('table');
  const rows = table ? [...table.tBodies[0].rows] : [];
  let current: Container | null = null;
  const follow = () => {
    if (!table || !rows.length) return;
    const foot = slot.getBoundingClientRect();
    const progress = listProgress(table.getBoundingClientRect().top, rows.map((row) => row.getBoundingClientRect().top), foot.bottom);
    const step = reduced ? Math.round(progress) : progress;
    const now = progress > -0.5 ? (containers.find((container) => container.item.number === Math.round(progress) + 1) ?? null) : null;
    if (now !== current) {
      current?.mark(false);
      now?.mark(true);
      current = now;
    }
    slot.classList.toggle('is-stuck', tall.matches && progress > -1 && Math.abs(foot.top - parseFloat(getComputedStyle(slot).top)) < 1);
    if (whole) return;
    if (step <= -1) {
      centre = Infinity;
    } else {
      const target = followMonth(items, step);
      const opening = settle(Infinity).at;
      centre = step >= 0 ? target : opening + (target - opening) * (step + 1);
    }
    aim();
  };

  // Drawing on demand: the crane, the slides, the list scrolling and anything that moved
  let loaded = reduced;
  let loadStart = -1;
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    frame = 0;
    const dt = last ? now - last : 16;
    last = now;
    let busy = false;
    follow();
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
    // A hovered or current container slides toward the viewer; lifting it would push it into
    // the containers stacked on it
    for (const container of containers) {
      const target = container === hovered || container === current ? pullDepth : 0;
      if (container.pull === target) continue;
      const step = reduced ? pullDepth : (pullDepth * dt) / pullMs;
      container.pull = target > container.pull ? Math.min(target, container.pull + step) : Math.max(target, container.pull - step);
      const [, , dz] = hoverOffset(container.pull);
      container.group.position.z = container.restZ + dz;
      if (container.pull !== target) busy = true;
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
    // Months are counted across the front lane's floor, nearest the viewer, so the limits match
    // the picture. A view that shows the whole quay pulled back to frame the tallest stack, or a
    // stack that can't stick, doesn't follow the list.
    tilt(phoneElevation);
    const far = standAt(-Infinity, top);
    reach = monthsShown(far.back, far.aimY) / 2;
    whole = wide.matches || !tall.matches || 2 * reach >= viewRight - left;
    if (whole) {
      tilt(elevation);
      distance = fit(viewRight - left, camera.aspect);
    } else {
      // A following view opens on the most recent years
      centre = Infinity;
    }
    aim();
    requestRender();
  };

  // Hover (mouse) or first tap (touch) slides a container out and shows its label; a click or a
  // second tap goes to its row in the manifest, and a following camera goes with it
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const meshes = containers.map((container) => container.hit);
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
    canvas.style.cursor = container ? 'pointer' : '';
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
    const id = `manifest-${container.item.number}`;
    // Setting the hash it already has does nothing, so scroll back to the row instead
    if (location.hash === `#${id}`) document.getElementById(id)?.scrollIntoView();
    else location.hash = id;
  };

  let press: { x: number; moved: boolean } | null = null;
  canvas.addEventListener('pointerdown', (event) => {
    if (!loaded) return;
    press = { x: event.clientX, moved: false };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!loaded) return;
    if (press) {
      // A finger that moves is scrolling or swiping, not tapping
      if (Math.abs(event.clientX - press.x) > 6) press.moved = true;
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
  tall.addEventListener('change', resize);
  addEventListener('scroll', requestRender, { passive: true });
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
