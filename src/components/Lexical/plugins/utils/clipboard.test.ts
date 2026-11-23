import { $getRoot, $getSelection, BaseSelection } from 'lexical';
import { describe, expect, it } from 'vitest';

import { createTestEditor, update } from '../../../../../test/utils/lexical';
import { $getHtml } from '../../html';
import type { Cleanup } from '../copyPasteEnhancement/types';

import { $insertDataTransferForRichText } from './clipboard';

const createDataTransfer = (data: Record<string, string>) =>
  ({ getData: (type: string) => data[type] ?? '' }) as unknown as DataTransfer;

const paste = (data: Record<string, string>) => {
  const editor = createTestEditor();
  let cleanups: Cleanup[] = [];

  update(editor, () => {
    $getRoot().selectEnd();
    const selection = $getSelection() as BaseSelection;
    cleanups = $insertDataTransferForRichText(createDataTransfer(data), selection, editor);
  });

  return { html: editor.read(() => $getHtml(editor)), text: editor.read(() => $getRoot().getTextContent()), cleanups };
};

describe('$insertDataTransferForRichText', () => {
  describe('plain text', () => {
    it('inserts special characters as typed', () => {
      const { text, cleanups } = paste({ 'text/plain': 'Tom & Jerry <3 > "x"' });

      expect(text).toBe('Tom & Jerry <3 > "x"');
      expect(cleanups).toEqual([]);
    });

    it('replaces non-breaking spaces and records the cleanup', () => {
      const { text, cleanups } = paste({ 'text/plain': 'a\u00A0b' });

      expect(text).toBe('a b');
      expect(cleanups).toEqual([{ original: 'a\u00A0b', cleaned: 'a b' }]);
    });

    it('creates a paragraph per line', () => {
      const { html } = paste({ 'text/plain': 'first\nsecond\r\nthird' });

      expect(html).toBe('<p>first</p><p>second</p><p>third</p>');
    });

    it('starts a new empty paragraph after a trailing newline (like typing Enter)', () => {
      const { html } = paste({ 'text/plain': 'first\n' });

      expect(html).toBe('<p>first</p><p></p>');
    });

    it('falls back to text/uri-list', () => {
      const { text } = paste({ 'text/uri-list': 'https://example.com' });

      expect(text).toBe('https://example.com');
    });
  });

  describe('HTML', () => {
    it('removes styles and classes and records the cleanup', () => {
      const { html, cleanups } = paste({
        'text/html': '<p class="MsoNormal" style="color:red">Hello&nbsp;World</p>',
        'text/plain': 'ignored',
      });

      expect(html).toBe('<p>Hello World</p>');
      expect(cleanups).toEqual([{ original: 'Hello\u00A0World', cleaned: 'Hello World' }]);
    });

    it('does not record a cleanup when nothing changed', () => {
      const { html, cleanups } = paste({ 'text/html': '<p>clean</p>' });

      expect(html).toBe('<p>clean</p>');
      expect(cleanups).toEqual([]);
    });

    it('keeps formatting and links', () => {
      const { html } = paste({
        'text/html': '<p><b>bold</b> <a href="https://example.com" target="_self">link</a></p>',
      });

      expect(html).toBe(
        '<p><strong>bold</strong> <a href="https://example.com" target="_self">link</a></p>'
      );
    });

    it('opens pasted links without a target in a new window', () => {
      const { html } = paste({ 'text/html': '<p><a href="https://example.com">link</a></p>' });

      expect(html).toContain('target="_blank"');
    });
  });

  describe('Lexical JSON', () => {
    it('ignores content from a different editor namespace and falls back to HTML', () => {
      const { html } = paste({
        'application/x-lexical-editor': JSON.stringify({ namespace: 'other', nodes: [] }),
        'text/html': '<p>from html</p>',
      });

      expect(html).toBe('<p>from html</p>');
    });

    it('falls back to HTML when the JSON is invalid', () => {
      const { html } = paste({
        'application/x-lexical-editor': '{not json',
        'text/html': '<p>from html</p>',
      });

      expect(html).toBe('<p>from html</p>');
    });
  });
});
