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
