## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.

## 2024-05-24 - [Anti-pattern: O(N*M) Unmemoized Array Filtering]
**Learning:** Found a widespread codebase anti-pattern where potentially large arrays (e.g., table data) are filtered synchronously inside React functional components without `useMemo`. This creates O(N*M) redundant string operations (`toLowerCase`) on every re-render (e.g. from unrelated state changes).
**Action:** When working on array filtering in functional components, always ensure:
1) Early return if search string is empty.
2) Extract redundant transformations like `.toLowerCase()` outside the loop.
3) Wrap the result in `useMemo` with proper dependencies.
