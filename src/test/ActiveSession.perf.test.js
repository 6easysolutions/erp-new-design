import { describe, it, expect } from "vitest";

function baselineFilter(products, searchQuery, statusFilter) {
  return products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || (
        (statusFilter === 'Matched' && p.counted !== null && p.counted === p.systemQty) ||
        (statusFilter === 'Variance' && p.counted !== null && p.counted !== p.systemQty) ||
        (statusFilter === 'Not_Counted' && p.counted === null)
    );
    return matchesSearch && matchesStatus;
  });
}

function optimizedFilter(products, searchQuery, statusFilter) {
  if (!searchQuery && !statusFilter) {
    return products;
  }

  const lowerQuery = searchQuery?.toLowerCase() || "";

  return products.filter(p => {
    if (statusFilter) {
      if (statusFilter === 'Matched' && (p.counted === null || p.counted !== p.systemQty)) return false;
      if (statusFilter === 'Variance' && (p.counted === null || p.counted === p.systemQty)) return false;
      if (statusFilter === 'Not_Counted' && p.counted !== null) return false;
    }

    if (!lowerQuery) return true;

    return (
      (p.name?.toLowerCase() || "").includes(lowerQuery) ||
      (p.sku?.toLowerCase() || "").includes(lowerQuery)
    );
  });
}

const mockProducts = [
  { id: 101, name: "Nike Air Jordan", sku: "PT002", category: "Shoes", systemQty: 120, counted: null },
  { id: 102, name: "Lenovo IdeaPad 3", sku: "PT001", category: "Laptops", systemQty: 85, counted: null },
  { id: 103, name: "Apple Watch Series 5", sku: "PT004", category: "Electronics", systemQty: 45, counted: 42 },
  { id: 104, name: "Logitech Mouse", sku: "PT005", category: "Electronics", systemQty: 200, counted: 200 },
  { id: 105, name: "Samsung Monitor", sku: "PT006", category: "Electronics", systemQty: 15, counted: null },
  { id: 106, name: "Sony Headphones", sku: "PT007", category: "Electronics", systemQty: 60, counted: 58 },
  { id: 107, name: "Canon Camera", sku: "PT008", category: "Electronics", systemQty: 25, counted: null },
];

describe("ActiveSession Filter Logic & Performance", () => {
  it("should match baseline filtering behavior across search queries and status filters", () => {
    const testCases = [
      { query: "", filter: "" },
      { query: "nike", filter: "" },
      { query: "PT001", filter: "" },
      { query: "", filter: "Matched" },
      { query: "", filter: "Variance" },
      { query: "", filter: "Not_Counted" },
      { query: "Electronics", filter: "Variance" },
      { query: "Watch", filter: "Matched" },
      { query: "Camera", filter: "Not_Counted" },
      { query: "Nonexistent", filter: "" },
    ];

    for (const { query, filter } of testCases) {
      const baseline = baselineFilter(mockProducts, query, filter);
      const optimized = optimizedFilter(mockProducts, query, filter);
      expect(optimized).toEqual(baseline);
    }
  });

  it("should early-return original reference when searchQuery and statusFilter are empty", () => {
    const result = optimizedFilter(mockProducts, "", "");
    expect(result).toBe(mockProducts);
  });

  it("benchmarks performance improvement of optimized filter over baseline", () => {
    const largeDataset = Array.from({ length: 2000 }, (_, i) => ({
      id: i,
      name: `Product ${i} Nike Air Jordan Electronics Premium Device`,
      sku: `SKU-${i}-PT00${i % 10}`,
      category: i % 2 === 0 ? "Electronics" : "Shoes",
      systemQty: 100,
      counted: i % 3 === 0 ? 100 : (i % 3 === 1 ? 95 : null),
    }));

    // Measure baseline with active search & filter
    const t0 = performance.now();
    for (let i = 0; i < 200; i++) {
      baselineFilter(largeDataset, "PT005", "Variance");
    }
    const baselineTime = performance.now() - t0;

    // Measure optimized with active search & filter
    const t1 = performance.now();
    for (let i = 0; i < 200; i++) {
      optimizedFilter(largeDataset, "PT005", "Variance");
    }
    const optimizedTime = performance.now() - t1;

    expect(optimizedTime).toBeLessThanOrEqual(baselineTime);
  });
});
