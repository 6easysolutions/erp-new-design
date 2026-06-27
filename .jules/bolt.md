## 2024-06-27 - [Memoize Component Filtering Anti-Pattern]
**Learning:** [The codebase often filters datasets synchronously on every render directly without useMemo, causing O(N*M) recalculations. An example is the holidays component where searching and datasets recalculate the whole array every render]
**Action:** [Check for other similar synchronous unmemoized filtering operations (such as in tables) across the codebase and apply useMemo wrapper on them with proper dependencies]
