## 2024-05-18 - [Optimized AppRouter Component Render Cycle]
**Learning:** React Router `v6` doesn't optimize correctly when internal components like `RouterContent` in `AppRouter` are defined locally, causing full DOM remounts of the routing tree on any state change. Also, tests that are designed to fail (`src/test/AddProduct.bugCondition.test.jsx`) should NOT be fixed or removed just to get green checks, as they act as a ledger for outstanding bugs.
**Action:** Extract components out of render functions immediately to enable proper `React.memo()` utilization. Never delete pre-existing failing tests in optimization PRs.
## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.
## 2026-07-23 - Array filtering Optimization with Early Return
**Learning:** While optimizing string conversions inside of large arrays via useMemo works, applying early returns (e.g. `if (!searchText) return data;`) completely circumvents O(N*M) processing, significantly boosting UI responsiveness.
**Action:** Prioritize short-circuit evaluation logic before expensive calculations within useMemo blocks.
