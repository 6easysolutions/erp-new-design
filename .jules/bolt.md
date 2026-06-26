## 2026-06-26 - Array filtering synchronous blocking anti-pattern
**Learning:** The codebase contains a prevalent anti-pattern of filtering large static datasets synchronously inside component render functions without memoization. This blocks the main thread during unrelated component re-renders.
**Action:** Always wrap repetitive array filtering operations with useMemo to prevent performance degradation.
