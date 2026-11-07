import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProductResponse } from '../utils/product/index.js';

describe('Barcode search response handling in POS4', () => {
  it('should handle single object response properly', () => {
    const singleProduct = { id: 1, name: 'Product A', barcode: '123456' };
    const products = normalizeProductResponse(singleProduct);
    assert.strictEqual(products.length, 1);
    assert.strictEqual(products[0].id, 1);
    assert.strictEqual(products[0].name, 'Product A');
  });

  it('should handle array response properly', () => {
    const productArray = [
      { id: 1, name: 'Product A', barcode: '123456' },
      { id: 2, name: 'Product B', barcode: '123456' }
    ];
    const products = normalizeProductResponse(productArray);
    assert.strictEqual(products.length, 2);
    assert.strictEqual(products[0].id, 1);
    assert.strictEqual(products[1].id, 2);
  });

  it('should handle empty array response properly', () => {
    const products = normalizeProductResponse([]);
    assert.strictEqual(products.length, 0);
  });

  it('should handle falsy/null/undefined response gracefully', () => {
    assert.deepStrictEqual(normalizeProductResponse(null), []);
    assert.deepStrictEqual(normalizeProductResponse(undefined), []);
  });
});
