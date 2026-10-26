## 2024-05-18 - [Optimized AppRouter Component Render Cycle]
**Learning:** React Router `v6` doesn't optimize correctly when internal components like `RouterContent` in `AppRouter` are defined locally, causing full DOM remounts of the routing tree on any state change. Also, tests that are designed to fail (`src/test/AddProduct.bugCondition.test.jsx`) should NOT be fixed or removed just to get green checks, as they act as a ledger for outstanding bugs.
**Action:** Extract components out of render functions immediately to enable proper `React.memo()` utilization. Never delete pre-existing failing tests in optimization PRs.
## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.

## 2024-05-24 - O(4N) array statistics filtering anti-pattern
**Learning:** Found an anti-pattern in `InventoryCounts.jsx` where `.filter().length` was used 4 separate times on the exact same `sessions` array to count occurrences of different enum statuses. This iterates over the entire dataset 4 times instead of 1.
**Action:** When calculating multiple derived statistics from an array, avoid using multiple separate `.filter()` passes. Consolidate into a single-pass `for...of` loop to drop the multiplier complexity from O(M*N) to O(N).
