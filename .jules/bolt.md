## 2024-05-18 - [Optimized AppRouter Component Render Cycle]
**Learning:** React Router `v6` doesn't optimize correctly when internal components like `RouterContent` in `AppRouter` are defined locally, causing full DOM remounts of the routing tree on any state change. Also, tests that are designed to fail (`src/test/AddProduct.bugCondition.test.jsx`) should NOT be fixed or removed just to get green checks, as they act as a ledger for outstanding bugs.
**Action:** Extract components out of render functions immediately to enable proper `React.memo()` utilization. Never delete pre-existing failing tests in optimization PRs.
## 2026-07-08 - Identified Inefficient Array Filtering Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization (e.g. `data.filter(...)`). It additionally compounds the issue by performing redundant operations, such as extracting keys and repeatedly evaluating `searchText.toLowerCase()` inside inner loops, leading to O(N*M) redundant string conversions.
**Action:** Always wrap array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders. Furthermore, extract redundant string manipulations (like `toLowerCase()`) outside of the filter/loop execution logic to avoid unnecessary re-evaluation.

## 2024-05-24 - [Anti-pattern: O(N*M) Unmemoized Array Filtering]
**Learning:** Found a widespread codebase anti-pattern where potentially large arrays (e.g., table data) are filtered synchronously inside React functional components without `useMemo`. This creates O(N*M) redundant string operations (`toLowerCase`) on every re-render (e.g. from unrelated state changes).
**Action:** When working on array filtering in functional components, always ensure:
1) Early return if search string is empty.
2) Extract redundant transformations like `.toLowerCase()` outside the loop.
3) Wrap the result in `useMemo` with proper dependencies.

## 2024-11-04 - [React Component Definition Anti-pattern]
**Learning:** Defining functional components inline within the parent's render body completely defeats `useMemo` caching since the child component is recreated as a completely new type on every render.
**Action:** Always extract child components outside of the parent and pass required state variables explicitly via props to ensure memoization and other hooks work as expected.

## 2024-11-20 - [Consolidating Derived Array Statistics]
**Learning:** Performing multiple independent \`.reduce()\` operations over a common array inside functional components leads to unnecessary O(M*N) JS operations per render cycle, which compounds heavily for large datasets.
**Action:** Consolidate derivations by folding multiple passes into a single \`for...of\` loop wrapped within a single \`useMemo\` block to minimize array traversal overhead and prevent re-evaluation on unrelated renders. Ensure \`useMemo\` is explicitly imported if refactoring existing code without it.

## 2024-11-20 - [Consolidating Derived Array Statistics]
**Learning:** Performing multiple independent `.reduce()` operations over a common array inside functional components leads to unnecessary O(M*N) JS operations per render cycle, which compounds heavily for large datasets.
**Action:** Consolidate derivations by folding multiple passes into a single `for...of` loop wrapped within a single `useMemo` block to minimize array traversal overhead and prevent re-evaluation on unrelated renders. Ensure `useMemo` is explicitly imported if refactoring existing code without it.
