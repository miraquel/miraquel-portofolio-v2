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

/** The YYYY-MM month of a moment, in UTC */
export function monthOf(date: Date): string {
  return date.toISOString().slice(0, 7);
}

export interface StackInput {
  number: number;
  platform: string;
  /** No end while the project is in progress */
  period: { start: string; end?: string };
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
  /** Set while the project is in progress: it runs to the month of the build */
  ongoing?: true;
}

/**
 * Every project placed as the crane loads them: in date order (start, then longer first, then
 * line number), each one level above the highest container already in its lane whose months
 * overlap its own, or on the quay. A project in progress runs to `now`, the month of the build.
 * Returned in that loading order.
 */
export function stackLayout(lines: readonly StackInput[], now = monthOf(new Date())): StackBox[] {
  const spans = lines.map((line) => {
    const start = monthIndex(line.period.start);
    const ongoing = !line.period.end;
    const end = line.period.end ? monthIndex(line.period.end) : Math.max(monthIndex(now), start);
    if (end < start) throw new Error(`Manifest line ${line.number} ends before it starts`);
    return { line, start, length: Math.max(1, end - start), ongoing };
  });
  spans.sort((a, b) => a.start - b.start || b.length - a.length || a.line.number - b.line.number);

  const placed: StackBox[] = [];
  for (const { line, start, length, ongoing } of spans) {
    const lane = laneOf(line.platform);
    const beneath = placed.filter((box) => box.lane === lane && box.start < start + length && start < box.start + box.length);
    const level = beneath.length ? Math.max(...beneath.map((box) => box.level)) + 1 : 0;
    placed.push({ number: line.number, lane, start, length, level, ...(ongoing && { ongoing: true as const }) });
  }
  return placed;
}

/** The quay's ends in months, widened to whole years around the projects */
export function quayRange(boxes: readonly StackBox[]): { start: number; end: number } {
  const start = Math.min(...boxes.map((box) => box.start));
  const end = Math.max(...boxes.map((box) => box.start + box.length));
  return { start: Math.floor(start / 12) * 12, end: Math.ceil(end / 12) * 12 };
}

/**
 * How many containers high a phone's view must stand to frame what's around `centre`: a stack
 * within `reach` months counts in full, and one up to `fade` months further out counts less
 * the further away it is, so the camera pulls back smoothly before a tall stack comes into
 * view. Never less than one container.
 */
export function heightNear(boxes: readonly StackBox[], centre: number, reach: number, fade: number): number {
  let height = 1;
  for (const box of boxes) {
    const away = Math.max(0, box.start - centre, centre - (box.start + box.length));
    const t = Math.min(1, Math.max(0, (away - reach) / fade));
    const weight = 1 - t * t * (3 - 2 * t);
    height = Math.max(height, 1 + weight * box.level);
  }
  return height;
}

/**
 * How far the manifest has scrolled past a reading line, as a row count: -1 until the table's
 * `top` reaches the line, then `i` when row i's top is on it and `i + t` on the way to the
 * next, never past the last row. Positions are in any one coordinate space, rows in order.
 */
export function listProgress(top: number, rows: readonly number[], line: number): number {
  if (line < rows[0]) return line <= top ? -1 : -1 + (line - top) / (rows[0] - top);
  for (let i = 0; i < rows.length - 1; i++) {
    if (line < rows[i + 1]) return i + (line - rows[i]) / (rows[i + 1] - rows[i]);
  }
  return rows.length - 1;
}

/** The month a following camera centres on at list progress `progress`: the middle of that
 *  row's container, gliding to the next row's */
export function followMonth(boxes: readonly StackBox[], progress: number): number {
  const middles = [...boxes].sort((a, b) => a.number - b.number).map((box) => box.start + box.length / 2);
  const at = Math.min(Math.max(progress, 0), middles.length - 1);
  const row = Math.floor(at);
  const next = middles[Math.min(row + 1, middles.length - 1)];
  return middles[row] + (next - middles[row]) * (at - row);
}

/**
 * The stack's proportions in world units (one month along the quay): a container's square
 * section, the pitch between lanes, the quay's margin around them, and how far a hovered
 * container slides toward the viewer
 */
export const geometry = { boxHeight: 2.6, boxDepth: 2.6, lanePitch: 3.8, quayMargin: 0.8, pullDepth: 0.5 } as const;

/** Where a hovered container moves: toward the viewer (+z), never up into the containers it carries */
export function hoverOffset(amount: number): [number, number, number] {
  return [0, 0, amount];
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
