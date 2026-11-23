import { describe, expect, it } from 'vitest';

import { sanitizeUrl, validateUrl } from './url';

describe('sanitizeUrl', () => {
  it('keeps safe URLs and trims whitespace', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('/relative/path')).toBe('/relative/path');
    expect(sanitizeUrl('#anchor')).toBe('#anchor');
  });

  it('removes dangerous URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
    expect(sanitizeUrl('  javascript:alert(1)')).toBe('');
    expect(sanitizeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe('');
    expect(sanitizeUrl('vbscript:msgbox')).toBe('');
  });

  it('allows base64 image data URLs', () => {
    expect(sanitizeUrl('data:image/png;base64,iVBORw0KGgo=')).toBe(
      'data:image/png;base64,iVBORw0KGgo='
    );
  });

  it('gives the same result when called repeatedly', () => {
    for (let i = 0; i < 3; i++) {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    }
  });
});

describe('validateUrl', () => {
  it('accepts an empty string', () => {
    expect(validateUrl('')).toBe(true);
  });

  it('accepts URLs and email addresses', () => {
    expect(validateUrl('https://example.com/path?x=1')).toBe(true);
    expect(validateUrl('www.example.com')).toBe(true);
    expect(validateUrl('test@example.com')).toBe(true);
  });

  it('rejects plain words', () => {
    expect(validateUrl('hello')).toBe(false);
  });
});
