// A colour from the site's CSS custom properties, for the three.js scenes, so they paint with
// the page's own tokens (and pick up the night print when read again)
import { Color } from 'three';

export function cssColor(name: string, fallback: string, from: Element = document.documentElement): Color {
  const value = getComputedStyle(from).getPropertyValue(name).trim();
  return new Color(value || fallback);
}
