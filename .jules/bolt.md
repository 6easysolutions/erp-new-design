## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.

## 2026-07-08 - Empty Search Early Returns
**Learning:** The codebase was doing full O(N*M) iterations over all items in datasets for empty searches ( always returns true).
**Action:** When filtering array based on searches, always add an early return () to skip operations on all datasets elements.

## 2026-07-08 - Empty Search Early Returns
**Learning:** The codebase was doing full O(N*M) iterations over all items in datasets for empty searches ("".includes("") always returns true).
**Action:** When filtering array based on searches, always add an early return (if (!searchText) return data;) to skip operations on all datasets elements.
