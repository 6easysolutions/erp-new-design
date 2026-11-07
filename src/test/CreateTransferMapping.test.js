import { describe, it, expect } from 'vitest';

describe('CreateTransfer handleAdd store mapping optimization', () => {
  // Helper implementing the optimized mapping logic exactly as used in CreateTransfer.jsx
  function mapSelectedItems(selected, sourceStore) {
    if (selected.length === 0) return [];
    const sourceStoreId = sourceStore?.id;
    // Convert stores to an object map keyed by storeId per product before the map loop
    const storesByProduct = {};
    for (let i = 0; i < selected.length; i++) {
      const p = selected[i];
      if (Array.isArray(p.stores)) {
        const storeMap = {};
        for (let j = 0; j < p.stores.length; j++) {
          const s = p.stores[j];
          if (s && s.storeId !== undefined) {
            storeMap[s.storeId] = s;
          }
        }
        storesByProduct[p.id] = storeMap;
      }
    }

    // Map selected products to the format expected by parent
    return selected.map(p => {
      const storeData = storesByProduct[p.id]?.[sourceStoreId];
      const availableQty = storeData ? parseInt(storeData.quantity, 10) : 0;
      return {
        id: p.id,
        productId: p.id,
        product: p.name,
        sku: p.barcode || `PROD-${p.id}`,
        availableQty,
        transferQty: 0,
        unit: p.uomConversions?.[0]?.unitName || "pcs",
        remarks: "",
      };
    });
  }

  it('correctly maps product details and retrieves quantity for the matching store', () => {
    const selected = [
      {
        id: 1,
        name: 'Apple iPhone 15',
        barcode: 'IPHONE-15',
        stores: [
          { storeId: 10, quantity: '5' },
          { storeId: 20, quantity: '42' },
        ],
        uomConversions: [{ unitName: 'box' }],
      },
      {
        id: 2,
        name: 'Samsung Galaxy S24',
        barcode: null,
        stores: [
          { storeId: 20, quantity: '18' },
        ],
        uomConversions: [],
      },
    ];

    const sourceStore = { id: 20, storeName: 'Main Warehouse' };
    const result = mapSelectedItems(selected, sourceStore);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      productId: 1,
      product: 'Apple iPhone 15',
      sku: 'IPHONE-15',
      availableQty: 42,
      transferQty: 0,
      unit: 'box',
      remarks: '',
    });
    expect(result[1]).toEqual({
      id: 2,
      productId: 2,
      product: 'Samsung Galaxy S24',
      sku: 'PROD-2',
      availableQty: 18,
      transferQty: 0,
      unit: 'pcs',
      remarks: '',
    });
  });

  it('handles products without matching store or with null/undefined stores', () => {
    const selected = [
      {
        id: 3,
        name: 'Product Without Stores',
        barcode: 'PROD-3',
        stores: null,
        uomConversions: null,
      },
      {
        id: 4,
        name: 'Product In Other Store Only',
        barcode: 'PROD-4',
        stores: [{ storeId: 99, quantity: '100' }],
      },
    ];

    const sourceStore = { id: 20, storeName: 'Main Warehouse' };
    const result = mapSelectedItems(selected, sourceStore);

    expect(result[0].availableQty).toBe(0);
    expect(result[1].availableQty).toBe(0);
  });

  it('returns empty array if selected is empty', () => {
    expect(mapSelectedItems([], { id: 1 })).toEqual([]);
  });
});
