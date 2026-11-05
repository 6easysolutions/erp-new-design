# Palette's Journal

## 2025-05-18 - Icon-Only Table Toolbar Action Accessibility
**Learning:** Shared components like `TableTopHead` are reused across dozens of ERP list views (inventory, finance, hrm, sales). Icon-only buttons with generic `alt="img"` and no `aria-label` or `aria-expanded` state leave screen reader users completely unaware of table export and collapse functions.
**Action:** Always provide explicit `aria-label` attributes on icon-only links/buttons and ensure toggle actions accurately reflect their dynamic state (both via aria-label and aria-expanded).
