## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.

## 2023-10-25 - Extracted Array Filtering String Conversions
**Learning:** Found an anti-pattern in search filtering where string manipulations (like `.toLowerCase()`) on search terms are evaluated on every iteration inside `.filter()`. This is particularly inefficient during every render since it creates an O(N) recalculation even when the search term stays the same.
**Action:** Always hoist `searchTerm.toLowerCase()` outside the `.filter()` loop, wrap the entire operation in `useMemo`, and provide an early return for empty search queries to completely skip loop evaluation when not actively searching.
