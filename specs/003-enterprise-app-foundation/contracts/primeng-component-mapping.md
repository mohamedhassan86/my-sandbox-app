# PrimeNG Component Mapping — Enterprise Application Foundation

Normative companion to `spec.md` for the enterprise application product area.
Covers requested deliverable **10 (PrimeNG Component Mapping)**: every part in the
component inventory (`component-inventory.md`) is mapped to a PrimeNG 22 building
block and to the design tokens it consumes. This document is implementation-level by
design; `spec.md` deliberately stays technology-agnostic.

## Mapping conventions

- **Direct**: the PrimeNG component is used as-is (defaults/theme overridden via the
  design-token layer per §5).
- **Composed**: one inventory part is built from several PrimeNG components plus a
  thin product wrapper that owns layout, state, and keyboard behavior.
- **(custom)**: no direct PrimeNG equivalent; built as a product component using
  tokens and PrimeNG primitives (popover/drawer/listbox/etc.) where useful.

The repository constitution pins the stack (Angular + PrimeNG + PrimeFlex); PrimeFlex
provides the layout grid and utility classes (with spacing values translated from the
8px scale in `design-tokens.md` §3 — the framework's 0.5rem base equals the 8px unit).

---

## §1 Actions & inputs

| Inventory part | PrimeNG | Mode | Notes |
|---|---|---|---|
| Button (primary/secondary/destructive) | `Button` | Direct | severity mapping: primary → brand; destructive → danger; neutral/secondary → outlined/secondary. Icon+label, `loading` state for busy buttons. |
| Split-button ("New ▾") | `SplitButton` | Direct | primary action + overflow of secondary task starts. |
| Icon Button | `Button` (icon only) + `Tooltip` | Composed | aria-label mandatory; ≥32px hit area, 44px on touch. |
| Command Bar | `Toolbar` + `ButtonGroup` + `Menu` (overflow) | Composed | toolbar holds title-level actions; overflow menu receives items that do not fit at the current width. |
| Text Field | `InputText` (+ `IconField`/`InputIcon` for icons, `FloatLabel` optional) | Direct | error state styled from tokens + `Message` beneath (see Inline Message). |
| Text Area | `Textarea` | Direct | vertical resize; optional counter. |
| Search Field | `InputText` in `IconField` + custom clear button | Composed | debounced filtering owned by wrapper; Escape clears. |
| Select | `Select` | Direct | filterable when >10 options. |
| Multi-Select | `MultiSelect` | Direct | selected summary as chips with overflow. |
| Checkbox | `Checkbox` | Direct | tri-state (`binary`/mixed) for parent-row selection. |
| Radio | `RadioButton` | Direct | group semantics; arrow-key movement. |
| Toggle Switch | `ToggleSwitch` | Direct | settings/instant-apply toggles (dark mode, accessibility mode). |
| Toggle Button (labeled) | `ToggleButton` | Direct | labeled binary action where an explicit on/off label helps. |
| Date Range | `DatePicker` (range) + `Select` (preset) | Composed | presets: Today / 7 days / 30 days / Custom. |
| Stepper | `Stepper` | Direct | horizontal on wide, vertical/numbered on narrow (responsive class). |
| Slider | `Slider` (+ `InputNumber` companion) | Direct | numeric range w/ editable value. |
| Upload | `FileUpload` | Direct | per-file progress/error; inline validation messages. |

## §2 Navigation & chrome

| Inventory part | PrimeNG | Mode | Notes |
|---|---|---|---|
| App Shell | — (layout) | Composed | PrimeFlex grid for regions; custom shell component owns header/nav/content slots and focus management. |
| Side Navigation (expanded / rail / drawer) | `Drawer` (narrow mode) + `Badge` | Composed | nav items are custom anchors (not menu widgets) for correct landmarks + focus; current-area indicator not color-only. |
| Breadcrumbs | `Breadcrumb` | Direct | home item + section items; last crumb unlinked; overflow handled by component. |
| Tabs | `Tabs` (`TabList`/`Tab`/`TabPanel`) | Direct | responsive: scrollable tab list on narrow widths. |
| Accordion | `Accordion` | Direct | progressive disclosure; active/disabled states from tokens. |
| Header Quick Controls | `Button` (icon) + `Badge` + `Tooltip` | Composed | fixed order: search · notifications · help · profile. |
| User Profile Menu | `Menu` + `Avatar` | Composed | identity block top; items: appearance, accessibility, shortcut map, reset demo data. |
| Pagination | `Paginator` | Direct | keeps filter/search/sort context; rows-per-page choice persisted per view. |

## §3 Feedback & status

| Inventory part | PrimeNG | Mode | Notes |
|---|---|---|---|
| Toast | `Toast` | Direct | severity → success/error/info/warn; single service; auto-dismiss success only; polite announcements. |
| Inline Message / Validation | `Message` | Direct | rendered adjacent to control on error/help; tied via description/id wiring; clears on valid. |
| Banner | `Message` (inline, larger) | Direct | page-level conditions above content. |
| Badge / Count | `Badge` | Direct | numeric with accessible label; overlay on bell icon. |
| Status Pill / Tag | `Tag` (+ icons) | Direct | severity mapping to status tokens; icon+text so color is not the only cue. |
| Skeleton | `Skeleton` | Direct | shapes mirror final layout (rows/cards/avatar/chart); no shimmer animation. |
| Progress | `ProgressBar` / `ProgressSpinner` | Direct | determinate for bulk ops; labeled for accessibility. |
| Empty State | — (custom) | custom | glyph (icon set) + headline + explanation + next action; tokenized. |
| Error State / Not Found | — (custom) | custom | region vs page variants; Retry + back path. |
| Confirm Dialog | `ConfirmDialog` (+ `ConfirmPopup`) | Direct | cancel-focused by default; destructive styling when destructive; typed confirm for demo reset. |

## §4 Content & data

| Inventory part | PrimeNG | Mode | Notes |
|---|---|---|---|
| Table / Data Grid | `Table` + `Column` | Direct | sortable columns, `selectionMode="multiple"`, `paginator`, `columnResizeMode`, density via row class; sticky header within region. |
| — collection search | `InputText` + `IconField` | Composed | filters the dataset (server/demo-service side), distinct from global search. |
| — advanced filter builder | `Select`/`MultiSelect`/`DatePicker`/`InputNumber` in a filter panel | Composed | produces removable filter chips; combined with search by intersection. |
| — column personalization | custom panel over `Popover` + `Checkbox` + `OrderList` (reorder) | Composed | show/hide, reorder, density; live apply; reset. |
| — export | `Table` `exportCSV` or custom CSV writer | Direct | exports the current filtered/sorted result (page or all per user choice). |
| — bulk actions | custom bulk bar over `Toolbar`/`ButtonGroup` + `Checkbox` (row select) | Composed | count display, destructive confirm, progress, per-item failure reporting. |
| Saved Views Bar | custom chip row (`Chip` optional) + `Menu` | Composed | save/save-as/rename/delete; persistence via demo-state service. |
| Card | `Card` | Direct | headers/footers per template; hover affordance only when actionable. |
| List Row (activity/notifications) | `ListBox` (item template) or custom list | Composed | unread styling + row actions on hover/focus. |
| Avatar / Group | `Avatar` / `AvatarGroup` | Direct | persona sizes/initials. |
| Persona/Entity Label | `Chip` | Direct | owner/assignee chips. |
| Detail Section | `Fieldset` or custom dl | Composed | label/value pairs; long-text expand. |
| Timeline (record history) | `Timeline` | Direct | compact alignment on narrow screens. |
| Chart (dashboard) | `Chart` | Direct | every chart ships a skeleton, empty, and error state + data-table alternative for screen readers. |

## §5 Guidance, help, and overlays

| Inventory part | PrimeNG | Mode | Notes |
|---|---|---|---|
| Tooltip | `Tooltip` | Direct | hover + keyboard focus; short phrase; supplementary only. |
| Contextual Help | `Popover` anchored to help trigger | Composed | 1–2 sentence explanation + link to Help index. |
| Onboarding Tour | custom coach overlay (+ `Card`, focus scrim) | custom | non-blocking; Skip/Back/Next/Done; reduced-motion safe; completion stored. |
| Shortcut Map | `Table` (static) or list | Composed | grouped global/context; live-tested keys. |
| Notification Center | `Drawer` (panel) + custom list + `Badge` | Composed | filters All/Unread; row actions; deep links; empty state. |
| Global Search / Command Palette | `InputText` + `ListBox` (grouped) inside `Popover` | Composed | Ctrl/Cmd+K binding via custom global shortcut service; grouped results incl. action results; Escape closes; arrows navigate. |
| Dialogs/Drawers | `Dialog` / `Drawer` | Direct | block modal for decisions; drawer for panels (notifications, filters on mobile). |
| Image/rich content | `Image` if needed | Direct | — |

## §6 Theming & token wiring rules

1. **Single source**: all visual properties come from the semantic tokens in
   `design-tokens.md`; PrimeNG component styles are overridden **only** through the
   theme's exposed per-component design variables (CSS custom properties on the
   installed base theme) or, where a property is not exposed, through product-owned
   style modules that reference the same tokens. Hard-coded colors/radii in
   application styles are prohibited (spec FR-002).
2. **Mode switching**: light, dark, and accessibility-mode are three semantic-token
   sets applied by toggling a theme class on the document root (e.g., `app-dark`,
   `app-a11y`). The base PrimeNG theme is loaded once; token-set classes override it.
3. **Radius/typography/space mapping**: each component's control radius is pinned to
   the 8px-class tokens (`radius-sm/md/lg`); typography tokens set component font
   properties; PrimeFlex spacing utilities are used at values that equal the 8px
   scale (0.5rem = 8px), with product tokens used beyond utility reach.
4. **Motion**: PrimeNG's built-in transition durations are overridden to the motion
   tokens; under reduced motion / accessibility mode durations collapse to ~0 and
   ripple/parallax effects are disabled.
5. **Accessibility wiring**: every mapped component gets the product-level a11y
   additions — visible focus ring tokens, `aria-describedby`/`aria-invalid` wiring
   for validation, polite `aria-live` regions for toasts and async region updates,
   and landmark/labeling hygiene — because theme alone cannot deliver WCAG 2.2 AA.
6. **Verification**: the mode-swap test (spec FR-003/SC-009) and the contrast-pair
   checks (`design-tokens.md` §13) run against every mapped component on every
   template before a component is considered themed.
