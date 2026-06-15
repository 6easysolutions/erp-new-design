## 2024-05-24 - Unmemoized Array Filtering Anti-Pattern
**Learning:** This codebase frequently filters large static datasets from JSON synchronously inside component render functions without memoization (e.g., `const filteredData = data.filter(...)`). This leads to severe performance degradation as the filtering runs on every render, even for unrelated state changes.
**Action:** When working on components rendering large datasets (like datatables), wrap array filtering with `useMemo` based on the search/filter criteria to prevent unnecessary recalculations.
