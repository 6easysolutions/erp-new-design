import { describe, it, expect } from 'vitest';
import { getTotalFromArray, sanitizeStringWithUnderscores } from './index';

describe('getTotalFromArray', () => {
  it('should return 6 for [1, 2, 3]', () => {
    expect(getTotalFromArray([1, 2, 3])).toBe(6);
  });

  it('should return 0 for an empty array', () => {
    expect(getTotalFromArray([])).toBe(0);
  });

  it('should return 0 when not an array', () => {
    expect(getTotalFromArray(null)).toBe(0);
    expect(getTotalFromArray(undefined)).toBe(0);
    expect(getTotalFromArray('string')).toBe(0);
    expect(getTotalFromArray({ key: 'value' })).toBe(0);
  });

  it('should return 3 for array with string numbers ["1", "2"]', () => {
    expect(getTotalFromArray(['1', '2'])).toBe(3);
  });

  it('should handle invalid numbers and return 3 for ["abc", 1, undefined, null, {}, [], 2]', () => {
    expect(getTotalFromArray(['abc', 1, undefined, null, {}, [], 2])).toBe(3);
  });
});

describe('sanitizeStringWithUnderscores', () => {
  describe('non-string inputs', () => {
    it('should return empty string when input is null or undefined', () => {
      expect(sanitizeStringWithUnderscores(null)).toBe('');
      expect(sanitizeStringWithUnderscores(undefined)).toBe('');
    });

    it('should return empty string when input is a number or boolean', () => {
      expect(sanitizeStringWithUnderscores(123)).toBe('');
      expect(sanitizeStringWithUnderscores(0)).toBe('');
      expect(sanitizeStringWithUnderscores(true)).toBe('');
      expect(sanitizeStringWithUnderscores(false)).toBe('');
    });

    it('should return empty string when input is an object, array, or function', () => {
      expect(sanitizeStringWithUnderscores({})).toBe('');
      expect(sanitizeStringWithUnderscores([])).toBe('');
      expect(sanitizeStringWithUnderscores(() => {})).toBe('');
    });
  });

  describe('empty and whitespace-only strings', () => {
    it('should return empty string for an empty string', () => {
      expect(sanitizeStringWithUnderscores('')).toBe('');
    });

    it('should return empty string for strings containing only spaces', () => {
      expect(sanitizeStringWithUnderscores(' ')).toBe('');
      expect(sanitizeStringWithUnderscores('     ')).toBe('');
    });

    it('should return empty string for strings containing tabs, newlines, and mixed whitespace', () => {
      expect(sanitizeStringWithUnderscores('\t\n\r  ')).toBe('');
    });
  });

  describe('single-word strings', () => {
    it('should return single word as-is without spaces', () => {
      expect(sanitizeStringWithUnderscores('hello')).toBe('hello');
      expect(sanitizeStringWithUnderscores('Product')).toBe('Product');
      expect(sanitizeStringWithUnderscores('already_underscored')).toBe('already_underscored');
    });

    it('should trim leading and trailing spaces on single words', () => {
      expect(sanitizeStringWithUnderscores('  hello  ')).toBe('hello');
      expect(sanitizeStringWithUnderscores('\tworld\n')).toBe('world');
    });
  });

  describe('multi-word strings', () => {
    it('should replace single spaces between words with underscores', () => {
      expect(sanitizeStringWithUnderscores('hello world')).toBe('hello_world');
      expect(sanitizeStringWithUnderscores('Add New Product')).toBe('Add_New_Product');
    });

    it('should collapse multiple consecutive spaces into a single underscore', () => {
      expect(sanitizeStringWithUnderscores('hello    world')).toBe('hello_world');
      expect(sanitizeStringWithUnderscores('multiple   spaced    words   here')).toBe('multiple_spaced_words_here');
    });

    it('should trim leading/trailing whitespace and replace inner spaces with underscores', () => {
      expect(sanitizeStringWithUnderscores('   leading and trailing   ')).toBe('leading_and_trailing');
      expect(sanitizeStringWithUnderscores('\n hello \t world \r\n')).toBe('hello_world');
    });

    it('should preserve special characters while replacing spaces with underscores', () => {
      expect(sanitizeStringWithUnderscores('item #1 (category: test)')).toBe('item_#1_(category:_test)');
    });
  });
});
