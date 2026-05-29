## 2024-05-29 - Missing Debounce in Product Search API Call

**Learning:** Found a direct API call `fetchSearchResults` being triggered for every keystroke in `handleSearchChange` in `src/feature-module/sales/Sale.jsx`. Wrapping the async API call directly using `useCallback(debounce(...), [])` leads to stale closures and linting errors. Using `useRef` with `debounce(async ...)` is a cleaner way to maintain a persistent debounced function reference across re-renders while safely handling async data fetching within React components.

**Action:** Wrap the async API call using `useRef(debounce(async (...), 500)).current` to ensure that only the last keystroke within the debounce threshold triggers the call and safely avoids stale closures.
