import { describe, it, expect } from "vitest";

// Original implementation: 5 separate .filter() passes
function computeStatusStepsOriginal(orders) {
  return [
    { key: "Draft",      label: "Draft",      color: "#64748b", bg: "rgba(100,116,139,0.1)" },
    { key: "Submitted",  label: "Submitted",  color: "#2563eb", bg: "rgba(59,130,246,0.1)"  },
    { key: "Approved",   label: "Approved",   color: "#059669", bg: "rgba(16,185,129,0.1)"  },
    { key: "Dispatched", label: "Dispatched", color: "#b45309", bg: "rgba(245,158,11,0.1)"  },
    { key: "Received",   label: "Received",   color: "#7c3aed", bg: "rgba(139,92,246,0.1)"  },
  ].map((step) => ({
    ...step,
    count: orders.filter((o) =>
      step.key === "Approved"
        ? o.status === "Approve" || o.status === "Approved"
        : o.status === step.key
    ).length,
  }));
}

// Optimized implementation: single-pass counting
function computeStatusStepsOptimized(orders) {
  const counts = { Draft: 0, Submitted: 0, Approved: 0, Dispatched: 0, Received: 0 };
  for (let i = 0; i < orders.length; i++) {
    const s = orders[i]?.status;
    if (s === "Approve" || s === "Approved") {
      counts.Approved++;
    } else if (counts[s] !== undefined) {
      counts[s]++;
    }
  }

  return [
    { key: "Draft",      label: "Draft",      color: "#64748b", bg: "rgba(100,116,139,0.1)", count: counts.Draft },
    { key: "Submitted",  label: "Submitted",  color: "#2563eb", bg: "rgba(59,130,246,0.1)",  count: counts.Submitted },
    { key: "Approved",   label: "Approved",   color: "#059669", bg: "rgba(16,185,129,0.1)",  count: counts.Approved },
    { key: "Dispatched", label: "Dispatched", color: "#b45309", bg: "rgba(245,158,11,0.1)",  count: counts.Dispatched },
    { key: "Received",   label: "Received",   color: "#7c3aed", bg: "rgba(139,92,246,0.1)",  count: counts.Received },
  ];
}

describe("InternalOrders statusSteps: correctness and performance", () => {
  it("computes identical counts across all statuses including edge cases", () => {
    const sampleOrders = [
      { id: 1, status: "Draft" },
      { id: 2, status: "Submitted" },
      { id: 3, status: "Approved" },
      { id: 4, status: "Approve" },
      { id: 5, status: "Dispatched" },
      { id: 6, status: "Received" },
      { id: 7, status: "Completed" }, // Unknown status
      { id: 8, status: null },
      { id: 9, status: undefined },
      { id: 10, status: "Draft" },
    ];

    const original = computeStatusStepsOriginal(sampleOrders);
    const optimized = computeStatusStepsOptimized(sampleOrders);

    expect(optimized).toEqual(original);
  });

  it("handles empty orders gracefully", () => {
    const original = computeStatusStepsOriginal([]);
    const optimized = computeStatusStepsOptimized([]);

    expect(optimized).toEqual(original);
  });

  it("benchmarks performance: single-pass vs 5x filter passes", () => {
    const statuses = ["Draft", "Submitted", "Approved", "Approve", "Dispatched", "Received", "Completed", "Cancelled"];
    const N = 5000;
    const testOrders = Array.from({ length: N }, (_, i) => ({
      id: i,
      status: statuses[i % statuses.length],
    }));

    // Warm-up
    for (let i = 0; i < 50; i++) {
      computeStatusStepsOriginal(testOrders);
      computeStatusStepsOptimized(testOrders);
    }

    const iterations = 500;

    const startOriginal = performance.now();
    for (let i = 0; i < iterations; i++) {
      computeStatusStepsOriginal(testOrders);
    }
    const durationOriginal = performance.now() - startOriginal;

    const startOptimized = performance.now();
    for (let i = 0; i < iterations; i++) {
      computeStatusStepsOptimized(testOrders);
    }
    const durationOptimized = performance.now() - startOptimized;

    console.log("=== BENCHMARK: InternalOrders statusSteps ===");
    console.log(`Original (5x filter): ${durationOriginal.toFixed(2)} ms`);
    console.log(`Optimized (single-pass): ${durationOptimized.toFixed(2)} ms`);
    console.log(`Speedup: ${(durationOriginal / durationOptimized).toFixed(2)}x faster`);
    console.log("=============================================");

    expect(durationOptimized).toBeLessThan(durationOriginal);
  });
});
