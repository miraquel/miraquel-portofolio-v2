// The post editor's shared parts (PostForm.astro; the new and edit pages): the CKEditor setup, the
// form's fields read as one post, and the status stamp that previews them.
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  Heading,
  Image,
  ImageUpload,
  Indent,
  Italic,
  Link,
  List,
  MediaEmbed,
  Paragraph,
  Strikethrough,
  Table,
  Underline,
  Undo,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { formatDay } from './format';

const field = <T extends HTMLElement = HTMLInputElement>(id: string) => document.getElementById(id) as T;

/** Starts CKEditor on #editor, keeping #content in step with it. Its text wears the post body's styles. */
export async function startEditor(initialData = ''): Promise<ClassicEditor> {
  const content = field('content');
  const editor = await ClassicEditor.create({
    attachTo: field<HTMLElement>('editor'),
    licenseKey: 'GPL',
    label: 'Content',
    plugins: [Essentials, Bold, Italic, Underline, Strikethrough, Code, Paragraph, Heading, Link, List, BlockQuote, CodeBlock, Image, ImageUpload, MediaEmbed, Table, Indent, Undo],
    toolbar: {
      items: [
        'undo', 'redo', '|',
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', 'code', '|',
        'link', 'blockQuote', 'codeBlock', '|',
        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'insertTable', 'mediaEmbed',
      ],
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
      ],
    },
    root: { initialData },
  });
  // The editing view owns the editable's class attribute and rewrites it on every focus change, so a
  // class set on the element directly is gone once the writer clicks in. The view's writer keeps it.
  const root = editor.editing.view.document.getRoot();
  if (root) editor.editing.view.change((writer) => writer.addClass('post-body', root));
  content.value = editor.getData();
  editor.model.document.on('change:data', () => (content.value = editor.getData()));
  return editor;
}

export interface PostFields {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: Date;
  tags: string[];
  status: string;
  statusId: string | null;
  imageUrl: string;
  readingTime: number | null;
}

/** The form's fields, read as one post */
export function readPostFields(): PostFields {
  const status = field<HTMLSelectElement>('status');
  const readingTime = field('readingTime').value;
  return {
    title: field('title').value,
    slug: field('slug').value,
    excerpt: field<HTMLTextAreaElement>('excerpt').value,
    content: field('content').value,
    author: field('author').value,
    publishedAt: new Date(field('publishedAt').value),
    tags: field('tags')
      .value.split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
    status: status.value,
    statusId: status.selectedOptions[0]?.getAttribute('data-status-id') ?? null,
    imageUrl: field('imageUrl').value,
    readingTime: readingTime ? parseInt(readingTime) : null,
  };
}

/** A Date as a datetime-local input's value, in the visitor's time */
export function toLocalInput(date: Date): string {
  const local = new Date(date);
  local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
  return local.toISOString().slice(0, 16);
}

/** The stamp over the publishing fields follows the chosen status and date, as the blog will print the date */
export function wireStatusStamp(): void {
  const status = field<HTMLSelectElement>('status');
  const publishedAt = field('publishedAt');
  const [word, date] = document.querySelectorAll<HTMLElement>('#statusStamp .stamp > span');
  if (!word || !date) return;
  const update = () => {
    word.textContent = status.selectedOptions[0]?.textContent?.trim() ?? status.value;
    const when = new Date(publishedAt.value);
    date.textContent = Number.isNaN(when.getTime()) ? 'No date' : formatDay(when);
  };
  status.addEventListener('change', update);
  publishedAt.addEventListener('input', update);
  update();
}
