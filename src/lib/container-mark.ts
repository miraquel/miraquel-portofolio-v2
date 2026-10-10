// ISO 6346 container marks: a 3-letter owner code, an equipment category letter,
// a 6-digit serial number and a computed check digit, e.g. "CSQU 305438 3".

// Letter values skip multiples of 11 (11, 22, 33), as the standard prescribes
const LETTER_VALUES: Record<string, number> = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19, J: 20, K: 21, L: 23, M: 24,
  N: 25, O: 26, P: 27, Q: 28, R: 29, S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
};

export function checkDigit(ownerAndCategory: string, serial: string): number {
  const code = `${ownerAndCategory}${serial}`.toUpperCase();
  if (!/^[A-Z]{4}\d{6}$/.test(code)) {
    throw new Error(`Not an ISO 6346 owner code + serial: ${code}`);
  }

  const sum = [...code].reduce((total, char, position) => {
    const value = /\d/.test(char) ? Number(char) : LETTER_VALUES[char];
    return total + value * 2 ** position;
  }, 0);

  return (sum % 11) % 10;
}

export interface ContainerMark {
  owner: string;
  serial: string;
  check: number;
  /** Compact form for ids and data attributes, e.g. "CAAU2022041" */
  id: string;
}

function mark(owner: string, serial: string): ContainerMark {
  const check = checkDigit(owner, serial);
  return { owner, serial, check, id: `${owner}${serial}${check}` };
}

// Owner code CAA (Chaidir Ali Assegaf) in category U (freight container); the serial is
// the project's start month, so the mark doubles as a date stamp.
export function containerMark(startMonth: string): ContainerMark {
  return mark('CAAU', startMonth.replace('-', ''));
}

// The empty container on the 404 page carries no project, so its serial is the status code
export const notFoundMark = mark('CAAU', '000404');

/** A mark read back from its compact id (a bay's data-bay), refused unless its check digit holds */
export function markFromId(id: string): ContainerMark {
  const parsed = mark(id.slice(0, 4), id.slice(4, 10));
  if (parsed.id !== id) throw new Error(`Not a valid container mark: ${id}`);
  return parsed;
}
