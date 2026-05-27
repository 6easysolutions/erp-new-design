## 2024-05-27 - [PrimeDataTable Re-rendering]
**Learning:** [The core `PrimeDataTable` component used globally was recalculating `paginatedData` arrays and props on every render without memoization. This forced expensive `primereact` Datatable re-renders even when parent state changes were unrelated to the table data.]
**Action:** [Wrapped the component in `React.memo`, and used `useMemo`/`useCallback` extensively inside `PrimeDataTable` to provide stable prop references, notably `dataTableProps` and `paginatedData` arrays, preventing cascading re-renders in heavy list views.]
