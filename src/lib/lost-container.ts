// The empty container on the 404 page: a 20 ft box in cobalt steel, built in code, whose
// doors swing open (the bays' one motion) to show that the hold is empty. A visitor can drag
// it to turn it. It only draws when something changes, so at rest it costs nothing.
import {
  BackSide,
  Box3,
  BoxGeometry,
  DirectionalLight,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  type Material,
} from 'three';
import { notFoundMark } from './container-mark';
import { cssColor, lockingRods, paintLeaf } from './door-leaf';
import { doorAngle, openAngle, swingMs } from './door-swing';

// ISO 668 1CC outside dimensions, in metres
const L = 6.058;
const W = 2.438;
const H = 2.591;

/** The angle the camera looks from, and how far a drag may turn the box either way */
const viewAzimuth = MathUtils.degToRad(24);
const viewElevation = MathUtils.degToRad(12);
const turnLimit = MathUtils.degToRad(45);
const fov = 30;

function box(width: number, height: number, depth: number, material: Material | Material[], x: number, y: number, z: number) {
  const mesh = new Mesh(new BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  return mesh;
}

function buildContainer() {
  const cobalt = cssColor('--color-cobalt', '#1d4a96');
  const cobaltDeep = cssColor('--color-cobalt-deep', '#173c7a');
  const stencil = cssColor('--color-stencil', '#f5f7f2');

  const steel = new MeshStandardMaterial({ color: cobalt, roughness: 0.62, metalness: 0.25 });
  const frame = new MeshStandardMaterial({ color: cobaltDeep, roughness: 0.55, metalness: 0.3 });
  const rodSteel = new MeshStandardMaterial({ color: cobaltDeep.clone().multiplyScalar(0.5), roughness: 0.4, metalness: 0.5 });
  const hold = new MeshStandardMaterial({ color: cobaltDeep.clone().multiplyScalar(0.32), roughness: 0.9, side: BackSide });
  const hidden = new MeshStandardMaterial({ visible: false });

  const container = new Group();

  // Walls sit inside the frame; their corrugation ribs stand proud of them but not of the frame
  const wallInset = 0.07;
  const rib = { depth: 0.045, width: 0.11, pitch: 0.28 };
  const ribHeight = H - 0.42;
  for (const sideX of [-1, 1]) {
    container.add(box(0.03, H - 0.3, L - 0.2, steel, sideX * (W / 2 - wallInset - 0.015), H / 2, 0));
    for (let z = -L / 2 + 0.3; z <= L / 2 - 0.3; z += rib.pitch) {
      container.add(box(rib.depth, ribHeight, rib.width, steel, sideX * (W / 2 - wallInset + rib.depth / 2), H / 2, z));
    }
  }
  // The closed end, ribbed across its width
  container.add(box(W - 0.2, H - 0.3, 0.03, steel, 0, H / 2, -L / 2 + wallInset + 0.015));
  for (let x = -W / 2 + 0.3; x <= W / 2 - 0.3; x += rib.pitch) {
    container.add(box(rib.width, ribHeight, rib.depth, steel, x, H / 2, -L / 2 + wallInset - rib.depth / 2));
  }
  container.add(box(W - 0.1, 0.04, L - 0.1, steel, 0, H - 0.05, 0));

  // The hold: an inside lining seen through the open end (its open-end face is left out). It
  // reaches into the door frame and sits flush on the sill, so no paper shows past its edges.
  const lining = new Mesh(new BoxGeometry(W - 0.26, H - 0.38, L - 0.2), [hold, hold, hold, hold, hidden, hold]);
  lining.position.set(0, 0.18 + (H - 0.38) / 2, 0);
  container.add(lining);

  // Frame: corner posts, side rails, the headers and sills at both ends, corner castings
  const post = 0.17;
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      container.add(box(post, H - 0.24, post, frame, x * (W / 2 - post / 2), H / 2, z * (L / 2 - post / 2)));
      for (const y of [0.06, H - 0.06]) {
        container.add(box(0.19, 0.12, 0.19, rodSteel, x * (W / 2 - 0.095), y, z * (L / 2 - 0.095)));
      }
    }
    container.add(box(0.12, 0.16, L - 0.38, frame, x * (W / 2 - 0.06), H - 0.08, 0));
    container.add(box(0.12, 0.22, L - 0.38, frame, x * (W / 2 - 0.06), 0.11, 0));
  }
  for (const z of [-1, 1]) {
    container.add(box(W - 0.38, 0.22, 0.12, frame, 0, H - 0.11, z * (L / 2 - 0.06)));
    container.add(box(W - 0.38, 0.18, 0.12, frame, 0, 0.09, z * (L / 2 - 0.06)));
  }

  // Doors: two leaves hinged on the corner posts at the open end, each with its locking rods
  const leafWidth = W / 2 - 0.045;
  const leafHeight = H - 0.38;
  const leafDepth = 0.05;
  const hingeZ = L / 2 + 0.05;
  const leaves: Group[] = [];
  for (const side of ['left', 'right'] as const) {
    const sign = side === 'left' ? -1 : 1;
    const pivot = new Group();
    pivot.position.set(sign * (W / 2 - 0.035), 0, hingeZ);
    const face = new MeshStandardMaterial({ map: paintLeaf(notFoundMark, cobaltDeep, stencil, side, 512, 1024), roughness: 0.6, metalness: 0.25 });
    // Box faces run +x, -x, +y, -y, +z, -z; the outer face is +z while the doors are shut
    const leaf = box(leafWidth, leafHeight, leafDepth, [frame, frame, frame, frame, face, frame], -sign * leafWidth / 2, H / 2 - 0.02, -leafDepth / 2);
    pivot.add(leaf);
    const rods = lockingRods(rodSteel, side, leafWidth, H - 0.2, 1);
    rods.position.y = H / 2;
    pivot.add(rods);
    container.add(pivot);
    leaves.push(pivot);
  }

  return { container, setDoors: (angle: number) => {
    leaves[0].rotation.y = -angle;
    leaves[1].rotation.y = angle;
  } };
}

/**
 * How far back the camera must stand so the box fits at every angle the visitor can turn it
 * to. `bounds` is the box unturned; its corners are turned exactly rather than re-boxed.
 */
function fitDistance(bounds: Box3, aspect: number): number {
  const vertical = Math.tan(MathUtils.degToRad(fov / 2));
  const horizontal = vertical * aspect;
  const direction = new Vector3(Math.sin(viewAzimuth) * Math.cos(viewElevation), Math.sin(viewElevation), Math.cos(viewAzimuth) * Math.cos(viewElevation));
  const right = new Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right).normalize();
  const margin = 0.94;
  const yAxis = new Vector3(0, 1, 0);
  let distance = 0;
  for (let step = -6; step <= 6; step++) {
    for (let i = 0; i < 8; i++) {
      const corner = new Vector3(i & 1 ? bounds.max.x : bounds.min.x, i & 2 ? bounds.max.y : bounds.min.y, i & 4 ? bounds.max.z : bounds.min.z);
      corner.applyAxisAngle(yAxis, (turnLimit * step) / 6);
      const along = corner.dot(direction);
      distance = Math.max(
        distance,
        along + Math.abs(corner.dot(right)) / (horizontal * margin),
        along + Math.abs(corner.dot(up)) / (vertical * margin)
      );
    }
  }
  return distance;
}

/**
 * Draws the container into `canvas` and swings its doors open once `slot` is in view. Throws
 * when the browser cannot draw WebGL, so the caller can leave the page as it is.
 */
export async function mountLostContainer(slot: HTMLElement, canvas: HTMLCanvasElement, onReady: () => void) {
  // The mark is painted in the stencil face, so wait for it before painting the doors
  await document.fonts.load('800 116px "Big Shoulders Stencil Variable"');

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  scene.add(new HemisphereLight(0xffffff, 0x2a3138, 1.9));
  const key = new DirectionalLight(0xffffff, 2.4);
  key.position.set(5, 9, 8);
  scene.add(key);
  const fill = new DirectionalLight(0xffffff, 0.7);
  fill.position.set(-7, 3, 3);
  scene.add(fill);

  const { container, setDoors } = buildContainer();
  const turn = new Group();
  turn.add(container);
  scene.add(turn);

  const camera = new PerspectiveCamera(fov, 1, 0.1, 100);
  // Under reduced motion the doors are open from the start and never swing
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let doors = reduced ? openAngle : 0;
  setDoors(doors);

  let frame = 0;
  const render = () => {
    frame = 0;
    renderer.render(scene, camera);
  };
  const requestRender = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  // The box with its doors open, the widest it gets, measured unturned and centred, so it
  // turns about its own middle and the camera can frame it tightly
  setDoors(openAngle);
  scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(container);
  const centre = bounds.getCenter(new Vector3());
  container.position.sub(centre);
  bounds.translate(centre.negate());
  setDoors(doors);

  const resize = () => {
    const { clientWidth: width, clientHeight: height } = canvas;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const distance = fitDistance(bounds, camera.aspect);
    camera.position.set(
      Math.sin(viewAzimuth) * Math.cos(viewElevation) * distance,
      Math.sin(viewElevation) * distance,
      Math.cos(viewAzimuth) * Math.cos(viewElevation) * distance
    );
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    requestRender();
  };

  // The swing: the bays' timing, stepped frame by frame, then the drawing stops
  const swing = () => {
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      doors = doorAngle(elapsed);
      setDoors(doors);
      renderer.render(scene, camera);
      if (elapsed < swingMs) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Dragging turns the box; on touch only a sideways drag does, so the page still scrolls
  let dragFrom: { x: number; angle: number } | null = null;
  canvas.addEventListener('pointerdown', (event) => {
    dragFrom = { x: event.clientX, angle: turn.rotation.y };
    canvas.setPointerCapture(event.pointerId);
    canvas.dataset.dragging = '';
  });
  canvas.addEventListener('pointermove', (event) => {
    if (!dragFrom) return;
    const turned = ((event.clientX - dragFrom.x) / canvas.clientWidth) * Math.PI;
    turn.rotation.y = MathUtils.clamp(dragFrom.angle + turned, -turnLimit, turnLimit);
    requestRender();
  });
  const release = () => {
    dragFrom = null;
    delete canvas.dataset.dragging;
  };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);

  onReady();
  resize();
  new ResizeObserver(resize).observe(canvas);

  if (!reduced) {
    // Open once most of the slot is in view (at once on a desktop, on a phone when scrolled to),
    // after a beat in which the shut doors show their mark
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setTimeout(swing, 600);
      },
      { threshold: 0.6 }
    );
    observer.observe(slot);
  }
}
