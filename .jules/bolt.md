## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.
## 2026-07-23 - Array filtering Optimization with Early Return
**Learning:** While optimizing string conversions inside of large arrays via useMemo works, applying early returns (e.g. `if (!searchText) return data;`) completely circumvents O(N*M) processing, significantly boosting UI responsiveness.
**Action:** Prioritize short-circuit evaluation logic before expensive calculations within useMemo blocks.
