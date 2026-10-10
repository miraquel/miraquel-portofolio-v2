// A bay's 3D doors: the two leaves of the container's door end, drawn with three.js over the
// route while the bay is shut, then swung open exactly as the CSS leaves swing (92deg over
// 1100ms under a 4000px perspective, fading from 700ms) and torn down. The route card under
// them stays the page's own HTML; the doors only ever cover it during the arrival.
import { AmbientLight, BoxGeometry, DirectionalLight, Group, Mesh, MeshLambertMaterial, MeshStandardMaterial, PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { markFromId } from './container-mark';
import { bayOpenAngle, doorAngle, leafOpacity, swingMs } from './door-swing';
import { cssColor, lockingRods, paintLeaf, type Side } from './door-leaf';

/** The CSS leaves' perspective, so the 3D swing projects the same way */
const perspective = 4000;
/** A real leaf is 1.174 m wide; the hardware is scaled from it */
const leafMetres = 1.174;

export interface BayDoors {
  /** Swings the doors open, then removes them; resolves once they are gone */
  open(): Promise<void>;
  /** Removes the doors at once */
  dispose(): void;
}

/**
 * Draws a bay's shut doors over its hold and resolves once they are on screen. `onLost` is
 * called if they have to go before opening (the hold changed size), so the CSS leaves can
 * take over. Throws when WebGL is unavailable.
 */
export async function mountBayDoors(bay: HTMLElement, hold: HTMLElement, onLost: () => void): Promise<BayDoors> {
  await document.fonts.load('800 100px "Big Shoulders Stencil Variable"');
  const mark = markFromId(bay.dataset.bay ?? '');
  const door = cssColor('--leaf', '#173c7a', bay);
  const stencil = cssColor('--color-stencil', '#f5f7f2');

  const width = hold.offsetWidth;
  const height = hold.offsetHeight;
  const leafWidth = width / 2;
  const unit = leafWidth / leafMetres;
  // A leaf swung edge-on reaches towards the viewer and projects past the hold, as the CSS
  // leaves do (into the column gap), so the canvas overhangs the hold by that much
  const reach = leafWidth + 0.12 * unit;
  const grow = reach / (perspective - reach);
  const marginX = Math.ceil((width / 2) * grow) + 4;
  const marginY = Math.ceil((height / 2) * grow) + 4;
  const canvasWidth = width + marginX * 2;
  const canvasHeight = height + marginY * 2;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'absolute',
    left: `${-marginX}px`,
    top: `${-marginY}px`,
    width: `${canvasWidth}px`,
    height: `${canvasHeight}px`,
    pointerEvents: 'none',
  });

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  const ratio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(ratio);
  renderer.setSize(canvasWidth, canvasHeight, false);
  renderer.setClearColor(0x000000, 0);

  // World units are CSS pixels, y up, the door plane at z = 0, the eye where CSS puts it
  const camera = new PerspectiveCamera((2 * Math.atan(canvasHeight / 2 / perspective) * 180) / Math.PI, canvasWidth / canvasHeight, 10, perspective * 2);
  camera.position.set(0, 0, perspective);
  camera.lookAt(0, 0, 0);

  // Lit so a leaf facing the viewer shows its paint exactly, as the CSS leaf does: three.js
  // divides diffuse light by pi, and ambient 1.4 plus the key's 2.1 at 35deg off the face sum
  // to pi. As the leaves turn, the key from the upper left shades them.
  const scene = new Scene();
  scene.add(new AmbientLight(0xffffff, 1.4));
  const key = new DirectionalLight(0xffffff, 2.1);
  key.position.set(-0.35, 0.45, 0.82);
  scene.add(key);

  // Matte paint (no sheen to grey it), so the face matches the CSS leaf; only the rods shine
  const frame = new MeshLambertMaterial({ color: door.clone().multiplyScalar(0.8), transparent: true });
  const rodSteel = new MeshStandardMaterial({ color: door.clone().multiplyScalar(0.5), roughness: 0.4, metalness: 0.5, transparent: true });
  const materials: (MeshLambertMaterial | MeshStandardMaterial)[] = [frame, rodSteel];
  const leafDepth = 0.05 * unit;
  const leaves: Group[] = [];
  for (const side of ['left', 'right'] as Side[]) {
    const sign = side === 'left' ? -1 : 1;
    const face = new MeshLambertMaterial({
      map: paintLeaf(mark, door, stencil, side, leafWidth * ratio, height * ratio, 2 * ratio),
      transparent: true,
    });
    materials.push(face);
    const pivot = new Group();
    pivot.position.x = sign * (width / 2);
    // Box faces run +x, -x, +y, -y, +z, -z; the outer face is +z while the doors are shut
    const leaf = new Mesh(new BoxGeometry(leafWidth, height, leafDepth), [frame, frame, frame, frame, face, frame]);
    leaf.position.set(-sign * (leafWidth / 2), 0, -leafDepth / 2);
    pivot.add(leaf, lockingRods(rodSteel, side, leafWidth, height - 0.1 * unit, unit));
    scene.add(pivot);
    leaves.push(pivot);
  }

  const draw = (elapsed: number) => {
    const angle = doorAngle(elapsed, bayOpenAngle);
    leaves[0].rotation.y = -angle;
    leaves[1].rotation.y = angle;
    const opacity = leafOpacity(elapsed);
    materials.forEach((material) => (material.opacity = opacity));
    renderer.render(scene, camera);
  };

  let gone = false;
  const resize = new ResizeObserver(() => {
    if (hold.offsetWidth === width && hold.offsetHeight === height) return;
    dispose();
    onLost();
  });
  const dispose = () => {
    if (gone) return;
    gone = true;
    resize.disconnect();
    scene.traverse((object) => {
      if (object instanceof Mesh) object.geometry.dispose();
    });
    materials.forEach((material) => {
      material.map?.dispose();
      material.dispose();
    });
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  };

  // Shut, on screen, before the caller hides the CSS leaves
  draw(0);
  hold.append(canvas);
  resize.observe(hold);

  return {
    dispose,
    open: () =>
      new Promise<void>((resolve) => {
        resize.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          if (gone) return resolve();
          const elapsed = now - start;
          draw(elapsed);
          if (elapsed < swingMs) requestAnimationFrame(step);
          else {
            dispose();
            resolve();
          }
        };
        requestAnimationFrame(step);
      }),
  };
}
