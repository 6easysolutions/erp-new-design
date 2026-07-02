## 2026-07-02 - O(N*M) String Lowercase Anti-Pattern in Filters
**Learning:** A prevalent anti-pattern exists in this codebase where filtering large static datasets is done synchronously in render functions, and repeatedly calling `.toLowerCase()` on the search string inside nested loops creates an O(N*M) bottleneck.
**Action:** Always extract static transformations (like `toLowerCase()`) outside of filter loops, and wrap the entire operation in `useMemo` to shield against re-evaluations during unrelated state updates.
