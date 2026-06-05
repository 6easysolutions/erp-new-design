## 2024-05-25 - Synchronous Array Filtering Anti-Pattern
**Learning:** The codebase has a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization. This causes unnecessary recalculations on every re-render, degrading performance.
**Action:** Always wrap repetitive array filtering and processing operations (e.g., `const filteredData = data.filter(...)`) with `useMemo` to prevent performance degradation during unrelated component re-renders.
