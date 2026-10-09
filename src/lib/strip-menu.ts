// A strip's phone menu is a <details>, so it opens and closes without script; this shuts it once a
// link is chosen, on Escape (focus returns to Menu), and on a tap anywhere else, as a menu is
// expected to. The site strip and the admin strip both use it.
export function wireStripMenus(): void {
  document.querySelectorAll<HTMLDetailsElement>('details[data-strip-menu]').forEach((menu) => {
    const summary = menu.querySelector('summary');
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => (menu.open = false)));
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !menu.open) return;
      menu.open = false;
      summary?.focus();
    });
    document.addEventListener('click', (event) => {
      if (menu.open && !menu.contains(event.target as Node)) menu.open = false;
    });
  });
}
