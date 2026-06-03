## 2024-05-24 - Prevalent Array Filtering Anti-Pattern
**Learning:** The codebase contains a widespread anti-pattern where large static datasets (often loaded from JSON files) are filtered synchronously inside React component render functions without memoization.
**Action:** Always wrap repetitive array filtering operations with `useMemo` when working on components in this codebase to prevent severe performance degradation during unrelated state updates.
