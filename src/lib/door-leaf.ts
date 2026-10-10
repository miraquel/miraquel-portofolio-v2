// A container door leaf for the 3D doors (the 404 page's container, and a bay's arrival): its
// painted steel with the corrugation and its half of the mark, and its locking rods.
import { BoxGeometry, CanvasTexture, Color, CylinderGeometry, Group, Mesh, SRGBColorSpace, type Material } from 'three';
import type { ContainerMark } from './container-mark';

export type Side = 'left' | 'right';

/** Where the locking rods stand, as fractions of a leaf's width in from its meeting edge */
const rodsFromMeeting = [0.1, 0.87];

/** A colour from a CSS custom property, read where it is set: the page, or a bay for its --leaf */
export function cssColor(name: string, fallback: string, from: Element = document.documentElement): Color {
  const value = getComputedStyle(from).getPropertyValue(name).trim();
  return new Color(value || fallback);
}

/**
 * A leaf's outer face, `width` by `height` canvas pixels: door steel with its corrugation, an
 * optional dark edge, and its half of the stencilled mark. The owner code reads on the left
 * leaf, the serial and boxed check digit on the right, so the mark runs across the doors.
 */
export function paintLeaf(mark: ContainerMark, door: Color, stencil: Color, side: Side, width: number, height: number, edge = 0): CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width);
  canvas.height = Math.round(height);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = `#${door.getHexString()}`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // The corrugation, as the bays' CSS leaves print it: 14 plain, a 4 dark rib, a 4 light edge
  const pitch = canvas.width / 17;
  for (let x = 0; x < canvas.width; x += pitch) {
    ctx.fillStyle = 'rgb(0 0 0 / 0.16)';
    ctx.fillRect(x + (pitch * 14) / 22, 0, (pitch * 4) / 22, canvas.height);
    ctx.fillStyle = 'rgb(255 255 255 / 0.06)';
    ctx.fillRect(x + (pitch * 18) / 22, 0, (pitch * 4) / 22, canvas.height);
  }
  if (edge) {
    ctx.strokeStyle = 'rgb(0 0 0 / 0.35)';
    ctx.lineWidth = edge * 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = `#${stencil.getHexString()}`;
  ctx.strokeStyle = ctx.fillStyle;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const serial = mark.serial;
  const check = String(mark.check);
  // One size on both leaves: the largest at which the serial and its box fit between the
  // right leaf's locking rods, so no rod crosses the mark
  const font = (size: number) => `800 ${size}px "Big Shoulders Stencil Variable", "Arial Narrow", sans-serif`;
  ctx.font = font(100);
  // The serial and digit, plus the gap (0.24) and the box's padding (0.12 each side), per pixel of size
  const perPixel = (ctx.measureText(serial).width + ctx.measureText(check).width) / 100 + 0.48;
  const size = Math.min(canvas.width / 3, (canvas.width * 0.68) / perPixel);
  ctx.font = font(size);
  const baseline = canvas.width * 0.23 + size;
  if (side === 'left') {
    ctx.textAlign = 'center';
    ctx.fillText(mark.owner, canvas.width / 2, baseline);
  } else {
    const gap = size * 0.24;
    const pad = size * 0.12;
    const serialWidth = ctx.measureText(serial).width;
    const checkWidth = ctx.measureText(check).width;
    const left = (canvas.width - (serialWidth + gap + checkWidth + pad * 2)) / 2;
    ctx.fillText(serial, left, baseline);
    ctx.fillText(check, left + serialWidth + gap + pad, baseline);
    ctx.lineWidth = size * 0.07;
    ctx.strokeRect(left + serialWidth + gap, baseline - size * 0.86, checkWidth + pad * 2, size * 0.98);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * A leaf's two locking rods, each with its bracket and hanging handle, centred on y = 0 and
 * standing in front of the leaf's face (z = 0). The leaf hangs from x = 0 and reaches
 * `width` towards its meeting edge, on the -x side for a left leaf. `unit` is world units per
 * metre, so the hardware keeps a real door's proportions on a leaf of any size.
 */
export function lockingRods(material: Material, side: Side, width: number, length: number, unit: number): Group {
  const sign = side === 'left' ? -1 : 1;
  const rods = new Group();
  const part = (w: number, h: number, d: number, x: number, y: number, z: number) => {
    const mesh = new Mesh(new BoxGeometry(w * unit, h * unit, d * unit), material);
    mesh.position.set(x, y * unit, z * unit);
    rods.add(mesh);
  };
  for (const fromMeeting of rodsFromMeeting) {
    const x = -sign * width * (1 - fromMeeting);
    const rod = new Mesh(new CylinderGeometry(0.022 * unit, 0.022 * unit, length, 12), material);
    rod.position.set(x, 0, 0.03 * unit);
    rods.add(rod);
    part(0.035, 0.035, 0.05, x, -0.145, 0.05);
    part(0.035, 0.32, 0.035, x + sign * 0.03 * unit, -0.295, 0.075);
  }
  return rods;
}
