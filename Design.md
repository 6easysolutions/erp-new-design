# DESIGN.md — ERP Design System
# Covers: HRMS · POS · Inventory Management
# Philosophy: Calm precision. Dense but never cluttered. Soothing for 8-hour workdays.

---

## 1. CORE PHILOSOPHY

This design system is built for people who live inside the app.
Every decision reduces cognitive load and visual fatigue.

Principles:
- Neutral-dominant surfaces. Color is reserved for status and action only.
- Low-saturation accents. No harsh primaries. Blues are muted slate-blue, not electric.
- Hierarchy through weight and size — not color.
- Generous line height in forms and tables. Eyes should glide, not jump.
- No decorative flourishes. Every pixel serves a function.

---

## 2. COLOR SYSTEM

### Background & Surface Stack
Use a warm neutral base — not pure white. Pure white causes eye strain under
fluorescent office lighting. The slight warmth neutralizes harsh monitor glare.

--color-bg:              #F5F4F1   /* Warm off-white — main canvas */
--color-surface:         #FAFAF8   /* Cards, panels, sidebars */
--color-surface-2:       #FFFFFF   /* Elevated elements, modals */
--color-surface-offset:  #EDECE9   /* Striped table rows, inactive tabs */
--color-surface-dynamic: #E6E4DF   /* Hover states on rows */
--color-border:          rgba(0, 0, 0, 0.08)
--color-divider:         rgba(0, 0, 0, 0.06)

### Text
--color-text:            #1A1A1A
--color-text-secondary:  #52525B
--color-text-muted:      #A1A1AA
--color-text-inverse:    #FFFFFF

### Primary Accent — Slate Blue
Muted, calm blue. Evokes trust and clarity without visual aggression.

--color-primary:         #3B6FD4
--color-primary-hover:   #2F5DB8
--color-primary-active:  #254A9A
--color-primary-subtle:  #EBF0FB
--color-primary-muted:   #C7D6F5

### Status Colors — Desaturated for Comfort

/* Success */
--color-success:         #2E7D52
--color-success-bg:      #EBF5EF

/* Warning */
--color-warning:         #A16207
--color-warning-bg:      #FEF9EC

/* Error */
--color-error:           #B91C1C
--color-error-bg:        #FEF2F2

/* Info */
--color-info:            #1D6FA4
--color-info-bg:         #EFF6FB

### Dark Mode (user-toggled)

--color-bg:              #141413
--color-surface:         #1C1C1A
--color-surface-2:       #232320
--color-surface-offset:  #1A1A18
--color-border:          rgba(255, 255, 255, 0.08)
--color-text:            #E4E4E0
--color-text-secondary:  #A1A1A0
--color-primary:         #6B9EF5
--color-primary-subtle:  #1E2A45

---

## 3. TYPOGRAPHY

### Font Families
--font-body:    'Inter', 'system-ui', sans-serif
--font-mono:    'JetBrains Mono', 'Fira Code', monospace

Load via Google Fonts:
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">

Why Inter: Designed for screen readability. Optimized at 12–16px — the exact
range of table cells, form labels, and data fields.

### Type Scale
--text-xs:   12px   /* Table metadata, timestamps, secondary badges */
--text-sm:   13px   /* Table cell values, form helper text */
--text-base: 14px   /* Body text, form labels, button text */
--text-md:   15px   /* Section descriptions, card body */
--text-lg:   17px   /* Card headings, panel titles */
--text-xl:   20px   /* Page titles, modal headings */
--text-2xl:  24px   /* Dashboard section headings */
--text-3xl:  30px   /* KPI values, large stat numbers */

### Line Heights
--leading-tight:   1.25   /* Headings, labels */
--leading-snug:    1.40   /* Compact table rows */
--leading-normal:  1.55   /* Body text, form fields */
--leading-relaxed: 1.70   /* Help text, descriptions */

### Font Weights
--weight-regular:   400
--weight-medium:    500   /* Labels, nav items */
--weight-semibold:  600   /* Card headings, table headers */
--weight-bold:      700   /* Page titles, KPI values */

### Numeric Data
All numeric data in tables must use tabular figures:
.table-cell-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

---

## 4. SPACING SYSTEM (4px base)

--space-0-5:  2px
--space-1:    4px
--space-1-5:  6px
--space-2:    8px
--space-3:    12px
--space-4:    16px
--space-5:    20px
--space-6:    24px
--space-8:    32px
--space-10:   40px
--space-12:   48px
--space-16:   64px
--space-20:   80px

### Usage Guidelines
Table cell padding:    8px 12px
Form field padding:    8px 12px
Card padding:          20px or 24px
Modal padding:         24px
Section gap:           32px
Page content padding:  24px (mobile) → 32px (desktop)
Sidebar width:         240px (expanded) / 60px (collapsed)

---

## 5. BORDER RADIUS

--radius-sm:   4px    /* Badges, chips, table cells */
--radius-md:   6px    /* Inputs, buttons, small cards */
--radius-lg:   8px    /* Cards, panels, dropdowns */
--radius-xl:   12px   /* Modals, sidesheets */
--radius-full: 9999px /* Pills, avatar circles, toggles */

---

## 6. SHADOWS

--shadow-xs:    0 1px 2px rgba(0,0,0,0.04);
--shadow-sm:    0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
--shadow-md:    0 4px 8px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04);
--shadow-lg:    0 10px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
--shadow-focus: 0 0 0 3px rgba(59, 111, 212, 0.20);

---

## 7. COMPONENT PATTERNS

### Navigation — App Shell
Layout: Fixed left sidebar (240px expanded, 60px collapsed)
        + Top bar (56px height, sticky)
        + Main content area (scrollable)

Sidebar background:    --color-surface
Top bar background:    --color-surface with 1px bottom border --color-border
Active nav item:       background --color-primary-subtle, text --color-primary,
                       left accent bar 2px solid --color-primary
Inactive nav item:     color --color-text-secondary, hover --color-surface-dynamic
Icon size:             18px, positioned left
Nav item height:       36px
Nav item font:         --text-base, --weight-medium
Section label:         --text-xs, --weight-semibold, UPPERCASE, letter-spacing 0.08em,
                       color --color-text-muted

### Data Tables (Primary UI for ERP)
This is the most-used component. Optimize relentlessly.

Table background:      --color-surface-2
Header background:     --color-surface-offset
Header text:           --text-xs, --weight-semibold, UPPERCASE, letter-spacing 0.06em,
                       color --color-text-secondary
Cell text:             --text-sm, color --color-text
Cell padding:          10px 14px
Row height:            44px
Striped rows:          alternate --color-surface-2 / --color-surface-offset
Row hover:             --color-surface-dynamic, 150ms transition
Selected row:          --color-primary-subtle, left border 2px --color-primary
Sticky header:         position sticky, top 0, z-index 10
Sort indicators:       up/down chevrons, 14px, color --color-text-muted
Pagination:            bottom bar, --text-sm, rows-per-page selector
Numeric columns:       right-aligned, tabular-nums

### Form Fields
Input height:          36px
Input padding:         8px 12px
Input background:      --color-surface-2
Input border:          1px solid --color-border
Input border-radius:   --radius-md
Input font:            --text-base, --color-text
Placeholder:           --color-text-muted

Focus state:
  border-color: --color-primary
  box-shadow:   --shadow-focus
  outline:      none

Error state:
  border-color: --color-error
  background:   --color-error-bg (subtle)

Label:                 --text-sm, --weight-medium, --color-text, margin-bottom 6px
Helper text:           --text-xs, --color-text-muted, margin-top 4px
Required mark:         --color-error, after label text
Select, Textarea:      same token rules as Input
Textarea min-height:   80px

### Buttons
Primary button:
  background:     --color-primary
  color:          --color-text-inverse
  height:         36px
  padding:        0 16px
  font:           --text-base, --weight-medium
  radius:         --radius-md
  hover:          --color-primary-hover
  active:         --color-primary-active
  disabled:       opacity 0.45, cursor not-allowed

Secondary button:
  background:     transparent
  border:         1px solid --color-border
  color:          --color-text
  hover:          background --color-surface-dynamic

Destructive button:
  background:     --color-error
  color:          white

Ghost button:
  background:     transparent, no border
  color:          --color-primary
  hover:          background --color-primary-subtle

Icon button:
  size:           32px × 32px
  radius:         --radius-md
  color:          --color-text-secondary
  hover:          background --color-surface-dynamic

Button group gap:  8px

### Cards
background:       --color-surface
border:           1px solid --color-border
border-radius:    --radius-lg
padding:          20px
shadow:           --shadow-sm

Card header:
  font:           --text-lg, --weight-semibold
  margin-bottom:  16px
  border-bottom:  1px solid --color-divider (only for dense content)

KPI / Stat Card:
  Large number:   --text-3xl, --weight-bold, --color-text
  Label:          --text-sm, --color-text-secondary, above the number
  Trend badge:    --text-xs, --weight-medium, pill shape
    positive: --color-success, background --color-success-bg
    negative: --color-error,   background --color-error-bg

### Badges & Status Tags
Base: --text-xs, --weight-medium, padding 2px 8px, radius --radius-full

Active / Success:  color --color-success,         background --color-success-bg
Pending / Warning: color --color-warning,         background --color-warning-bg
Inactive / Error:  color --color-error,           background --color-error-bg
Draft / Neutral:   color --color-text-secondary,  background --color-surface-offset
Info:              color --color-info,            background --color-info-bg

### Modals & Sidesheets
Modal:
  max-width:      560px (default), 720px (large), 900px (extra large)
  background:     --color-surface-2
  border-radius:  --radius-xl
  shadow:         --shadow-lg
  padding:        24px
  Backdrop:       rgba(0,0,0,0.40) with blur(2px)
  Header:         --text-xl, --weight-semibold + close X button (top right)
  Footer:         sticky bottom, flex row, gap 8px, border-top --color-divider

Sidesheet (for record detail in HRMS / Inventory):
  width:          480px (default), 640px (wide)
  position:       fixed right, height 100vh
  background:     --color-surface-2
  shadow:         --shadow-lg (leftward)
  Entry animation: translateX(100%) → translateX(0), 220ms ease-out

### Toast Notifications
position:         fixed, bottom-right
width:            320px
background:       --color-text (dark surface for contrast)
color:            --color-text-inverse
radius:           --radius-lg
padding:          12px 16px
shadow:           --shadow-lg
font:             --text-sm
Duration:         4000ms auto-dismiss (errors stay until dismissed)
Stacking:         up to 3 toasts, gap 8px

---

## 8. MODULE-SPECIFIC GUIDELINES

### HRMS
- Employee list: data table with avatar (28px circle) + name as first column
- Avatar: initials fallback, background --color-primary-subtle
- Employee detail: sidesheet, NOT full-page navigation
- Attendance grid: 7-column calendar heat-map
    Present:  background --color-success-bg, text --color-success
    Absent:   background --color-error-bg,   text --color-error
    Leave:    background --color-warning-bg, text --color-warning
    Weekend:  background --color-surface-offset
- Leave balance: horizontal progress bars, muted --color-primary fill
- Payroll numbers: always tabular-nums, right-aligned

### POS (Point of Sale)
- Layout: 2-column split — left product grid (65%), right order/cart (35%)
- Product grid: 4-column card grid
    Card size: 120px × 140px, centered image + name + price below
    All tappable areas: min 44px × 44px touch target
- Cart rows: compact, 40px row height, inline quantity stepper
- Total area: sticky bottom of cart panel
    Grand total: --text-2xl, --weight-bold
    Checkout button: full-width, 48px height, --color-primary
- Cash input numpad: 3×4 grid, 56px × 56px keys, --radius-md
- Receipt: 340px narrow column, print-friendly (white background forced)
- Category chips: muted palette, no bright colors

### Inventory Management
- Stock level indicators — horizontal bar inside table cells:
    In stock  (> 50%):   fill --color-success
    Low stock (10–50%):  fill --color-warning
    Critical  (< 10%):   fill --color-error
    Out of stock:         fill --color-surface-offset (empty bar)
- Warehouse location tree: left panel, collapsible
    Row height: 32px, chevron 16px, active: --color-primary-subtle
- Movement log: chronological table
    Incoming rows: very subtle --color-success-bg row tint
    Outgoing rows: very subtle --color-error-bg row tint
- SKU / barcode: --font-mono, --text-sm, --color-text-secondary

---

## 9. LAYOUT SYSTEM

App Shell:
  [Fixed Sidebar 240px] + [Main Area: flex-1]
    Main Area → [Sticky Top Bar 56px] + [Scrollable Content]

Content padding:   24px all sides (desktop)
Content max-width: full width for tables, 1200px for forms and detail views

Dashboard grid:
  2-col KPI row:     repeat(2, 1fr), gap 16px
  3-col stat row:    repeat(3, 1fr), gap 16px
  4-col tile row:    repeat(4, 1fr), gap 16px
  Full-width table:  span all columns

Responsive breakpoints:
  < 768px:    sidebar collapses to bottom tab bar (5 tabs max)
  768–1024px: sidebar collapses to icon-only (60px)
  > 1024px:   sidebar fully expanded (240px)

---

## 10. MOTION & TRANSITIONS

ERP apps must feel immediate. Animations must never block interaction.

--transition-fast:   100ms ease
--transition-base:   160ms ease
--transition-panel:  220ms ease-out
--transition-modal:  240ms cubic-bezier(0.16, 1, 0.3, 1)

Rules:
- Table row hover: color transition only, no entrance animations on data rows
- Modals: fade + scale(0.97 → 1.00) on enter
- Sidesheets: translateX slide-in from right
- Toasts: slide up from bottom-right
- Page transitions: fade only (opacity 0 → 1, 120ms)
- NEVER animate layout shifts or column reflow
- prefers-reduced-motion: set all transitions to instant (0ms)

---

## 11. ICONOGRAPHY

Use Lucide Icons (https://lucide.dev) exclusively.

Default size:    16px (tables, labels), 18px (buttons), 20px (nav)
Stroke width:    1.5px
Color:           inherit from parent text color
Icon-only buttons: always include aria-label + tooltip on hover

---

## 12. ACCESSIBILITY

- Minimum contrast: 4.5:1 for all body text (WCAG AA)
- Keyboard nav: full Tab/Shift+Tab through all interactive elements
- Focus ring: --shadow-focus (3px blue ring, no outline replacement)
- Table rows: arrow key navigation supported
- Form errors: announced via aria-live="polite"
- Sidebar: aria-label="Main navigation"
- Modal: focus trapped inside, Escape key closes
- Color is NEVER the only status indicator — always pair with text or icon

---

## 13. DO NOT

- DO NOT use purple, teal, pink, or any non-slate accent color.
- DO NOT use gradient backgrounds, gradient buttons, or glow effects.
- DO NOT add shadow to every card — flat + border for most table rows.
- DO NOT use colored left-border on cards (callout anti-pattern).
- DO NOT center-align table data except for status badges.
- DO NOT use icons inside colored circle backgrounds.
- DO NOT use font sizes below 12px anywhere.
- DO NOT use animation durations above 300ms in any data-heavy view.
- DO NOT use fully saturated red/green for status — use the muted palette
  defined in Section 2 only.
- DO NOT use localStorage or sessionStorage (use in-memory state only).
- DO NOT use pure white (#FFFFFF) as the page background — use --color-bg.