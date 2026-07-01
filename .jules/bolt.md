## 2024-06-25 - Extracted Inner Loop Operations
**Learning:** The codebase has a widespread pattern of filtering arrays where strings are lowercased inside the `some` block, leading to O(N*M) operations during search where N is array length and M is number of keys.
**Action:** Extract operations like `searchText.toLowerCase()` outside of inner loops to prevent unnecessary recalculations, changing the time complexity to O(1) for the search term lowercasing.
