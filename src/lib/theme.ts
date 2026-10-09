// The page follows the device's light or dark setting until a visitor uses the strip's Dark
// switch. Their choice is kept in localStorage under this key, and the head script in
// Layout.astro applies it as html[data-theme] before the first paint.
export const themeKey = 'theme';

export type Theme = 'light' | 'dark';

export function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * What to remember after the switch flips the page from `shown` to the other look. Nothing,
 * when the new look is the device's own: the page then follows the device again.
 */
export function choiceAfterSwitch(shown: Theme, device: Theme): Theme | null {
  const next: Theme = shown === 'dark' ? 'light' : 'dark';
  return next === device ? null : next;
}
