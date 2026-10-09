// The admin workspace's controls, in the site's conventions (DESIGN.md): square, framed 2px in form
// green, Overpass at fixed sizes, data in carbon. Pages and the scripts that build rows share these
// strings, so a control looks the same on every screen.

const button =
  'inline-flex min-h-11 cursor-pointer items-center justify-center border-2 border-form px-5 text-sm font-semibold transition-colors duration-150 disabled:cursor-wait disabled:opacity-60';

/** The one main action on a screen: form ground, darkening to carbon */
export const primaryButton = `${button} bg-form text-paper hover:border-ink hover:bg-ink`;

/** Every other button: paper ground, form ink */
export const secondaryButton = `${button} bg-paper text-form hover:bg-paper-deep`;

/** A text action in a row or under a form: underlined, 44px tall */
export const textAction =
  'inline-flex min-h-11 cursor-pointer items-center text-sm font-semibold underline decoration-form/40 decoration-2 underline-offset-4 transition-colors duration-150 hover:decoration-form disabled:cursor-wait disabled:opacity-60';

/** A field label, as on the form: small semibold form green */
export const fieldLabel = 'block text-[0.8125rem] font-semibold leading-tight text-form';

/** A line of help under a field */
export const fieldHint = 'mt-1.5 block text-[0.8125rem] leading-snug text-form';

/** A text input, select or text area: paper ground, 2px form frame, carbon data */
export const fieldInput =
  'mt-2 block min-h-11 w-full border-2 border-form bg-paper px-3 py-2 text-base font-normal text-ink placeholder:text-form';

/** A problem the visitor has to act on: framed in carbon on the deeper paper */
export const notice = 'border-2 border-ink bg-paper-deep px-4 py-3 text-[0.9375rem] font-semibold leading-snug';

/** Waiting for data: a quiet line that says what is loading */
export const pending = 'text-[0.9375rem] text-form';

/** A filter chip, as the blog's tag filters: 44px, framed, inverted while selected */
export function filterChip(selected: boolean): string {
  return `inline-flex min-h-11 items-center gap-2 border-2 border-form px-3 text-sm font-semibold transition-colors duration-150 ${
    selected ? 'bg-form text-paper' : 'bg-paper text-form hover:bg-paper-deep'
  }`;
}

/** A table, as the site's All projects: form frame, form-green header row, hairline rows */
export const table = 'admin-table w-full border-2 border-form text-left';
export const tableHead = 'bg-form text-paper';
export const tableRow = 'border-t border-form/35 transition-colors duration-150 hover:bg-paper-deep';
