## 2025-01-27 - [Unmemoized Array Filtering in Render]
**Learning:** The codebase contains a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization.
**Action:** Always wrap repetitive array filtering operations with `useMemo` to prevent performance degradation during unrelated component re-renders.