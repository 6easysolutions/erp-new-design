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
