// Security-paper guilloche, generated as SVG path data. The figure is one curve drawn
// many times under a small rotation, which is how engraving lathes cut them.

/** A closed rosette curve: r(θ) = radius + a·sin(k·θ) + b·sin(m·θ), centred on the origin */
export function rosetteCurve(radius: number, a: number, k: number, b: number, m: number, steps = 720): string {
  const points: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const r = radius + a * Math.sin(k * theta) + b * Math.sin(m * theta);
    points.push(`${(r * Math.cos(theta)).toFixed(1)},${(r * Math.sin(theta)).toFixed(1)}`);
  }
  return `M${points.join('L')}Z`;
}
