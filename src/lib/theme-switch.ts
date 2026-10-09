// Wires every Dark switch on the page (the site strip and the admin strip each render their own).
// The page follows the device's setting until a visitor flips a switch, and flipping back to the
// device's own look forgets the choice. Layout.astro applies a stored choice before the first
// paint; global.css holds the night print itself.
import { choiceAfterSwitch, isTheme, themeKey, type Theme } from './theme';

export function wireThemeSwitches(): void {
  const root = document.documentElement;
  const darkDevice = matchMedia('(prefers-color-scheme: dark)');
  const device = (): Theme => (darkDevice.matches ? 'dark' : 'light');
  const shown = (): Theme => {
    const chosen = root.dataset.theme;
    return isTheme(chosen) ? chosen : device();
  };
  const switches = document.querySelectorAll<HTMLButtonElement>('[data-theme-switch]');
  const sync = () => switches.forEach((button) => button.setAttribute('aria-pressed', String(shown() === 'dark')));
  const show = (choice: Theme | null) => {
    root.classList.add('is-reprinting');
    if (choice) root.dataset.theme = choice;
    else delete root.dataset.theme;
    sync();
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('is-reprinting')));
  };

  switches.forEach((button) =>
    button.addEventListener('click', () => {
      const choice = choiceAfterSwitch(shown(), device());
      // Private windows can refuse storage; the choice then lasts for this page only
      try {
        if (choice) localStorage.setItem(themeKey, choice);
        else localStorage.removeItem(themeKey);
      } catch {}
      show(choice);
    })
  );
  darkDevice.addEventListener('change', sync);
  // A choice made in another tab
  addEventListener('storage', (event) => {
    if (event.key === themeKey) show(isTheme(event.newValue) ? event.newValue : null);
  });
  sync();
  // The switches need this script, so they stay hidden until it runs
  document.querySelectorAll<HTMLElement>('[data-theme-switch-item]').forEach((item) => (item.hidden = false));
}
