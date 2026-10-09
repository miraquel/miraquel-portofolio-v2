import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test("the editor's post styles survive the writer clicking in", async () => {
  // CKEditor's editing view rewrites the editable's class attribute on every focus change, so the
  // post body class has to go through the view's writer; set on the element, it was lost on the
  // first click and code blocks fell back to CKEditor's grey, unreadable at night.
  const editor = await readFile(new URL('../src/lib/post-editor.ts', import.meta.url), 'utf8');
  assert.match(editor, /writer\.addClass\('post-body', root\)/);
  assert.doesNotMatch(editor, /classList\.add\('post-body'\)/);
});
