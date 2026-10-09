// The strip's shared vocabulary: the site strip (Strip.astro) and the admin strip (AdminLayout.astro)
// draw their links, chips and phone-menu rows from the same strings.

/** A strip link: 44px tall, form green, turning carbon and underlined on hover */
export const stripLink =
  'inline-block px-2 py-[15px] text-sm font-semibold leading-none text-form underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline md:px-2.5';

/** A framed chip that fills with the ink when on: an open menu, a pressed Dark switch */
export const stripChip =
  'border-2 border-form px-2 py-[5px] text-sm font-semibold leading-none text-form transition-colors duration-150';

/** A row of a strip's phone menu: at least 48px tall, reaching the panel's edges */
export const menuRow =
  '-mx-4 flex min-h-12 items-baseline gap-3 px-4 py-3.5 text-[1.125rem] font-extrabold leading-tight text-ink transition-colors duration-150 hover:bg-paper-deep focus-visible:outline-offset-[-3px] sm:-mx-8 sm:px-8';
