// The bays' door swing, cubic-bezier(0.16, 1, 0.3, 1) over 1100ms (ContainerBay.astro), as
// functions the 3D doors on the 404 page can step through frame by frame.
export const swingMs = 1100;

/** Past square, so the leaves fan back from the open end the way real container doors do */
export const openAngle = (110 * Math.PI) / 180;

const [x1, y1, x2, y2] = [0.16, 1, 0.3, 1];
const bezier = (s: number, a: number, b: number) => 3 * (1 - s) ** 2 * s * a + 3 * (1 - s) * s ** 2 * b + s ** 3;

/** The timing function: progress through the swing for a fraction of its time */
export function easeOut(t: number): number {
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
}

/** Each leaf's angle in radians, `elapsedMs` into the swing */
export function doorAngle(elapsedMs: number): number {
  return openAngle * easeOut(elapsedMs / swingMs);
}
