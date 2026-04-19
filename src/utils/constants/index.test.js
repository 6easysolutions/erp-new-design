import { describe, it, expect } from 'vitest';
import { getTotalFromArray } from './index';

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
