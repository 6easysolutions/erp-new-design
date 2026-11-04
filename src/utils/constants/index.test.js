import { describe, it, expect } from 'vitest';
import { getTotalFromArray, filterByMatchingCodes } from './index';

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

describe('filterByMatchingCodes', () => {
  it('should return empty array if dataArray or codeArray is not an array', () => {
    expect(filterByMatchingCodes(null, ['A'])).toEqual([]);
    expect(filterByMatchingCodes(undefined, ['A'])).toEqual([]);
    expect(filterByMatchingCodes('not-an-array', ['A'])).toEqual([]);
    expect(filterByMatchingCodes({ code: 'A' }, ['A'])).toEqual([]);
    expect(filterByMatchingCodes(123, ['A'])).toEqual([]);

    expect(filterByMatchingCodes([{ code: 'A' }], null)).toEqual([]);
    expect(filterByMatchingCodes([{ code: 'A' }], undefined)).toEqual([]);
    expect(filterByMatchingCodes([{ code: 'A' }], 'A')).toEqual([]);
    expect(filterByMatchingCodes([{ code: 'A' }], { 0: 'A' })).toEqual([]);
    expect(filterByMatchingCodes([{ code: 'A' }], 123)).toEqual([]);
  });

  it('should return empty array when dataArray or codeArray is empty', () => {
    expect(filterByMatchingCodes([], ['A', 'B'])).toEqual([]);
    expect(filterByMatchingCodes([{ code: 'A' }], [])).toEqual([]);
    expect(filterByMatchingCodes([], [])).toEqual([]);
  });

  it('should filter items whose code matches any string in codeArray', () => {
    const data = [
      { code: 'A', name: 'Item A' },
      { code: 'B', name: 'Item B' },
      { code: 'C', name: 'Item C' },
    ];
    const codes = ['A', 'C'];
    const result = filterByMatchingCodes(data, codes);

    expect(result).toEqual([
      { code: 'A', name: 'Item A' },
      { code: 'C', name: 'Item C' },
    ]);
  });

  it('should ignore non-string codes in codeArray', () => {
    const data = [
      { code: '100', name: 'Item 100' },
      { code: 'B', name: 'Item B' },
    ];
    const codes = [100, null, undefined, {}, true, 'B'];
    const result = filterByMatchingCodes(data, codes);

    expect(result).toEqual([{ code: 'B', name: 'Item B' }]);
  });

  it('should safely filter out null, undefined, primitives, or malformed items in dataArray', () => {
    const data = [
      null,
      undefined,
      'just-a-string',
      123,
      true,
      {},
      { name: 'Missing code' },
      { code: 123, name: 'Number code' },
      { code: null, name: 'Null code' },
      { code: undefined, name: 'Undefined code' },
      { code: 'MATCH', name: 'Valid Item' },
    ];
    const codes = ['MATCH'];
    const result = filterByMatchingCodes(data, codes);

    expect(result).toEqual([{ code: 'MATCH', name: 'Valid Item' }]);
  });

  it('should return all matching items when multiple items share the same code', () => {
    const data = [
      { id: 1, code: 'DUP' },
      { id: 2, code: 'OTHER' },
      { id: 3, code: 'DUP' },
    ];
    const codes = ['DUP'];
    const result = filterByMatchingCodes(data, codes);

    expect(result).toEqual([
      { id: 1, code: 'DUP' },
      { id: 3, code: 'DUP' },
    ]);
  });
});
