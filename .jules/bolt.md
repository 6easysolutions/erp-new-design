## 2024-11-02 - Combine Multiple Filters into Single Pass
**Learning:** Found an anti-pattern in the codebase where data is iterated through multiple times during render (e.g. `const varianceItems = variances.filter(...); const filteredVariances = varianceItems.filter(...)`). This requires creating intermediate arrays and takes O(2*N) passes.
**Action:** When calculating derived data, consolidate multiple `.filter()` conditions into a single pass to eliminate intermediate allocations and reduce iteration overhead to O(N).
