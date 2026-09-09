# Component Inventory — Enterprise Application Foundation

Normative companion to `spec.md`. Covers requested deliverable **5 (Component
Inventory)**: the catalog of reusable UI parts the product is built from, the
standardized states each part must support, and composition rules that guarantee
consistent empty/loading/error/success behavior everywhere.

Part names are product-level (framework-neutral); each part's implementation mapping
is in `primeng-component-mapping.md`. Parts marked *(custom)* are product-specific
compositions defined in this design system rather than off-the-shelf controls.

---

## §1 State glossary

The following states apply across the inventory wherever relevant:

| State | Meaning | Visual rules |
|---|---|---|
| default | Resting | token surface/border/text |
| hover | Pointer over interactive part | subtle surface/border change, never layout shift |
| focus / focus-visible | Keyboard focus | 2px ring (focus-ring token, ≥3:1), never removed |
| active / pressed | Mid-interaction | pressed token |
| selected / checked / current | On-state | brand fill or tint + icon/ring; never color-only |
| disabled | Unavailable | disabled fill + text tokens; still legible; no hover |
| loading | Work in progress | skeleton of final shape or small inline spinner |
| error | Invalid/failed | error border + inline message; message tied to control |
| success | Valid/completed | success cue (border/icon/message) where appropriate |
| empty | Nothing to show | smart empty state (reason + action) |

---

## §2 Catalog

### A. Actions & inputs

| Part | Variants / types | Notable states & notes |
|---|---|---|
| Button | primary / secondary / neutral / ghost / destructive; icon, icon+label, split | hover/focus/active/pressed; loading (inline spinner disables); disabled. Destructive only for irreversible actions. |
| Icon Button | compact square button | ≥32px hit area (44 touch); tooltip label; aria-label always. |
| Command Bar | grouped primary + overflow | actions collapse into overflow menu on narrow widths; focus moves predictably; "More" menu non-modal. |
| Text Field | single-line; with prefix/suffix icon | default/hover/focus/error/disabled; character counter optional; clear button pattern. |
| Text Area | multiline, resize vertical | auto-height optional; counter when limited. |
| Search Field | standalone collection search | same as text field + Escape clears; live filtering debounced. |
| Select | single choice from options | button-style trigger + listbox popover; filterable when >10 options; selected shown on trigger. |
| Multi-Select | multiple choices; removable chips | chip summary overflow ("+3"); clear-all affordance. |
| Checkbox | binary | indeterminate state for tri-state (parent rows); mixed state labeled. |
| Radio | exclusive choice | grouped, keyboard arrows. |
| Toggle Switch | on/off | instant apply; label states On/Off; used for settings. |
| Date Range | two-date selector | preset ranges (Today, 7d, 30d, custom) as smart defaults. |
| Stepper | horizontal / vertical (narrow) | numbered steps; current/complete/error(optional)/disabled-future states; revisit allowed. |
| Slider | numeric range | optional numeric input companion. |
| Upload | file drop + picker | progress per file; error per file; validation messages inline. |

### B. Navigation & chrome

| Part | Notes |
|---|---|
| App Shell *(custom)* | header + nav + content regions; templates T1 (§4 of `ux-architecture.md`). |
| Side Navigation *(custom)* | areas + Favorites group; expanded/rail/drawer states; current-area indicator. |
| Nav Item / Rail Item | icon+label; badge optional (counts); tooltip in rail state; active state not color-only. |
| Breadcrumbs | hierarchical trail; truncation with overflow; current page unlinked. |
| Tabs | page facets; scrollable/overflow on narrow; keyboard arrows; selected not color-only. |
| Accordion | progressive disclosure of detail sections; one-or-many open configurable per usage. |
| Header Quick Controls *(custom)* | search trigger, notifications bell w/ badge, profile avatar — consistent order. |
| User Profile Menu *(custom)* | identity block + settings entries + reset demo data. |
| Pagination | pager + per-page choice + result summary; respects filter context. |

### C. Feedback & status

| Part | Notes |
|---|---|
| Toast | success/error/info/warning; one region; auto-dismiss success only; polite live region; close affordance. |
| Inline Message / Validation | tied to control (error/help/success variants); icon+text; announced politely. |
| Banner | page-level conditions (offline demo, data reset available) — dismissible, above content. |
| Badge / Count | unread counts; numeric, aria-label includes the meaning ("3 unread notifications"). |
| Status Pill / Tag | status with icon + text + fill (never color-only); dot variants only with text. |
| Skeleton | mirrors final layout: rows, cells, cards, avatar, chart bars; shimmer-free (static, reduced-motion safe). |
| Progress Bar / Spinner | determinate for bulk ops, indeterminate inline for small loads; labeled. |
| Empty State *(custom)* | glyph/icon + headline + explanation + next action; variants: no-data, no-results, no-favorites, no-notifications, no-activity. |
| Error State *(custom)* | headline + reason + Retry/Back; page-level vs region-level variants. |
| Not Found *(custom)* | 404 with path home. |
| Confirm Dialog | non-destructive default focus on Cancel; destructive styling when destructive; supports typed confirm for reset. |

### D. Content & data

| Part | Notes |
|---|---|
| Table / Data Grid *(composed)* | toolbar parts (search/filter/view/personalize/export/bulk) + sortable headers + selection + pagination + density. Advanced-filter builder *(custom)*. |
| Saved Views Bar *(custom)* | view selector chips + save/save-as/rename/delete; active view highlighted. |
| Bulk Actions Bar *(custom)* | appears with selection; count + actions + clear; confirm for destructive; progress during run. |
| Column Personalization *(custom)* | show/hide/reorder/density via popover panel; live apply; reset to default. |
| Card | summary containers; title/body/actions; optional footer; hover affordance when actionable. |
| List Row | activity/notification rows: icon, title, metadata, actions on hover/focus; unread affordance. |
| Avatar | persona (initials/photo); sizes; group avatars. |
| Persona/Entity Label | record owner/assignee chip w/ avatar+name. |
| Detail Section | label/value pairs; long text truncation with expand. |
| Timeline | activity history on records (compact). |
| Chart (visual) | status distribution/trends on dashboard; skeleton + empty + error states required; accessible data table alternative. |

### E. Guidance & help

| Part | Notes |
|---|---|
| Tooltip | hover/focus; keyboard-open; short phrase; never sole source of critical info. |
| Contextual Help *(custom)* | inline question affordance per area/control; opens anchored popover with 1–2 sentence explanation + link. |
| Onboarding Tour *(custom)* | non-blocking coach overlay: steps with target highlight + copy + Skip/Next/Back/Done; respects reduced motion. |
| Shortcut Map *(custom)* | searchable table of shortcuts grouped global/context; each entry live-testable. |
| Help Content Page *(custom)* | replay tour, help index, shortcuts. |

---

## §3 Composition rules

1. **Empty is a state of the part, not a page**: lists, tables, notification center,
   favorites, activity, search results, and charts each define their empty variant and
   it renders in place of content (spec FR-040).
2. **Loading is shaped**: every async part shows a skeleton of its own final layout;
   never a generic spinner for a content region (spec FR-039).
3. **Errors own their region**: region-level errors render inside the region with
   Retry; page-level errors render once, not per nested part.
4. **Success is proportional**: micro-successes (a toggle flipping, text becoming
   valid) need no toast; action-level successes (save/export/bulk/submit) get a toast;
   page-level completions (task done) get a success screen (spec FR-034/FR-038).
5. **One canonical part per need**: teams extend the inventory (new part + mapping +
   token usage) instead of ad hoc controls; visual drift between pages is a defect
   (spec FR-002, UX §7.6).
6. **Parts are standalone and composable** — a part is usable on any template without
   importing page-specific context; its behaviors (a11y, states, tokens) travel with it.
