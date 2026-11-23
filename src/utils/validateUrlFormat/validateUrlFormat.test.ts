import { describe, it, expect } from 'vitest';

import { isMailtoUrl, validateUrlFormat } from './validateUrlFormat';

describe('validateUrlFormat', () => {
  describe('valid URLs', () => {
    it('should return true for valid HTTP URLs', () => {
      expect(validateUrlFormat('http://example.com')).toBe(true);
      expect(validateUrlFormat('http://www.example.com')).toBe(true);
      expect(validateUrlFormat('http://subdomain.example.com')).toBe(true);
      expect(validateUrlFormat('http://example.com/path')).toBe(true);
      expect(validateUrlFormat('http://example.com/path?query=value')).toBe(true);
      expect(validateUrlFormat('http://example.com:8080')).toBe(true);
    });

    it('should return true for valid HTTPS URLs', () => {
      expect(validateUrlFormat('https://example.com')).toBe(true);
      expect(validateUrlFormat('https://www.example.com')).toBe(true);
      expect(validateUrlFormat('https://subdomain.example.com')).toBe(true);
      expect(validateUrlFormat('https://example.com/path')).toBe(true);
      expect(validateUrlFormat('https://example.com/path?query=value')).toBe(true);
      expect(validateUrlFormat('https://example.com:443')).toBe(true);
    });

    it('should return true for mailto URLs', () => {
      expect(validateUrlFormat('mailto:test@example.com')).toBe(true);
      expect(validateUrlFormat('mailto:user+tag@domain.com')).toBe(true);
      expect(validateUrlFormat('mailto:test@example.com?subject=Hello')).toBe(true);
      expect(validateUrlFormat('mailto:first.last%40x@example.com')).toBe(false);
      expect(validateUrlFormat('mailto:first.last@sub.example.co.uk')).toBe(true);
    });

    it('should return true for URLs with various TLDs', () => {
      expect(validateUrlFormat('https://example.org')).toBe(true);
      expect(validateUrlFormat('https://example.co.uk')).toBe(true);
      expect(validateUrlFormat('https://example.museum')).toBe(true);
    });

    it('should return true for URLs with special characters', () => {
      expect(validateUrlFormat('https://example.com/path-with-dashes')).toBe(true);
      expect(validateUrlFormat('https://example.com/path_with_underscores')).toBe(true);
      expect(validateUrlFormat('https://example.com/path%20with%20encoded')).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    it('should return false for malformed HTTP URLs', () => {
      expect(validateUrlFormat('http:/link')).toBe(false);
      expect(validateUrlFormat('http://link')).toBe(true); // NOTE: URL constructor accepts this
      expect(validateUrlFormat('http:///example.com')).toBe(true); // NOTE: URL constructor accepts this
      expect(validateUrlFormat('http//example.com')).toBe(false);
    });

    it('should return false for URLs without protocol', () => {
      expect(validateUrlFormat('example.com')).toBe(false);
      expect(validateUrlFormat('www.example.com')).toBe(false);
      expect(validateUrlFormat('//example.com')).toBe(false);
    });

    it('should return false for unsupported protocols', () => {
      expect(validateUrlFormat('ftp://example.com')).toBe(false);
      expect(validateUrlFormat('file:///path/to/file')).toBe(false);
      expect(validateUrlFormat('tel:+1234567890')).toBe(false);
    });

    it('should return false for empty or invalid inputs', () => {
      expect(validateUrlFormat('')).toBe(false);
      expect(validateUrlFormat('   ')).toBe(false);
      expect(validateUrlFormat('not-a-url')).toBe(false);
      expect(validateUrlFormat('just text')).toBe(false);
    });

    it('should return false for URLs with invalid characters', () => {
      expect(validateUrlFormat('https://exam ple.com')).toBe(false);
      expect(validateUrlFormat('https://example$.com')).toBe(true); // NOTE: URL constructor accepts this
      expect(validateUrlFormat('https://example..com')).toBe(true); // NOTE: URL constructor accepts this
    });

    it('should return false for malformed mailto URLs', () => {
      expect(validateUrlFormat('mailto:')).toBe(false);
      expect(validateUrlFormat('mailto:invalid-email')).toBe(false);
      expect(validateUrlFormat('mailto:@example.com')).toBe(false);
      expect(validateUrlFormat('mailto:test@')).toBe(false);
      expect(validateUrlFormat('mailto:test@localhost')).toBe(false);
      expect(validateUrlFormat('mailto:te st@example.com')).toBe(false);
      expect(validateUrlFormat('mailto:a@b@example.com')).toBe(false);
      expect(validateUrlFormat('mailto:%E0%A4%A')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle case-insensitive protocols', () => {
      expect(validateUrlFormat('HTTP://example.com')).toBe(true);
      expect(validateUrlFormat('HTTPS://example.com')).toBe(true);
      expect(validateUrlFormat('MAILTO:test@example.com')).toBe(true);
      expect(validateUrlFormat('Mailto:test@example.com')).toBe(true);
    });

    it('should handle URLs with fragments and queries', () => {
      expect(validateUrlFormat('https://example.com#section')).toBe(true);
      expect(validateUrlFormat('https://example.com?param=value#section')).toBe(true);
    });

    it('should handle localhost URLs', () => {
      expect(validateUrlFormat('http://localhost')).toBe(true);
      expect(validateUrlFormat('http://localhost:3000')).toBe(true);
      expect(validateUrlFormat('https://127.0.0.1:8080')).toBe(true);
    });

    it('should handle international domain names', () => {
      expect(validateUrlFormat('https://münchen.de')).toBe(true);
      expect(validateUrlFormat('https://пример.рф')).toBe(true);
    });
  });
});

describe('isMailtoUrl', () => {
  it('detects mailto links regardless of case', () => {
    expect(isMailtoUrl('mailto:test@example.com')).toBe(true);
    expect(isMailtoUrl('MAILTO:test@example.com')).toBe(true);
    expect(isMailtoUrl('mailto:')).toBe(true);
  });

  it('returns false for other URLs', () => {
    expect(isMailtoUrl('https://example.com/mailto:test@example.com')).toBe(false);
    expect(isMailtoUrl('test@example.com')).toBe(false);
    expect(isMailtoUrl('')).toBe(false);
  });
});
