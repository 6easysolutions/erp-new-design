## 2026-06-29 - Anti-pattern: Synchronous Data Filtering
**Learning:** Found a widespread anti-pattern where large datasets are filtered synchronously in the render function using `Array.prototype.filter`. Redundant operations, such as `toLowerCase()`, are placed inside nested loops causing an O(N*M) calculation that severely blocks the main thread during unrelated component re-renders.
**Action:** Always wrap large or repetitive array operations in `useMemo`, and hoist repetitive value recalculations (like string manipulations) outside of inner loops to prevent expensive re-evaluations.
