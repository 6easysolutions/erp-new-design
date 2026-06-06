
## 2024-05-24 - Memoize synchronous static data filtering in React
**Learning:** The codebase contains a prevalent anti-pattern of filtering large static datasets (often from JSON) synchronously inside component render functions without memoization. This causes unnecessary performance degradation during unrelated component re-renders.
**Action:** Always wrap repetitive array filtering operations (e.g., `const filteredData = data.filter(...)`) with `useMemo` to prevent performance degradation during unrelated component re-renders.
