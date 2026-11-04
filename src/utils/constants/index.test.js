import { describe, it, expect } from 'vitest';
import { getTotalFromArray, maskData } from './index';

describe('maskData', () => {
  describe('falsy and empty values', () => {
    it('should return empty string when value is null, undefined, or empty', () => {
      expect(maskData(null, 'email')).toBe('');
      expect(maskData(undefined, 'email')).toBe('');
      expect(maskData('', 'email')).toBe('');
      expect(maskData(0, 'email')).toBe('');
      expect(maskData(false, 'email')).toBe('');
    });
  });

  describe('email type', () => {
    it('should mask the username portion except for the last 2 characters', () => {
      expect(maskData('john@example.com', 'email')).toBe('**hn@example.com');
      expect(maskData('testuser@gmail.com', 'email')).toBe('******er@gmail.com');
    });

    it('should handle usernames with 2 or fewer characters without stars', () => {
      expect(maskData('me@example.com', 'email')).toBe('me@example.com');
      expect(maskData('a@example.com', 'email')).toBe('a@example.com');
    });

    it('should return original value when email format is invalid', () => {
      expect(maskData('invalidemail', 'email')).toBe('invalidemail');
      expect(maskData('@domain.com', 'email')).toBe('@domain.com');
      expect(maskData('user@', 'email')).toBe('user@');
    });
  });

  describe('sms type', () => {
    it('should mask sms digits according to implementation', () => {
      expect(maskData('1234567890', 'sms')).toBe('******* 889');
      expect(maskData('+19876543210', 'sms')).toBe('******* 889');
    });
  });

  describe('unsupported or unspecified type', () => {
    it('should return the original value when type is unknown or not provided', () => {
      expect(maskData('someData', 'unknown')).toBe('someData');
      expect(maskData('123456')).toBe('123456');
      expect(maskData('john@example.com', null)).toBe('john@example.com');
    });
  });
});

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
