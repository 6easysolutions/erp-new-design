## 2024-05-24 - Unmemoized Data Filtering in Render
**Learning:** The codebase contains a prevalent anti-pattern of filtering large static datasets (often from JSON) synchronously inside component render functions without memoization.
**Action:** Always wrap repetitive array filtering operations (e.g., `const filteredData = data.filter(...)`) with `useMemo` to prevent performance degradation during unrelated component re-renders.
