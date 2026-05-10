## 2024-05-10 - O(N*M) to O(N+M) Render Loop Optimization
**Learning:** Found an O(N*M) nested loop inside the `storeProducts.map` render loop in `pos4.jsx`, where `cart.some` and `cart.find` were called for every product rendered. With large inventories and carts, this synchronous render blocks the main thread.
**Action:** Always memoize deeply nested array lookups into a `Map` (using `useMemo`) before entering a `.map` render loop to convert O(M) searches into O(1) lookups.
