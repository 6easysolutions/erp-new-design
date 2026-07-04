## 2024-05-24 - Unmemoized Filtering Anti-Pattern
**Learning:** This codebase heavily relies on client-side array filtering for its datatables, and the developers often write this filtering logic synchronously inside the main render block without memoization. Furthermore, they are repeatedly computing `.toLowerCase()` inside `N*M` loops (where N is the number of rows and M is the number of keys).
**Action:** When touching any list or table components, actively check for unmemoized filtering or mapping of large datasets and refactor them into `useMemo` blocks with optimized inner loops.
