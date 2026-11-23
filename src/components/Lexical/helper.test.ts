import { describe, expect, it } from 'vitest';

import { cleanup, cleanupText, mapToObj } from './helper';

describe('cleanup', () => {
  it('replaces non-breaking spaces with regular spaces', () => {
    expect(cleanup('<p>a&nbsp;b\u00A0c</p>')).toBe('<p>a b c</p>');
  });

  it('removes style, class, id and align attributes', () => {
    const html = '<p style="color:red" class="MsoNormal" id="x" align="center">text</p>';
    expect(cleanup(html)).toBe('<p>text</p>');
  });

  it('removes empty paragraphs but keeps paragraphs with content', () => {
    expect(cleanup('<p></p><p>keep</p><p></p>')).toBe('<p>keep</p>');
  });

  it('removes Word <o:p> elements', () => {
    expect(cleanup('<p>text<o:p></o:p></p>')).toBe('<p>text</p>');
  });

  it('opens links without a target in a new window', () => {
    expect(cleanup('<a href="https://example.com">x</a>')).toBe(
      '<a href="https://example.com" target="_blank">x</a>'
    );
  });

  it('keeps an existing link target', () => {
    expect(cleanup('<a href="https://example.com" target="_self">x</a>')).toBe(
      '<a href="https://example.com" target="_self">x</a>'
    );
  });

  it('returns HTML-escaped text for plain text input', () => {
    expect(cleanup('Tom & Jerry')).toBe('Tom &amp; Jerry');
  });
});

describe('cleanupText', () => {
  it('replaces non-breaking spaces', () => {
    expect(cleanupText('a\u00A0b')).toBe('a b');
  });

  it('keeps HTML special characters unchanged', () => {
    expect(cleanupText('Tom & Jerry <3 &nbsp;')).toBe('Tom & Jerry <3 &nbsp;');
  });
});

describe('mapToObj', () => {
  it('converts a Map into a plain object', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(mapToObj(map as any)).toEqual({ a: 1, b: 2 });
  });
});
