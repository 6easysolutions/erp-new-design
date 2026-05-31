## 2024-05-31 - Memoizing mapped list components in POS
**Learning:** Extracting mapped grid items (like ProductCard in POS) and memoizing them prevents the entire grid from re-rendering every time global component state (like the cart) updates.
**Action:** Always consider `React.memo()` for items in large lists/grids that receive primitive props or memoized callbacks, especially when the parent component has frequent state updates (like cart modifications).
