import { describe, it, expect } from "vitest";

function safeToNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Baseline: original multi-pass calculation in PurchaseEdit
function originalCalculateTotals(purchaseItems, charges, gstType) {
  const noOfItems     = purchaseItems.length;
  const totalQty      = purchaseItems.reduce((s, i) => s + safeToNumber(i.total_quantity), 0);
  const taxableAmount = purchaseItems.reduce((s, i) => s + safeToNumber(i.purchase_rate) * safeToNumber(i.quantity_stock), 0);
  const taxAmount     = purchaseItems.reduce((s, i) => s + safeToNumber(i.total_tax), 0);
  const igst_amount   = gstType === "INTER"  ? taxAmount : 0;
  const cgst_amount   = gstType === "INTRA"  ? taxAmount / 2 : 0;
  const sgst_amount   = gstType === "INTRA"  ? taxAmount / 2 : 0;
  const total_charges_amount = charges.reduce((s, c) => s + safeToNumber(c.total_amount), 0);
  return { noOfItems, totalQty, taxableAmount, taxAmount, igst_amount, cgst_amount, sgst_amount, total_charges_amount };
}

// Optimized: single-pass calculation used in PurchaseEdit
function optimizedCalculateTotals(purchaseItems, charges, gstType) {
  const noOfItems = purchaseItems.length;
  let totalQty = 0;
  let taxableAmount = 0;
  let taxAmount = 0;

  for (let i = 0; i < purchaseItems.length; i++) {
    const item = purchaseItems[i];
    totalQty += safeToNumber(item.total_quantity);
    taxableAmount += safeToNumber(item.purchase_rate) * safeToNumber(item.quantity_stock);
    taxAmount += safeToNumber(item.total_tax);
  }

  let total_charges_amount = 0;
  for (let i = 0; i < charges.length; i++) {
    total_charges_amount += safeToNumber(charges[i].total_amount);
  }

  const igst_amount   = gstType === "INTER" ? taxAmount : 0;
  const cgst_amount   = gstType === "INTRA" ? taxAmount / 2 : 0;
  const sgst_amount   = gstType === "INTRA" ? taxAmount / 2 : 0;

  return { noOfItems, totalQty, taxableAmount, taxAmount, igst_amount, cgst_amount, sgst_amount, total_charges_amount };
}

describe("PurchaseEdit Totals Calculation", () => {
  const sampleItems = [
    { total_quantity: 10, purchase_rate: 100, quantity_stock: 10, total_tax: 180 },
    { total_quantity: 5, purchase_rate: 50, quantity_stock: 5, total_tax: 25 },
    { total_quantity: null, purchase_rate: "20", quantity_stock: 2, total_tax: undefined },
  ];
  const sampleCharges = [
    { total_amount: 100 },
    { total_amount: "50" },
    { total_amount: null },
  ];

  it("produces identical results across INTRA, INTER, and nonGST types", () => {
    for (const gstType of ["INTRA", "INTER", "nonGST"]) {
      const orig = originalCalculateTotals(sampleItems, sampleCharges, gstType);
      const opt = optimizedCalculateTotals(sampleItems, sampleCharges, gstType);
      expect(opt).toEqual(orig);
    }
  });

  it("handles empty arrays gracefully", () => {
    const orig = originalCalculateTotals([], [], "INTRA");
    const opt = optimizedCalculateTotals([], [], "INTRA");
    expect(opt).toEqual(orig);
    expect(opt.noOfItems).toBe(0);
    expect(opt.totalQty).toBe(0);
    expect(opt.taxableAmount).toBe(0);
    expect(opt.taxAmount).toBe(0);
    expect(opt.total_charges_amount).toBe(0);
  });

  it("measures performance speedup of single-pass over multi-reduce", () => {
    const n = 500;
    const largeItems = Array.from({ length: n }, (_, i) => ({
      total_quantity: i + 1,
      purchase_rate: (i + 1) * 2,
      quantity_stock: 5,
      total_tax: (i + 1) * 0.18,
    }));
    const largeCharges = Array.from({ length: 10 }, (_, i) => ({ total_amount: i * 5 }));

    // Warmup
    for (let i = 0; i < 200; i++) {
      originalCalculateTotals(largeItems, largeCharges, "INTRA");
      optimizedCalculateTotals(largeItems, largeCharges, "INTRA");
    }

    const iterations = 2000;
    const startOrig = performance.now();
    for (let i = 0; i < iterations; i++) {
      originalCalculateTotals(largeItems, largeCharges, "INTRA");
    }
    const endOrig = performance.now();
    const durationOrig = endOrig - startOrig;

    const startOpt = performance.now();
    for (let i = 0; i < iterations; i++) {
      optimizedCalculateTotals(largeItems, largeCharges, "INTRA");
    }
    const endOpt = performance.now();
    const durationOpt = endOpt - startOpt;

    console.log("=== PURCHASE TOTALS BENCHMARK ===");
    console.log(`Original Multi-pass Reduce: ${durationOrig.toFixed(2)} ms`);
    console.log(`Optimized Single-pass Loop: ${durationOpt.toFixed(2)} ms`);
    console.log(`Speedup: ${(durationOrig / durationOpt).toFixed(2)}x faster`);
    console.log("================================");

    expect(durationOpt).toBeLessThanOrEqual(durationOrig * 1.5);
  });
});
