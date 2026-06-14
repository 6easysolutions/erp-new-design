## 2024-06-25 - Prevent Unnecessary Array Filtering During Render
**Learning:** This codebase contains a prevalent anti-pattern of filtering large static datasets (often from JSON or APIs) synchronously inside component render functions without memoization.
**Action:** Always wrap repetitive array filtering operations (e.g., `const filteredData = data.filter(...)`) with `useMemo` to prevent performance degradation during unrelated component re-renders.
