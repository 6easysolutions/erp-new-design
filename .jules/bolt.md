## 2026-06-16 - Prevent Synchronous Array Filtering in Renders

**Learning:** This codebase frequently loads large static datasets (often from JSON files) directly into components, and performs iterative filtering and string searching on them on every render cycle without memoization. E.g., `data.filter(...)` scanning every property of every item on any unrelated component state change. This causes significant, unnecessary re-render overhead.

**Action:** Always wrap redundant and expensive static array filtering and mapping operations within a component's render body using `useMemo`. Ensure `useMemo` dependencies strictly cover only what can actually change (like search strings and incoming raw data) to prevent the O(N) or O(N*M) operations from firing continuously.
