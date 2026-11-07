import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { inventoryService } from '../inventoryService';

describe('inventoryService', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('getAllProducts returns all products', async () => {
        const promise = inventoryService.getAllProducts();
        vi.runAllTimers();
        const products = await promise;
        expect(products).toHaveLength(6);
        expect(products[0].name).toBe("Fresh Tomato");
    });

    it('getProductsByStatus returns products with specific status', async () => {
        const promise = inventoryService.getProductsByStatus('In Stock');
        vi.runAllTimers();
        const products = await promise;
        expect(products).toHaveLength(3);
        expect(products.every(p => p.status === 'In Stock')).toBe(true);
    });

    it('getProductsByStatus returns all products when status is All', async () => {
        const promise = inventoryService.getProductsByStatus('All');
        vi.runAllTimers();
        const products = await promise;
        expect(products).toHaveLength(6);
    });

    it('deleteProduct resolves with success message', async () => {
        const promise = inventoryService.deleteProduct(1);
        vi.runAllTimers();
        const result = await promise;
        expect(result).toEqual({ success: true, message: 'Product 1 deleted successfully.' });
    });
});
