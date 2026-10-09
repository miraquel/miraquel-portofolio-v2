import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');

// The declarations of the first rule whose selector is exactly `selector`
function declarations(selector: string): Map<string, string> {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `global.css has a rule for ${selector}`);
  const body = css.slice(start + selector.length + 2, css.indexOf('}', start));
  return new Map(
    body
      .split(';')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const colon = line.indexOf(':');
        return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()] as [string, string];
      })
  );
}

const followsDevice = declarations("html[data-world='lading']:not([data-theme='light'])");
const switchedOn = declarations("html[data-world='lading'][data-theme='dark']");

test('a dark device and the Dark switch print the same night', () => {
  assert.deepEqual([...followsDevice.entries()].sort(), [...switchedOn.entries()].sort());
});

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

test('night text keeps at least 4.5:1 on both papers, and paper text on a form-green band', () => {
  const night = (name: string) => {
    const value = followsDevice.get(`--color-${name}`);
    assert.match(value ?? '', /^#[0-9a-f]{6}$/i, `--color-${name} is a hex colour`);
    return value as string;
  };
  for (const paper of ['paper', 'paper-deep']) {
    for (const ink of ['ink', 'form']) {
      const ratio = contrast(night(ink), night(paper));
      assert.ok(ratio >= 4.5, `${ink} on ${paper}: ${ratio.toFixed(2)}:1`);
    }
  }
  const stamp = contrast(night('stamp'), night('paper'));
  assert.ok(stamp >= 4.5, `stamp on paper: ${stamp.toFixed(2)}:1`);
  const band = contrast(night('paper'), night('form'));
  assert.ok(band >= 4.5, `paper on form: ${band.toFixed(2)}:1`);
});
