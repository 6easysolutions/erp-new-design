## 2024-06-02 - Unmemoized filters on large sets cause excessive re-renders
**Learning:** Found multiple places where large static JSON datasets are filtered synchronously on every render using unmemoized variables (like `const filteredData = ... filter(...)`), causing significant component re-render delays.
**Action:** Always wrap expensive synchronous dataset filtering and array processing with `useMemo` and depend on search values to dramatically reduce JS execution time during renders.
