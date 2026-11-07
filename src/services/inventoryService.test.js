import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inventoryService } from './inventoryService';

describe('inventoryService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getAllProducts', () => {
    it('should resolve with all products after latency delay', async () => {
      const promise = inventoryService.getAllProducts();

      // Before latency completes, promise should be pending
      let isResolved = false;
      promise.then(() => {
        isResolved = true;
      });

      await vi.advanceTimersByTimeAsync(799);
      expect(isResolved).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(isResolved).toBe(true);

      const products = await promise;
      expect(Array.isArray(products)).toBe(true);
      expect(products).toHaveLength(6);
      expect(products[0]).toMatchObject({
        id: 1,
        name: 'Fresh Tomato',
        sku: 'VEG-001',
        cat: 'Vegetables',
        stock: 15,
        maxStock: 50,
        unit: 'kg',
        price: '$2.50',
        status: 'In Stock',
        img: '/assets/img/products/stock-img-01.png',
      });
    });

    it('should return a new array instance on each call', async () => {
      const promise1 = inventoryService.getAllProducts();
      const promise2 = inventoryService.getAllProducts();

      await vi.advanceTimersByTimeAsync(800);

      const [products1, products2] = await Promise.all([promise1, promise2]);
      expect(products1).toEqual(products2);
      expect(products1).not.toBe(products2);
    });
  });

  describe('getProductsByStatus', () => {
    it('should return all products when status is "All"', async () => {
      const promise = inventoryService.getProductsByStatus('All');
      await vi.advanceTimersByTimeAsync(800);
      const products = await promise;

      expect(products).toHaveLength(6);
    });

    it('should filter products by "In Stock" status', async () => {
      const promise = inventoryService.getProductsByStatus('In Stock');
      await vi.advanceTimersByTimeAsync(800);
      const products = await promise;

      expect(products).toHaveLength(3);
      expect(products.every((p) => p.status === 'In Stock')).toBe(true);
      expect(products.map((p) => p.name)).toEqual([
        'Fresh Tomato',
        'Chicken Breast',
        'Basmati Rice',
      ]);
    });

    it('should filter products by "Low Stock" status', async () => {
      const promise = inventoryService.getProductsByStatus('Low Stock');
      await vi.advanceTimersByTimeAsync(800);
      const products = await promise;

      expect(products).toHaveLength(2);
      expect(products.every((p) => p.status === 'Low Stock')).toBe(true);
      expect(products.map((p) => p.name)).toEqual(['Red Onion', 'Green Apple']);
    });

    it('should filter products by "Out of Stock" status', async () => {
      const promise = inventoryService.getProductsByStatus('Out of Stock');
      await vi.advanceTimersByTimeAsync(800);
      const products = await promise;

      expect(products).toHaveLength(1);
      expect(products[0].status).toBe('Out of Stock');
      expect(products[0].name).toBe('Organic Milk');
    });

    it('should return an empty array for an unknown or non-matching status', async () => {
      const promise = inventoryService.getProductsByStatus('Unknown Status');
      await vi.advanceTimersByTimeAsync(800);
      const products = await promise;

      expect(products).toEqual([]);
    });

    it('should respect latency delay', async () => {
      const promise = inventoryService.getProductsByStatus('In Stock');
      let isResolved = false;
      promise.then(() => {
        isResolved = true;
      });

      await vi.advanceTimersByTimeAsync(799);
      expect(isResolved).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(isResolved).toBe(true);

      const products = await promise;
      expect(products).toBeDefined();
    });
  });

  describe('deleteProduct', () => {
    it('should resolve with success message containing the numeric product id after latency delay', async () => {
      const promise = inventoryService.deleteProduct(1);
      let isResolved = false;
      promise.then(() => {
        isResolved = true;
      });

      await vi.advanceTimersByTimeAsync(799);
      expect(isResolved).toBe(false);

      await vi.advanceTimersByTimeAsync(1);
      expect(isResolved).toBe(true);

      const result = await promise;
      expect(result).toEqual({
        success: true,
        message: 'Product 1 deleted successfully.',
      });
    });

    it('should format message properly for string or alphanumeric id', async () => {
      const promise = inventoryService.deleteProduct('VEG-001');
      await vi.advanceTimersByTimeAsync(800);
      const result = await promise;

      expect(result).toEqual({
        success: true,
        message: 'Product VEG-001 deleted successfully.',
      });
    });
  });
});
