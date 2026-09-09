# Quickstart: Enterprise Application Foundation

Runnable validation guide for the enterprise product area. Refer to
[data-model.md](data-model.md) and the contracts in
[contracts/](contracts/enterprise-routing.md) for shapes and rules; this file stays a
run/verify guide, not an implementation spec.

## Prerequisites

- Node + pnpm workspace ready (`pnpm install` completed; see repo README).
- A production build currently succeeds (`pnpm exec ng build`).

## 1. Run the app and open the enterprise area

```powershell
pnpm start
```

- Open `http://localhost:4200/` → confirm the **survey viewer still renders unchanged**
  (isolation check, FR-048).
- Open `http://localhost:4200/enterprise` (or `/enterprise/home`) → the enterprise
  shell loads: side navigation (Surveys / Responses / Participants / Help + Favorites
  group), sticky header with search trigger, notification bell, profile menu, and the
  home dashboard with quick actions, recent activity, and favorites (with smart empty
  states on first run).

## 2. Validate shell & modes

- Collapse the side nav to the icon rail and expand again (wide screen); on a narrow
  viewport (<768px) confirm it becomes a drawer with backdrop, opens on tap, closes on
  backdrop tap and Escape (FR-006/FR-007).
- Scroll a long page: header stays sticky; breadcrumbs reflect the current page on
  every non-home route (FR-009).
- Profile menu → switch dark mode, then accessibility mode, then back; confirm the
  whole area restyles immediately, the choice survives a reload (FR-003/FR-004,
  SC-009), and the survey viewer's maroon look is unaffected at `/`.
- Reset demo data (typed confirm) → first-run state returns (FR-047).

## 3. Validate dashboard & guidance

- First run (after reset): welcome onboarding tour appears; step through, then replay
  it from Help → "Guided tour" (FR-041).
- Open contextual help on an area (help trigger beside the heading) → short
  explanation without leaving the page (FR-042).
- Launch a quick action ("Launch a survey") → stepper task opens (FR-012/FR-013).

## 4. Validate data management (Surveys area)

- Watch skeleton rows load, then the table with toolbar (search, filter, sortable
  columns, view selector, personalize, export, bulk) (FR-021, FR-039).
- Combine search + filters → removable chips + result count; sort a column; navigate
  pages and confirm the filter context is preserved (FR-022/FR-023).
- Personalize columns/density → applies immediately and persists (FR-024).
- Save the arrangement as a named view; change columns/filters; reopen the view →
  restores exactly (FR-025).
- Select rows → bulk bar shows the count; trigger a destructive bulk action →
  confirmation states scope (e.g., "Archive 12 surveys?"); completion toast appears;
  reload → fixtures are pristine (read-only, FR-026).
- Export current view (page or all) as CSV → download matches the visible filtered
  result; failure path (armed via the demo failure control) → error toast + retry
  (FR-027).
- Clear filters to zero rows → smart empty state with a "clear filters" action
  (FR-040).

## 5. Validate guided task & drafts (Launch a survey)

- Walk the stepper: step labels, completion marks, revisit allowed; invalid required
  input blocks Next with an inline message tied to the field; fixing it clears the
  message (FR-029–FR-031).
- Confirm smart defaults pre-fill and remain editable (FR-032).
- Enter data, refresh the page, return → "Resume your draft" restores values and the
  last step; no field loss (FR-033/FR-035, SC-006).
- Finish → success screen + toast; double-clicking Submit produces one submission and
  the draft clears (FR-034, edge case).

## 6. Validate search, notifications, shortcuts

- Press `Ctrl/Cmd+K` from any page → search overlay; type ≥2 chars → grouped results;
  keyboard-navigate and open a result; no-match term → smart empty state with
  suggestion/browse path (FR-016–FR-020).
- Notification bell shows an unread badge; wait for the demo scheduler (~45–75 s) or
  trigger a simulated action to see a live notification; open the center, mark
  read/clear, activate a deep link → target opens and badge updates (FR-036/FR-037).
- Help → shortcut map: confirm every listed shortcut works and none fire while typing
  in a field (FR-043/FR-044).
- Visit a bogus enterprise URL (e.g., `/enterprise/nope`) → friendly not-found page.

## 7. Quality gates

```powershell
pnpm exec ng test --watch=false     # or: pnpm exec vitest run
pnpm exec ng build
```

Expected:
- All unit/integration specs pass, including new enterprise specs (models, services:
  fixture/simulation, collections query, notifications, favorites, views, drafts,
  preferences, keyboard guards, search; components: shell/nav/header/table/stepper/
  states; routing; a11y assertions with zero critical/serious violations).
- No import crosses the enterprise ↔ survey-viewer boundary (enforced by review plus a
  boundary spec if practical).
- Production build succeeds (enterprise route area lazy-loads; the survey-viewer
  initial bundle does not regress materially).
- Manual checks: keyboard-only completion of journeys in §3–§6; screen-reader pass;
  320px / 768px / 1024px reflow; 200% zoom; reduced-motion behavior.

## Recorded results

- Filled during `/speckit-implement` verification (build/test outputs, manual check
  results, any deviations).
