import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTotalFromArray, formatSharedDate } from './index';

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

  it('should return the element value for a single-element array', () => {
    expect(getTotalFromArray([42])).toBe(42);
    expect(getTotalFromArray(['99'])).toBe(99);
  });

  it('should correctly handle negative numbers and negative string numbers', () => {
    expect(getTotalFromArray([-5, -10, 20])).toBe(5);
    expect(getTotalFromArray(['-15', 5, '-5'])).toBe(-15);
  });

  it('should correctly handle floating-point and decimal numbers', () => {
    expect(getTotalFromArray([1.5, 2.25, 0.25])).toBe(4);
    expect(getTotalFromArray(['3.5', 1.5])).toBe(5);
  });

  it('should return 0 when array contains only zeroes or zero-like values', () => {
    expect(getTotalFromArray([0, 0, '0', -0])).toBe(0);
  });

  it('should return 0 when all array elements are invalid numbers / NaN', () => {
    expect(getTotalFromArray(['abc', 'xyz', undefined, {}, [1, 2], NaN])).toBe(0);
  });

  it('should return 0 for non-array primitive types (numbers, booleans, functions)', () => {
    expect(getTotalFromArray(123)).toBe(0);
    expect(getTotalFromArray(0)).toBe(0);
    expect(getTotalFromArray(true)).toBe(0);
    expect(getTotalFromArray(false)).toBe(0);
    expect(getTotalFromArray(() => {})).toBe(0);
  });

  it('should correctly handle booleans and whitespace inside arrays', () => {
    expect(getTotalFromArray([true, false, 5])).toBe(6);
    expect(getTotalFromArray([' ', 10])).toBe(10);
  });

  it('should handle sparse arrays with holes', () => {
    const sparseArr = [5, , 15]; // eslint-disable-line no-sparse-arrays
    expect(getTotalFromArray(sparseArr)).toBe(20);
  });
});

describe('formatSharedDate', () => {
  const FIXED_NOW = new Date(2025, 5, 15, 12, 0, 0); // June 15, 2025 12:00:00

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('falsy or invalid input handling', () => {
    it('should return "-" when input is null, undefined, or empty string', () => {
      expect(formatSharedDate(null)).toBe('-');
      expect(formatSharedDate(undefined)).toBe('-');
      expect(formatSharedDate('')).toBe('-');
    });

    it('should return "-" when input represents an invalid date', () => {
      expect(formatSharedDate('invalid-date-string')).toBe('-');
      expect(formatSharedDate('not a date')).toBe('-');
    });
  });

  describe('same day ("Today")', () => {
    it('should return "Today" for dates on the same calendar day', () => {
      // Exactly same time
      expect(formatSharedDate(new Date(2025, 5, 15, 12, 0, 0))).toBe('Today');
      // Earlier in same day
      expect(formatSharedDate(new Date(2025, 5, 15, 1, 0, 0))).toBe('Today');
      // Later in same day
      expect(formatSharedDate(new Date(2025, 5, 15, 23, 59, 59))).toBe('Today');
    });
  });

  describe('past dates', () => {
    it('should return "1 day ago" for dates exactly 1 calendar day in the past', () => {
      expect(formatSharedDate(new Date(2025, 5, 14, 12, 0, 0))).toBe('1 day ago');
      expect(formatSharedDate(new Date(2025, 5, 14, 23, 59, 59))).toBe('1 day ago');
      expect(formatSharedDate(new Date(2025, 5, 14, 0, 0, 0))).toBe('1 day ago');
    });

    it('should return "X days ago" for dates multiple days in the past', () => {
      expect(formatSharedDate(new Date(2025, 5, 10, 12, 0, 0))).toBe('5 days ago');
      expect(formatSharedDate(new Date(2025, 4, 15, 12, 0, 0))).toBe('31 days ago');
    });
  });

  describe('future dates', () => {
    it('should return "In 1 day" for dates exactly 1 calendar day in the future', () => {
      expect(formatSharedDate(new Date(2025, 5, 16, 12, 0, 0))).toBe('In 1 day');
      expect(formatSharedDate(new Date(2025, 5, 16, 0, 0, 0))).toBe('In 1 day');
      expect(formatSharedDate(new Date(2025, 5, 16, 23, 59, 59))).toBe('In 1 day');
    });

    it('should return "In X days" for dates multiple days in the future', () => {
      expect(formatSharedDate(new Date(2025, 5, 18, 12, 0, 0))).toBe('In 3 days');
      expect(formatSharedDate(new Date(2025, 6, 15, 12, 0, 0))).toBe('In 30 days');
    });
  });

  describe('different input formats', () => {
    it('should accept Date objects', () => {
      expect(formatSharedDate(new Date(2025, 5, 15))).toBe('Today');
      expect(formatSharedDate(new Date(2025, 5, 14))).toBe('1 day ago');
    });

    it('should accept date strings', () => {
      // Local date string or ISO format
      const dateStr = new Date(2025, 5, 13).toISOString();
      expect(formatSharedDate(dateStr)).toBe('2 days ago');
    });

    it('should accept timestamp numbers', () => {
      const timestamp = new Date(2025, 5, 17, 10, 0, 0).getTime();
      expect(formatSharedDate(timestamp)).toBe('In 2 days');
    });
  });
});
