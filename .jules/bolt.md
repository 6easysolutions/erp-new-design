## 2024-05-25 - React.memo on CartCounter
**Learning:** `CartCounter` component is used >40 times in POS views (pos.jsx, pos2.jsx, etc.) inside large lists. Parent components like `Pos` frequently re-render (e.g., when `showAlert1` state changes on item clicks).
**Action:** Wrap `CartCounter` in `React.memo` to prevent unnecessary re-renders of dozens of counter instances when the parent state updates.
