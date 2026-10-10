// The bays' door swing, cubic-bezier(0.16, 1, 0.3, 1) over 1100ms (ContainerBay.astro), as
// functions the 3D doors (a bay's, and the 404 page's container) step through frame by frame.
export const swingMs = 1100;

/** The 404 container's doors go past square, fanning back from the open end as real doors do */
export const openAngle = (110 * Math.PI) / 180;

/** A bay's doors stop where its CSS leaves do, rotateY(92deg), edge-on beside the route */
export const bayOpenAngle = (92 * Math.PI) / 180;

/** A CSS cubic-bezier() timing function: progress for a fraction of the time */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const bezier = (s: number, a: number, b: number) => 3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;
  return (t: number): number => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    // x rises steadily along the curve, so bisect for the point whose x is t and read its y
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (bezier(mid, x1, x2) < t) lo = mid;
      else hi = mid;
    }
    return bezier((lo + hi) / 2, y1, y2);
  };
}

/** The swing's timing function */
export const easeOut = cubicBezier(0.16, 1, 0.3, 1);

/** CSS `ease-out`, which the leaves fade on */
const cssEaseOut = cubicBezier(0, 0, 0.58, 1);

/** Each leaf's angle in radians, `elapsedMs` into the swing towards `to` */
export function doorAngle(elapsedMs: number, to = openAngle): number {
  return to * easeOut(elapsedMs / swingMs);
}

/** A bay's leaves, like their CSS: opaque, then fading out over 350ms from 700ms */
export function leafOpacity(elapsedMs: number): number {
  return 1 - cssEaseOut((elapsedMs - 700) / 350);
}
