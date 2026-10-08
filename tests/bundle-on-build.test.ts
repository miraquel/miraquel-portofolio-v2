import assert from 'node:assert/strict';
import test from 'node:test';
import { bundleOnBuild } from '../integrations/bundle-on-build.mjs';

const packages = ['sanitize-html', 'htmlparser2'];

function configUpdates(command: string): unknown[] {
  const updates: unknown[] = [];
  const setup = bundleOnBuild(packages).hooks['astro:config:setup'] as (options: unknown) => void;
  setup({ command, updateConfig: (config: unknown) => updates.push(config) });
  return updates;
}

test('astro build bundles the packages into the server output', () => {
  assert.deepEqual(configUpdates('build'), [{ vite: { ssr: { noExternal: packages } } }]);
});

test('the dev server leaves the packages to Node, which can load CommonJS', () => {
  for (const command of ['dev', 'preview', 'sync']) {
    assert.deepEqual(configUpdates(command), [], command);
  }
});
