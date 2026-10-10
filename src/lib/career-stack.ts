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
const boxHeight = 2.6;
const boxDepth = 2.6;
const lanePitch = 3.8;
const seam = 0.2;
const liftHeight = 0.5;
const liftMs = 150;
const fov = 26;
const elevation = MathUtils.degToRad(30);
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
  const pannable = () => span < viewRight - left;

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
    centre = pannable() ? MathUtils.clamp(centre, left + span / 2, viewRight - span / 2) : (left + viewRight) / 2;
    camera.position.set(centre, targetY, 0).addScaledVector(toCamera, distance);
    camera.lookAt(centre, targetY, 0);
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
    // A lane's name stays pinned to the canvas edge while the view is panned back
    for (const { lane, element } of laneLabels) {
      const at = project(right, 0, laneZ(lane));
      element.style.left = `${Math.min(at.x, width - element.offsetWidth - 4)}px`;
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
    span = wide.matches ? viewRight - left : narrowMonths;
    distance = fit(span, camera.aspect);
    // A narrow view opens on the most recent years
    if (pannable() && (wasWhole || !centre)) centre = viewRight - span / 2;
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
