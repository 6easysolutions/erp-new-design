## 2024-11-06 - Missing ARIA Labels on Icon-only Action Buttons
**Learning:** Icon-only action buttons across the `feature-module/setup` section are frequently implemented without `aria-label` attributes (e.g., `SalesMan.jsx` action buttons). While they include a `title` attribute which provides a tooltip, `aria-label` is required for robust screen reader accessibility.
**Action:** When working on setup pages, ensure that icon-only buttons include an `aria-label` that mirrors their intended action.
