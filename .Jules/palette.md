## 2026-11-07 - Missing ARIA Labels on Data Table Actions
**Learning:** The project's codebase frequently implements icon-only action buttons (e.g., using `Link` or `button` elements for Edit/Delete actions in data tables like `.edit-delete-action`) that lack both `aria-label` and `title` attributes.
**Action:** When making UX or accessibility improvements in table components, specifically check `.edit-delete-action` containers and ensure icon-only buttons are updated with explicit `aria-label` attributes for robust screen reader support.
