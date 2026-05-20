## 2024-05-19 - O(N*M) loop mapping over component arrays
**Learning:** Found nested arrays lookup operations (`cart.some()` or `cart.find()`) inside `map` operations in the React render loop causing O(N*M) time complexity every render cycle. `pos4.jsx` and `KopagPOS.jsx` were performing these lookups during the list mapping which blocks the main thread with unnecessary work.
**Action:** Replace `array.some` or `array.find` loop inside array rendering by calculating a `useMemo` map mapping ID to Element, bringing the performance down from O(N*M) to O(N) lookup.
