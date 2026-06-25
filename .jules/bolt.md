## 2024-05-24 - The filtering anti-pattern
**Learning:** The codebase contains a prevalent anti-pattern of filtering large static datasets (often from JSON) synchronously inside component render functions without memoization. Always wrap repetitive array filtering operations (e.g., `const filteredData = data.filter(...)`) with `useMemo` to prevent performance degradation during unrelated component re-renders.
**Action:** Always check `filteredData` style calculations and add `useMemo` to prevent re-renders when static JSON files are used as data.
