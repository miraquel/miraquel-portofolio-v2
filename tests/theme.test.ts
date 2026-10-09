import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { choiceAfterSwitch, isTheme, themeKey } from '../src/lib/theme';

test('flipping away from the device look remembers the choice', () => {
  assert.equal(choiceAfterSwitch('light', 'light'), 'dark');
  assert.equal(choiceAfterSwitch('dark', 'dark'), 'light');
});

test('flipping back to the device look forgets the choice, so the page follows the device again', () => {
  assert.equal(choiceAfterSwitch('dark', 'light'), null);
  assert.equal(choiceAfterSwitch('light', 'dark'), null);
});

test('only light and dark count as a stored choice', () => {
  assert.ok(isTheme('light'));
  assert.ok(isTheme('dark'));
  for (const value of [null, undefined, '', 'auto', 'Dark']) assert.equal(isTheme(value), false);
});

test('the head script reads the key the switch writes', () => {
  const layout = readFileSync(new URL('../src/layouts/Layout.astro', import.meta.url), 'utf8');
  assert.ok(layout.includes(`localStorage.getItem('${themeKey}')`));
});
