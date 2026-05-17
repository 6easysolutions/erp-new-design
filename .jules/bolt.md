## 2024-06-25 - Replace O(N) array search inside `.map` with Map lookup
**Learning:** In React components like `pos4.jsx`, rendering a grid of products while checking each one against a cart array using `cart.some` and `cart.find` leads to an O(N * M) time complexity during every render.
**Action:** Always precompute a `Map` of items when checking if an element exists within another collection inside a `.map` loop, reducing time complexity to O(N + M) and significantly reducing CPU usage during re-renders.
