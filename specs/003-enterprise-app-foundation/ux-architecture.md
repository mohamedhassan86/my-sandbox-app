# Enterprise Application Foundation — UX Architecture

Normative companion to `spec.md` for the enterprise application product area.
Covers requested deliverables 1–3 and 6–9:
§1 UX Architecture · §2 Information Architecture · §3 User Journeys ·
§4 Page Templates · §5 Responsive Strategy · §6 Accessibility Strategy ·
§7 Interaction Guidelines.

Working product-area name used throughout: **the app**. Demo domain content is a
standalone, swappable slice (see §2.5).

---

## §1 UX Architecture

### 1.1 Design intent

The app is a calm, focused work surface. Every design decision serves four goals from
the brief: minimize cognitive load, minimize clicks to completion, keep journeys
consistent, and feel friendly. The Fluent 2 inspired visual system (see
`contracts/design-tokens.md`) provides neutral calm backgrounds, one accent color used
deliberately, rounded 8–12px geometry, and soft elevation so content — not chrome —
dominates.

### 1.2 Experience layers

The product is organized as four experience layers:

1. **Shell (persistent chrome)** — top header, collapsible side navigation, breadcrumbs,
   global search entry, notification entry, profile entry. Always present, never
   scrolls away, never competes with content.
2. **Home (command center)** — the dashboard: quick actions, recent activity, favorites.
   The default landing surface and the "reset point" users return to.
3. **Work surfaces (pages)** — data collections with full management tooling, record
   detail, and guided tasks (stepper workflows). This is where real work happens.
4. **Guidance & system layers (overlays)** — global search, notification center,
   contextual help, onboarding tour, dialog/drawer confirmations, toasts, skeleton and
   state surfaces. Layered above content, dismissible, never modal unless a decision is
   truly blocking.

### 1.3 Concept model (user mental model)

- **Areas** are the top-level destinations in the navigation ("Home", "Surveys",
  "Responses", "Participants", "Help"). Areas contain **pages**.
- **Records** are individual data items inside a collection. **Saved views** are named
  arrangements of a collection. Both can be **favorited**.
- **Tasks** are guided multi-step activities with a beginning, middle, and success end
  ("Launch a survey"). They auto-save as **drafts**.
- **Notifications** are messages about things that changed; they deep-link to the thing
  that changed.
- The **profile menu** is where the user controls their environment (appearance,
  accessibility, shortcuts, demo data).

The vocabulary above is used consistently in UI copy and help so the user only ever
learns one set of words.

### 1.4 Navigation model

- **Primary navigation**: side navigation of areas, with a Favorites group pinned near
  the top for starred items. Collapses to an icon rail on wide screens and to a drawer
  on narrow screens.
- **Secondary navigation**: breadcrumbs on every non-home page; tabs within a page where
  a page has several facets.
- **Global navigation**: search + keyboard shortcut map + notification deep links. Any
  destination is reachable by (a) navigating, (b) searching, or (c) a shortcut — three
  consistent, always-available paths.
- **Wayfinding state**: the current area is always highlighted; the header title and
  breadcrumbs agree with the navigation highlight so the user always knows where they
  are.

### 1.5 Feedback model

One feedback vocabulary everywhere (see §7.1): skeletons for loading, inline messages
for field problems, toasts for action outcomes, inline status/banners for page-level
conditions, smart empty states for absence, error states with retry for failures.

### 1.6 Product-area boundary

This app is a standalone product area in the repository. It does not share chrome,
visual language, or data with the survey viewer. Its demo data, tokens, and pages are
self-contained so the area can be reviewed, deployed, and extended independently.

---

## §2 Information Architecture

### 2.1 Top-level structure (demo slice)

```
Home (Dashboard)
├─ Quick actions
├─ Recent activity
└─ Favorites

Surveys                   ← data collection (survey definitions & launches)
├─ All surveys (saved-view selector)
├─ Survey detail
└─ Launch a survey (guided task)  ← quick action target

Responses                 ← second data collection (different columns/density demo)
└─ Response detail

Participants              ← third data collection (respondent records)
└─ Participant detail

Help
├─ Guided tour (replay)
├─ Contextual help index
└─ Keyboard shortcut map
```

Global (available everywhere, not in the area list):
- Header: global search, notification center, profile menu (appearance,
  accessibility, shortcut map, reset demo data).
- Favorites group at the top of the side navigation.

Three collections (Surveys, Responses, Participants) prove the data-management pattern works
across different schemas and column sets (survey definitions vs. response rows vs. respondent
profiles). This survey-operations domain is a demo slice chosen for coherence with the
repository: it is fixture-driven, independent of the survey viewer's implementation, and
replacing its fixtures does not require application-code changes (spec FR-045, FR-048).

### 2.2 Grouping and naming rules

- Area names are verbs or nouns users already use ("Surveys", "Responses"), never
  internal or technical terms.
- Page titles start from the object or action ("All surveys", "Launch a survey").
- Navigation labels and page titles are identical (no label/title drift).
- Destructive or rare actions never appear as top-level navigation.

### 2.3 Hierarchy and breadcrumb logic

Breadcrumbs appear on every page below Home and reflect the real hierarchy:
`Area / Page` or `Area / Collection / Record`. The current page is the last, non-linked
crumb. Breadcrumbs are suppressed on Home and inside overlays.

### 2.4 Favorites placement

Favorites of any type (records, saved views, pages) appear in one group in the side
navigation and on the dashboard. Single source of state; two renderings (spec FR-015).

### 2.5 Demo data map

Fixtures: three survey-operations record collections (Surveys, Responses, Participants)
with varied field types (text, numeric, select, date, status, owner, response score),
a notification stream, quick actions, activity feed, tour/help content, and the
"Launch a survey" guided-task definition. All loaded through the simulated service
layer; reset restores them and clears on-device state (spec FR-045–FR-047).

---

## §3 User Journeys

Journeys are written as goal-first flows; each has a success signal usable for testing.

### 3.1 First-run onboarding (new user)

1. Fresh demo state → lands on Home → non-blocking welcome tour overlay.
2. Tour (≤4 steps): shell orientation → where to search → the primary task → where to
   find help/settings. Step through, or dismiss ("Skip tour").
3. If skipped/dismissed: no re-prompt this session; replay from Help.
   **Success**: user can state where each of the four main things is, and completes the
   primary task with no further help.

### 3.2 Daily start (returning user)

1. Open app → Home dashboard loads with skeleton, then quick actions, recents,
   favorites.
2. Launch a quick action, or click a recent/favorite item.
3. On phone, open the nav drawer to reach other areas.
   **Success**: ≤2 clicks from launch to a real working surface.

### 3.3 Find something fast (global search)

1. Press the global shortcut or click search.
2. Type ≥2 characters → grouped results (areas/pages, records, saved views, actions).
3. Arrow + Enter (or click) → overlay closes and target opens.
4. No matches → smart empty state with suggestion/browse path.
   **Success**: search → target in ≤3 keyboard actions.

### 3.4 Find, shape, and act on data

1. Open Surveys → toolbar: search, filters, sortable columns.
2. Filter + search + sort → chips show active filters; count updates.
3. Personalize columns/density → arrangement applies immediately.
4. Save as named view → later reopen restores exactly.
5. Select rows → bulk bar → (destructive bulk actions require confirmation) → toast.
6. Export current view → success/failure toast (retry on failure).
   **Success**: saved view reopens identically; export matches the visible filtered
   result set.

### 3.5 Complete a guided task, resume later

1. "Launch a survey" from quick action → stepper with steps.
2. Smart defaults pre-fill; invalid input → inline message; fix → message clears.
3. Leave mid-way / refresh → draft saved; return → resume prompt restores values and
   step.
4. Finish → success screen + toast; double submission prevented.
   **Success**: full task done first-try with zero field loss across a refresh.

### 3.6 Stay informed (notifications)

1. Simulated event → unread badge increments live.
2. Open notification center → newest-first, unread distinct; read/clear actions.
3. Activate a notification → deep link opens target and marks read.
   **Success**: after triage the badge reflects exactly the remaining unread items.

### 3.7 Make the app yours (personalization & accessibility)

1. Profile menu → switch dark mode / accessibility mode; persists.
2. Reorder/reshape a collection; favorite a record and a saved view.
3. Open shortcut map and rehearse the three most useful shortcuts.
   **Success**: settings persist across restart; favorites visible in both places;
   every mapped shortcut works.

---

## §4 Page Templates

A template defines zones, not final content. Every template below is responsive
(§5) and uses the tokens and components from the contracts.

### T1. App shell (applied to every page)

- Header (sticky): product mark · global search trigger · notification bell (badge) ·
  profile menu. Height per design tokens (48px-class); neutral surface; hairline border.
- Side navigation: Favorites group, Areas group, collapse control. Rail state on
  wide screens; drawer + backdrop on narrow screens.
- Content region: breadcrumbs (when below Home) → page heading → command bar → page
  body. Consistent left gutter rhythm.

### T2. Home / Dashboard

- Welcome heading (time-aware greeting + demo user name) and, in the header row, the
  area command bar (e.g., "Launch a survey").
- Quick actions: prominent card row/grid (icon + label), 4–6 actions.
- Two-column content on wide screens: Recent activity | Favorites; single column on
  narrow screens. Each section has a smart empty state and a "view all" when long.

### T3. Data collection (work-surface template)

- Heading row: title + count + command bar (View selector | Personalize | Export |
  Bulk actions when selection exists).
- Toolbar: collection search field, filter button with applied-filter chips inline
  below, density control inside Personalize.
- Table body: sortable column headers, row checkboxes, status/severity badges, row
  actions on hover/overflow; selection bulk bar slides in above the table.
- Footer: pagination (or virtualization note) + result summary.
- States: skeleton rows → populated / smart-empty / error-with-retry.

### T4. Record detail

- Breadcrumb `Area / Collection / Record`; heading with record title + status;
  command bar (Edit, Duplicate, More).
- Body: summary cards → detail sections using progressive disclosure (tabs or
  accordion) rather than one overwhelming wall.
- Related context (activity/history) as a side column on wide screens, below on narrow.

### T5. Guided task (stepper workflow)

- Stepper header with numbered steps, current/complete states, and task title.
- Step content: grouped fields with smart defaults; inline validation below fields.
- Footer action bar: Back (when not first), Continue/Submit (primary, right),
  plus a persistent "Draft saved just now" indicator when edits exist.
- Terminal states: success screen (what happened, what's next) and a resume-draft
  prompt when re-entering an in-progress task.

### T6. Notification center

- Panel/page listing notifications newest-first: unread dot + tinted row, category
  icon, title, body, time. Filters (All / Unread / by category when volume grows).
- Row actions: mark read/unread, clear. "Mark all as read" and "Clear all" with
  confirmation for the bulk clear.
- Smart empty state: "You're all caught up."

### T7. Search overlay

- Centered overlay: search field (focused), grouped result list (icon, title,
  location; action results labeled as commands), footer hint bar listing keys
  (↑↓ navigate · ↵ open · esc close). Smart empty state for no matches.

### T8. Profile & settings

- Sections: Appearance (light / dark / system, accessibility mode), Table defaults
  (density), Shortcuts (open map), Demo data (reset with confirmation), About.
- Changes apply immediately and persist on-device.

### T9. System states & help pages

- **Empty**: illustration-free calm glyph + headline + explanation + next action.
- **Error (page/region)**: what failed, why it matters, Retry / Back.
- **Not found**: friendly 404 with path back to a known area.
- **Help**: tour replay, contextual-help index grouped by area, shortcut map.

---

## §5 Responsive Strategy

Mobile-first: the shell and every template are designed from the narrow canvas up,
then enriched for wide screens. Breakpoints follow the token scale
(small ≤640px, medium 641–1023px, wide ≥1024px).

| Template | Narrow (≤640) | Medium | Wide (≥1024) |
|---|---|---|---|
| Shell | Nav = drawer + backdrop; header condenses (search → icon → full overlay) | Rail or drawer toggle | Expanded nav ↔ rail toggle |
| Dashboard | Single column, stacked sections | Two-column at 768+ | Quick actions grid + two-column content |
| Data collection | Table → horizontally scrollable within viewport OR card-list toggle; bulk bar full width; command bar collapses to overflow menu | Table with condensed columns | Full personalizable table + side filter drawer option |
| Guided task | Stepper labels collapse to numbers; action bar stacks if needed | Horizontal stepper | Horizontal stepper |
| Detail | Sections stack; side context below | Side context column | Full layout |

Rules:

- **Content reflow**: at 320px CSS width, no core journey requires horizontal
  scrolling or loses its primary action (WCAG 2.2 reflow; spec SC-004). Tables are the
  one sanctioned exception container (scroll within the table region, never the page).
- **Touch**: primary targets ≥44×44px on touch devices; all targets ≥24×24 CSS px
  (WCAG 2.2 AA minimum target size); adequate spacing between adjacent targets.
- **Header**: global controls collapse by priority — the most-used (search, profile)
  remain one tap away; full control labels appear at medium+.
- **Command bars** overflow into a "More" menu rather than wrapping to a second row.
- **Chrome on scroll**: header stays sticky; content never hides under it.
- **Landscape/tablet and split-screen**: widths between breakpoints never clip; grid
  uses the token spacing rhythm and fluid columns.

---

## §6 Accessibility Strategy

Baseline target: **WCAG 2.2 AA** everywhere (spec FR-049, SC-003), verified with
automated checks plus keyboard and screen-reader passes on every template. The
in-product **accessibility mode** (spec FR-004) is an extra layer, not the baseline.

### 6.1 Semantics and structure

- Landmarks: header (banner), nav, main, complementary (context columns), contentinfo.
- One `h1` per page (page title), logical heading order; section headings mirror the
  IA so screen-reader users get the same map as sighted users.
- Buttons/links are real buttons/links; icons have accessible names; decorative
  content is hidden from the accessibility tree.

### 6.2 Keyboard and focus

- Everything operable by keyboard with a **visible focus indicator** at all times
  (2px ring, token-defined, ≥3:1 against adjacent color; spec FR-004).
- Logical tab order matches visual order; skip link jumps to main content.
- Composite widgets (search overlay, drawer nav, table, stepper, menus, notification
  center) follow the applicable interaction patterns: arrow-key movement, Escape
  closes overlays/drawers/menus and returns focus to the trigger.
- Focus is managed on route change (focus the new page heading) and when overlays
  open/close — never trapped, never lost to the background.

### 6.3 Labels, errors, and live regions

- Every input has a visible label or clear accessible name; help text is associated
  with its field.
- Inline validation: message programmatically tied to the field
  (`aria-describedby`) and announced via a polite live region; the field is marked
  invalid and re-validates on correction.
- Toasts, bulk-action outcomes, loading→loaded transitions of dynamic regions, and
  notification-count changes are announced politely; blocking errors use assertive
  roles sparingly.
- Status/severity is never conveyed by color alone (icon/text/badge label always
  accompany color; tokens pair status text colors that meet contrast).

### 6.4 Contrast, resize, and motion

- Text and UI components meet 4.5:1 / 3:1 contrast in light and dark token sets
  (documented pairs in `contracts/design-tokens.md`).
- The UI remains usable at 200% zoom and 320px reflow (§5).
- `prefers-reduced-motion` is honored (transitions collapse to opacity/instant);
  accessibility mode also minimizes motion in-app regardless of OS setting.

### 6.5 Accessibility mode (in-product)

One toggle in Settings/profile that guarantees: focus indicators always rendered,
motion minimized, touch/click targets at their largest token, maximum-contrast tokens,
and no purely decorative animation. Independent of dark mode; combinable with it.

### 6.6 Verification gates

Each page template ships with an automated a11y check (0 critical/serious) and a
manual keyboard walkthrough; journeys in §3 are exercised with a screen reader before
a feature is considered done.

---

## §7 Interaction Guidelines

### 7.1 Feedback vocabulary (use the right layer)

| Situation | Pattern | Notes |
|---|---|---|
| Field problem | Inline message beside field | Real-time after first blur; clears on fix |
| Action succeeded | Success toast | Auto-dismisses; polite announcement |
| Action failed | Error toast (persists) or inline region w/ retry | Never silent |
| Page/region loading | Skeleton of final layout | Never blank; no full-page spinners inline |
| No data / no results / nothing new | Smart empty state | Reason + next action, always |
| Region load failure | Error state + Retry | Retry reuses same request path |
| Destructive/irreversible | Confirm dialog (or typed confirm for demo-data reset) | Primary button restyled destructive |
| Long-running bulk work | Progress bar/bulk bar until done | Disable re-trigger; report per-item failures |

### 7.2 Progressive disclosure

- Complex information is chunked: stepper steps for tasks, tabs/accordion for detail
  facets, "Show more/All" for long lists, inline expanders for optional settings.
- Defaults are smart (spec FR-032): the happy path is one click; hiding advanced
  options never hides required ones.

### 7.3 Confirmations and error prevention

- Confirm only irreversible or high-cost actions; prefer undo-able designs (drafts,
  view deletion is confirmable, filters always clearable).
- Prevent double submission; disable clearly-invalid primary actions with an inline
  explanation of what is missing; never disable without explanation.
- Destructive bulk actions: confirm dialog states scope ("Archive 12 surveys?").

### 7.4 Motion and density

- Motion is short (150–250ms, tokenized easing), purposeful (explains change of state,
  not decoration). All motion disabled under reduced motion / accessibility mode.
- Two density settings (comfortable / compact) apply to tables and dense lists;
  44px touch targets at comfortable density.

### 7.5 Text and tone

- Plain, concrete, friendly-professional. Sentences start with verbs ("Create a
  survey"). Errors say what happened and what to do, never blame the user.
- Buttons state the action ("Save view"), not the outcome ("OK").
- Empty states use the same voice: "No notifications yet — you're all caught up."

### 7.6 Interaction consistency

Every repeated action has one canonical control and behavior (one "add favorite"
pattern everywhere, one overflow-menu pattern, one toast position). New pages reuse
existing parts from the inventory rather than inventing new ones — drift is a defect.

### 7.7 Shortcuts (power users)

Global shortcuts are discoverable via the map (Help → Shortcut map) and honored
everywhere; they never fire while typing in fields (spec FR-044). Suggested set:
search, notifications, help, appearance toggle, accessibility toggle, focus command
bar, jump to Home, next/previous area.
