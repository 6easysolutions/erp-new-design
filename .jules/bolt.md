## 2024-05-24 - Unmemoized Dataset Filtering in Render
**Learning:** Found a prevalent anti-pattern where large static datasets (often from JSON) are synchronously filtered inside component render functions without memoization. This causes O(N) or O(N*M) operations on every single re-render, blocking the main thread even when the search parameters haven't changed.
**Action:** Always wrap repetitive array filtering operations with `useMemo` when working with React components to prevent performance degradation during unrelated component re-renders.
