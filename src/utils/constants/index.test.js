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
