## 2024-05-14 - Inline array creation in render loops
**Learning:** Found an inline array creation inside `categories.map` in `pos4.jsx`: `const categoryImages = [...]`. This causes the array to be recreated on every single iteration of the map, which runs on every render, adding unnecessary garbage collection pressure and CPU cycles, especially since categories list can grow.
**Action:** Move static data structures like arrays or objects outside of components or memoize them, particularly when they are used within loops or map functions.

## 2024-05-14 - Unnecessary array operations inside map
**Learning:** Found O(N*M) complexity in `storeProducts.map` where it calls `cart.some` and `cart.find` for EVERY product in the grid. If we have 100 products and 10 items in cart, that's 2000 iterations every render!
**Action:** Convert arrays to maps/sets before looping, or use useMemo to create a quick lookup dictionary.
