# Tasks: Enterprise Application Foundation

**Input**: Design documents from `/specs/003-enterprise-app-foundation/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`ux-architecture.md`

**Tests**: Included because the project constitution requires unit and integration
coverage for every feature and a production build before review (target ≥80% unit-test
coverage for maintained code; automated accessibility assertions with zero
critical/serious violations on page templates per SC-003).

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment. User stories map 1:1 to spec.md stories
in priority order (P1: US1–US3, P2: US4–US7, P3: US8).

## Phase 1: Setup

**Purpose**: Scaffold the enterprise product area and testing tooling. No feature work
begins here beyond structure; the area is not routable until US1.

- [X] T101 Create the enterprise product-area directory structure per plan.md: `src/app/enterprise/{copy,tokens,models,services,layout,pages,components,state,testing}` and `public/enterprise-fixtures/`
- [X] T202 [P] Add `axe-core` as a devDependency (`pnpm add -D axe-core`) for automated accessibility assertions in specs
- [X] T303 [P] Create the shared axe assertion helper (runs axe on a rendered host, fails on critical/serious violations) in `src/app/enterprise/testing/a11y-assert.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The contract layer every story builds on — versionable survey-operations
fixtures, typed models, fixture/simulation/collections services, the scoped Fluent 2
token system with mode support, persistence, and centralized English copy (FR-001
tokens base, FR-045–FR-047, FR-051).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Tests for Foundational Contracts

- [X] T404 [P] Add fixture-validator unit tests (accepts valid fixture rows; rejects unknown fields, malformed dates, out-of-range scores, duplicate ids with path-specific issues) in `src/app/enterprise/services/fixture-validator.spec.ts`
- [X] T505 [P] Add collections-query tests (search/filter/sort/paginate combine by intersection; filter context preserved across pages) in `src/app/enterprise/services/collections.service.spec.ts`
- [X] T606 [P] Add simulation tests (deterministic latency; injected failure throws typed `SimulatedFailure`; `runAction` returns `{ok}` outcomes without mutating fixtures) in `src/app/enterprise/services/simulation.service.spec.ts`

### Implementation for Foundational Contracts

- [X] T707 [P] Create `public/enterprise-fixtures/manifest.json` cataloging all enterprise fixtures under `"area": "enterprise"` per `contracts/demo-fixtures.md`
- [ ] T808 [P] Create the Surveys collection fixture `public/enterprise-fixtures/surveys.json` (~24 rows, survey-ops theme, status variants, per data-model.md)
- [ ] T909 [P] Create the Responses collection fixture `public/enterprise-fixtures/responses.json` (~32 rows referencing surveys/participants with scores 0–100, per data-model.md)
- [ ] T100 [P] Create the Participants collection fixture `public/enterprise-fixtures/participants.json` (~20 rows, per data-model.md)
- [X] T111 [P] Create the auxiliary fixtures `notifications.json`, `activity.json`, `quick-actions.json`, `help-content.json`, and `shortcuts.json` under `public/enterprise-fixtures/` (shapes per data-model.md and `contracts/demo-fixtures.md`)
- [X] T122 [P] Create typed entity models (Survey, Response, Participant, Notification, QuickAction, RecentActivityEntry, Favorite, HelpTopic, TourStep, ShortcutEntry) in `src/app/enterprise/models/entities.models.ts`
- [X] T133 [P] Create fixture manifest/shape models in `src/app/enterprise/models/fixtures.models.ts`
- [X] T144 [P] Create persisted-state models (Preferences, DataView, Draft, read-state, onboarding) in `src/app/enterprise/models/state.models.ts` per `contracts/persisted-state.md`
- [X] T155 [P] Create the centralized English copy dictionary with a small interpolation helper (no user-visible strings hard-coded in components) in `src/app/enterprise/copy/copy.ts` (FR-051)
- [X] T166 Implement the typed fixture validator (path-specific issues; malformed fixtures produce a user-visible configuration error, never a partial dataset) in `src/app/enterprise/services/fixture-validator.ts` (satisfies T004)
- [X] T177 [P] Implement `simulation.service.ts` (deterministic latency, injectable failure, simulated transactions `runAction` for bulk/launch, export result helper) in `src/app/enterprise/services/simulation.service.ts` (FR-026, FR-046)
- [X] T188 Implement `fixture.service.ts` (loads manifest + fixtures over HTTP with latency/failure hooks; validates via fixture-validator) in `src/app/enterprise/services/fixture.service.ts` (FR-045)
- [X] T199 Implement the read-only `collections.service.ts` (search/filter/sort/paginate over a collection key) in `src/app/enterprise/services/collections.service.ts` (satisfies T005)
- [X] T200 [P] Implement `persistence.service.ts` (namespaced `enterprise.demo.v1.` localStorage; versioned defensive reads that drop corrupt entries; reset sweep) in `src/app/enterprise/services/persistence.service.ts` per `contracts/persisted-state.md`
- [X] T211 [P] Create the scoped enterprise semantic token sets (light/dark/a11y + motion, 8px spacing, radii, shadows, type, guaranteed contrast pairs) in `src/app/enterprise/tokens/enterprise-tokens.css` per `contracts/design-tokens.md` §9–§13 (scoped to the enterprise host)
- [X] T222 Implement `preferences.service.ts` (appearance light/dark/system, accessibilityMode, tableDensity signals; immediate apply + persistence) in `src/app/enterprise/services/preferences.service.ts` (FR-003/FR-004, FR-024)
- [X] T233 Implement `theme.service.ts` (applies mode classes on the enterprise host; listens to `prefers-color-scheme` for `system` and `prefers-reduced-motion`) in `src/app/enterprise/tokens/theme.service.ts` (FR-003–FR-005)

**Checkpoint**: Foundation ready — fixtures validate, collections query read-only,
state persists under one namespace, tokens/modes/copy exist. User story work can begin.

---

## Phase 3: User Story 1 - I can get my bearings in the application shell (Priority: P1) 🎯 MVP

**Goal**: A responsive application shell — collapsible side navigation (rail/drawer),
sticky top header, breadcrumbs, profile menu with reset-demo-data — plus the lazy
`/enterprise` route area, keeping the survey viewer's routes untouched (FR-006–FR-011,
FR-048).

**Independent Test**: Open `/enterprise/home` on wide and narrow viewports; confirm the
shell renders (header + nav + breadcrumbs), the nav collapses to a rail and opens as a
drawer with backdrop on mobile (Escape/backdrop close), breadcrumbs reflect the page,
the profile menu opens, and the survey viewer still loads unchanged at `/`.

### Tests for User Story 1

- [X] T244 [P] [US1] Extend `src/app/app.routes.spec.ts` to assert `/enterprise` lazy-loads the enterprise routes module and the existing `''` / `surveys/:surveyKey` routes remain unchanged
- [ ] T255 [P] [US1] Add an a11y spec for the shell (banner/nav/main landmarks, skip link present and functional, axe zero critical/serious violations) in `src/app/enterprise/layout/enterprise-shell/enterprise-shell.spec.ts`
- [ ] T266 [P] [US1] Add a side-nav behavior spec (expanded/rail/drawer states, current-area highlight not color-only, keyboard + Escape close, collapse state persisted) in `src/app/enterprise/layout/side-nav/side-nav.spec.ts`

### Implementation for User Story 1

- [X] T277 [US1] Add the single lazy `/enterprise` route to `src/app/app.routes.ts` and create `src/app/enterprise/enterprise.routes.ts` (register `home` and the catch-all `not-found` now; each later story registers its own routes)
- [X] T288 [US1] Create the minimal home landing stub (heading + copy; replaced by the full dashboard in US3) in `src/app/enterprise/pages/home/home.ts`
- [X] T299 [US1] Create the enterprise shell host (scoped token host element, skip link, top header + side nav + breadcrumb regions, router outlet) in `src/app/enterprise/layout/enterprise-shell/enterprise-shell.ts` (+ `.css`)
- [X] T300 [US1] Create the side-nav component (areas from copy, expanded/rail/drawer states, active indicator, favorites-group container with static empty state — wired to the favorites store in US3) in `src/app/enterprise/layout/side-nav/side-nav.ts` (+ `.css`)
- [X] T311 [P] [US1] Create the sticky top-header (brand, search trigger, notification bell with badge container, profile trigger) in `src/app/enterprise/layout/top-header/top-header.ts` (+ `.css`); badge count binding lands in US7
- [X] T322 [P] [US1] Create the breadcrumbs component driven by the route tree (hidden on home) in `src/app/enterprise/layout/breadcrumbs/breadcrumbs.ts`
- [X] T333 [US1] Create the profile menu (demo identity from copy; "Reset demo data" with typed confirmation calling `persistence.service` reset then reload; settings/shortcuts entries wired in US2/US8) in `src/app/enterprise/components/profile-menu/profile-menu.ts` (FR-008, FR-047)
- [X] T344 [P] [US1] Create the friendly not-found page in `src/app/enterprise/pages/not-found/not-found.ts`

**Checkpoint**: `/enterprise/home` renders the shell on all viewports; survey viewer
unchanged at `/`; shell is keyboard-operable and passes axe.

---

## Phase 4: User Story 2 - The product looks and behaves like one consistent, modern system (Priority: P1)

**Goal**: The Fluent 2 inspired visual language applies consistently; light/dark/
accessibility modes restyle the whole area; standardized skeleton/empty/error/toast
primitives exist for every part (FR-001–FR-005, FR-002 states; feedback primitives
supporting FR-038–FR-040).

**Independent Test**: Switch light → dark → accessibility mode from Settings; confirm
the entire enterprise area restyles immediately via token sets, the choice persists
across reload, focus rings/motion/targets follow accessibility mode, and the survey
viewer's maroon look is unaffected at `/`.

### Tests for User Story 2

- [X] T355 [P] [US2] Add preferences/theme service tests (mode set → persisted + host class applied; `system` follows `prefers-color-scheme`; reduced-motion honored) in `src/app/enterprise/services/preferences.service.spec.ts`
- [ ] T366 [P] [US2] Add settings-panel and toast-host tests (appearance/a11y/density toggles apply immediately and persist; toast severities render, success auto-dismisses, polite live region announced) in `src/app/enterprise/components/settings/settings.spec.ts` and `src/app/enterprise/components/toast-host/toast-host.spec.ts`
- [ ] T377 [P] [US2] Add state-view component tests (skeleton mirrors layout, empty state renders reason + action, error state emits retry) in `src/app/enterprise/components/state-views/state-views.spec.ts`

### Implementation for User Story 2

- [X] T388 [US2] Build the Settings panel (appearance light/dark/system, accessibility toggle, table density) reachable from the profile menu, applying via `preferences.service` in `src/app/enterprise/components/settings/settings.ts` (FR-003/FR-004)
- [X] T399 [US2] Complete accessibility-mode guarantees (max-contrast token overrides, always-visible focus ring, minimized motion, enlarged targets) in `src/app/enterprise/tokens/enterprise-tokens.css` + theme classes (FR-004/FR-005)
- [X] T400 [P] [US2] Create the state-view primitives (skeleton / empty-state / error-state-with-retry) in `src/app/enterprise/components/state-views/state-views.ts` (+ `.css`) per `contracts/component-inventory.md` §3
- [X] T411 [P] [US2] Create `toast.service.ts` and the toast host (severities; success auto-dismiss; error persists; polite live-region announcements) in `src/app/enterprise/services/toast.service.ts` and `src/app/enterprise/components/toast-host/toast-host.ts` (+ `.css`) (FR-038, FR-050)
- [X] T422 [US2] Create the confirm-dialog convention wrapper (cancel-focused by default; destructive variant; typed-confirm support for demo reset) in `src/app/enterprise/components/confirm-dialog/confirm-dialog.ts`
- [ ] T433 [US2] Apply the PrimeNG token-override pass for components in use so far (map each to the semantic tokens per `contracts/primeng-component-mapping.md` §6) and audit that no enterprise component hard-codes colors/radii/spacing (FR-002)

**Checkpoint**: Modes restyle the area and persist; every part created so far uses
tokens and standardized states; toasts/empty/skeleton/error primitives are ready.

---

## Phase 5: User Story 3 - I can start my day from the home dashboard (Priority: P1)

**Goal**: A command-center dashboard — welcome heading, one-click quick actions, recent
activity (capped, newest-first), favorites area — with smart empty states, synced to a
favorites group in the side nav (FR-012–FR-015).

**Independent Test**: Open the dashboard after a demo reset; confirm welcome, quick
actions, and smart empty recents/favorites states; launch a quick action; visit a
record; mark favorites from a record and the nav; return and confirm recents
newest-first and favorites present in both dashboard and nav.

### Tests for User Story 3

- [X] T444 [P] [US3] Add `favorites.service.spec.ts` (add/remove/toggle, unique refs, persistence, ordering)
- [X] T455 [P] [US3] Add `activity.service.spec.ts` (records visits/actions, newest-first, capped at 12, persistence)
- [ ] T466 [P] [US3] Add a dashboard spec (welcome + sections render, empty states when no data, quick action navigates, favorites stay in sync with nav, single-column at 320px) in `src/app/enterprise/pages/home/home.spec.ts`

### Implementation for User Story 3

- [X] T477 [US3] Implement `favorites.service.ts` (signal store; add/remove; persisted) in `src/app/enterprise/services/favorites.service.ts` (FR-015)
- [X] T488 [P] [US3] Implement `activity.service.ts` (signal store; cap 12; persisted) in `src/app/enterprise/services/activity.service.ts` (FR-014)
- [X] T499 [US3] Replace the home stub with the full dashboard (welcome heading, quick actions from fixture, recents, favorites; smart empty states; responsive reflow) in `src/app/enterprise/pages/home/home.ts` (+ `.css`) (FR-012/FR-013)
- [X] T500 [US3] Wire the side-nav favorites group (replace static empty) and add a favorite star affordance on favoritable records/pages to `favorites.service` (FR-015)
- [X] T511 [US3] Add activity-recording hooks (route/area visits and record views feed `activity.service`) in the shell/navigation and detail pages (FR-014)

**Checkpoint**: Dashboard is a working command center; favorites sync across the nav
and dashboard; activity tracks the user's path.

---

## Phase 6: User Story 4 - I can find anything by searching globally (Priority: P2)

**Goal**: Global search from anywhere — header trigger or `Ctrl/Cmd+K` — with grouped,
keyboard-operable results and a smart empty state (FR-016–FR-020).

**Independent Test**: From any enterprise page press `Ctrl/Cmd+K`; type ≥2 characters;
navigate grouped results with arrows/Enter; confirm the overlay closes and the target
opens; type gibberish and confirm the smart empty state; confirm shortcuts never fire
while typing in a field.

### Tests for User Story 4

- [X] T522 [P] [US4] Add `search.service.spec.ts` (≥2 chars, grouped by pages/records/views/actions, confident corrected suggestion, no-match path)
- [ ] T533 [P] [US4] Add a global-search overlay spec (opens focused, arrows/Enter/Escape, focus returns to trigger, empty state) in `src/app/enterprise/components/global-search/global-search.spec.ts`

### Implementation for User Story 4

- [X] T544 [US4] Implement `search.service.ts` (client index over fixtures + app structure; grouped results) in `src/app/enterprise/services/search.service.ts`
- [X] T555 [US4] Create the global-search overlay component (grouped results, keyboard handling, smart empty state, close-on-navigate) in `src/app/enterprise/components/global-search/global-search.ts` (+ `.css`)
- [X] T566 [US4] Wire the header search trigger and `Ctrl/Cmd+K` (registered in `keyboard.service` from US8's task T087, or a minimal local registration now) to open the overlay; guard against firing while typing (FR-016, FR-044)

**Checkpoint**: Global search finds any demo target from any page, keyboard-only.

---

## Phase 7: User Story 5 - I can find, shape, and act on a data collection (Priority: P2)

**Goal**: Personalizable data tables for Surveys/Responses/Participants — search,
advanced filters, sorting, saved views, column/density personalization, export, bulk
actions (simulated), skeleton/empty/error states (FR-021–FR-028, FR-039/FR-040).

**Independent Test**: Open Surveys; filter/search/sort; personalize columns/density
(applies + persists); save a view and reopen it exactly; multi-select rows, run a
destructive bulk action (confirmation states scope, completion toast, fixtures pristine
after reload); export the current view as CSV and confirm it matches the filtered set;
clear to zero rows and confirm the smart empty state.

### Tests for User Story 5

- [X] T577 [P] [US5] Add `views.service.spec.ts` (save/restore exact arrangement, rename/delete, uniqueness per collection, persistence)
- [ ] T588 [P] [US5] Add a data-table spec (search/filter/sort/pagination combine, selection, column personalization + density, skeleton→ready/empty/error transitions) in `src/app/enterprise/components/data-table/data-table.spec.ts`
- [ ] T599 [P] [US5] Add bulk-action and export specs (selection count bar, destructive confirm, simulated run + toast result, export matches filtered view, failure → error + retry) in `src/app/enterprise/components/bulk-actions-bar/bulk-actions-bar.spec.ts` and the data-table export spec

### Implementation for User Story 5

- [X] T600 [US5] Implement `views.service.ts` (saved-view CRUD + persistence) in `src/app/enterprise/services/views.service.ts` (FR-025)
- [X] T611 [US5] Create the data-table component with toolbar (search, sortable columns, pagination, row selection, skeleton/empty/error via state-views) in `src/app/enterprise/components/data-table/data-table.ts` (+ `.css`) (FR-021–FR-023, FR-028)
- [ ] T622 [P] [US5] Create the advanced-filter builder (produces removable filter chips; combines with search by intersection) in `src/app/enterprise/components/advanced-filter/advanced-filter.ts` (FR-022)
- [ ] T633 [P] [US5] Create the column-personalizer (show/hide/reorder/density; immediate apply + persistence) in `src/app/enterprise/components/column-personalizer/column-personalizer.ts` (FR-024)
- [ ] T644 [P] [US5] Create the saved-views bar (view selector, save/save-as/rename/delete) in `src/app/enterprise/components/saved-views-bar/saved-views-bar.ts` (FR-025)
- [ ] T655 [P] [US5] Create the bulk-actions bar (selection count, destructive confirm, simulated run via `simulation.service`, toast result) in `src/app/enterprise/components/bulk-actions-bar/bulk-actions-bar.ts` (FR-026)
- [X] T666 [US5] Implement export (CSV/JSON of the current filtered/sorted view, scope page/all, success/failure toast + retry) in the data-table export flow via `simulation.service` (FR-027)
- [X] T677 [US5] Build the Surveys collection page and detail (compose data-table + toolbar; status pills; summary cards, tabs for progressive disclosure) in `src/app/enterprise/pages/surveys/surveys.ts` and `src/app/enterprise/pages/surveys/survey-detail.ts`
- [X] T688 [P] [US5] Build the Responses collection page and detail (score/device/completion columns) in `src/app/enterprise/pages/responses/responses.ts` and `src/app/enterprise/pages/responses/response-detail.ts`
- [X] T699 [P] [US5] Build the Participants collection page and detail (region/opt-in columns) in `src/app/enterprise/pages/participants/participants.ts` and `src/app/enterprise/pages/participants/participant-detail.ts`
- [X] T700 [US5] Register the surveys/responses/participants collection and `:id` detail routes in `src/app/enterprise/enterprise.routes.ts`

**Checkpoint**: All three collections are fully manageable (filter/sort/personalize/
save/export/bulk) with correct loading/empty/error behavior and read-only fixtures.

---

## Phase 8: User Story 6 - I can complete a guided multi-step task and resume it later (Priority: P2)

**Goal**: A "Launch a survey" stepper task with smart defaults, real-time inline
validation, draft auto-save/resume, a guarded submit, and a success screen
(FR-029–FR-035).

**Independent Test**: Open Launch a survey; confirm smart defaults; invalid required
input blocks Next with an inline message that clears on fix; refresh mid-task and
confirm the resume prompt restores values/step with no field loss; finish and confirm
the success screen + toast, the draft clears, and a double-click produces one
submission.

### Tests for User Story 6

- [X] T711 [P] [US6] Add `drafts.service.spec.ts` (debounced autosave, restore, clear on submit/discard, persistence across restart)
- [ ] T722 [P] [US6] Add a launch-survey integration spec (stepper gating by current-step validity, inline messages tied to fields, smart defaults editable, resume restores, double-submit prevented, draft clears on success) in `src/app/enterprise/pages/launch-survey/launch-survey.spec.ts`

### Implementation for User Story 6

- [X] T733 [US6] Implement `drafts.service.ts` (auto-save after edits/step change, restore, clear-on-submit/discard) in `src/app/enterprise/services/drafts.service.ts` (FR-033)
- [X] T744 [US6] Create the guided-task page using PrimeNG `Stepper` (steps from fixture field specs, smart defaults, inline validation, resume prompt, busy submit guard, success state) in `src/app/enterprise/pages/launch-survey/launch-survey.ts` (+ `.css`) (FR-029–FR-034)
- [X] T755 [US6] Create the validated-field wrapper (label + control + adjacent inline message with `aria-describedby`/`aria-invalid` wiring; clears on valid) in `src/app/enterprise/components/validated-field/validated-field.ts` (FR-031)
- [X] T766 [US6] Register the launch route in `src/app/enterprise/enterprise.routes.ts` and add the "Launch a survey" quick action to `public/enterprise-fixtures/quick-actions.json`

**Checkpoint**: The guided task is completable end to end, survives refresh via drafts,
and validates inline per the feedback vocabulary.

---

## Phase 9: User Story 7 - I am kept informed and never left wondering what happened (Priority: P2)

**Goal**: Notification center (badge, unread triage, deep links, live demo scheduler)
plus product-wide skeleton/empty/error/toast/live-region feedback application
(FR-036–FR-040, FR-050).

**Independent Test**: Trigger a simulated action (or drive the scheduler) and confirm
the unread badge increments; open the center, read/clear items, activate a deep link
to its target; empty the center and confirm the "all caught up" state; verify toasts
and skeletons appear across async flows and are announced to assistive technology.

### Tests for User Story 7

- [X] T777 [P] [US7] Add `notifications.service.spec.ts` (seed from fixture, read/mark-all/clear, badge signal, read-state persistence)
- [X] T788 [P] [US7] Add a scheduler test (driven tick emits a notification; pauses when hidden/inert under test) in the notifications service spec
- [ ] T799 [P] [US7] Add a notification-center spec (newest-first, unread distinction, actions, deep-link navigation, smart empty state, keyboard operation) in `src/app/enterprise/components/notification-center/notification-center.spec.ts`

### Implementation for User Story 7

- [X] T800 [US7] Implement `notifications.service.ts` (fixture seed + live scheduler ~45–75 s + simulated-action notifications; read/clear state persisted) in `src/app/enterprise/services/notifications.service.ts` (FR-036/FR-037)
- [X] T811 [US7] Create the notification-center component (drawer panel, filters All/Unread, mark read/all, clear with confirmation, deep links, smart empty state) in `src/app/enterprise/components/notification-center/notification-center.ts` (+ `.css`) (FR-036)
- [X] T822 [US7] Bind the header bell badge count and open-the-center hook (from US1's header) and register the `/enterprise/notifications` page in `src/app/enterprise/pages/notifications/notifications.ts` + `enterprise.routes.ts` (FR-036/FR-037)
- [ ] T833 [US7] Feedback sweep: apply state-views, toasts, and live-region announcements across all async regions and action outcomes created so far (audit each page/component against FR-039/FR-040/FR-038/FR-050)

**Checkpoint**: Users see live notifications and consistent feedback everywhere; badge
and read state stay accurate.

---

## Phase 10: User Story 8 - New users feel guided; regular users feel fast (Priority: P3)

**Goal**: Guided onboarding tour (skippable, re-launchable), contextual help, and a
keyboard shortcut map whose entries all work (FR-041–FR-044).

**Independent Test**: Reset demo data; confirm the welcome tour offers on first run;
skip it and re-launch from Help; open contextual help on an area; open the shortcut
map and verify each listed shortcut works and none fire while typing in a field.

### Tests for User Story 8

- [X] T844 [P] [US8] Add `keyboard.service.spec.ts` (bindings fire outside inputs; typing guard; no key-repeat toggle; map source drives bindings)
- [ ] T855 [P] [US8] Add an onboarding-tour spec (first-run offer, skip/dismiss persisted, replay from Help, non-blocking) in `src/app/enterprise/components/onboarding-tour/onboarding-tour.spec.ts`
- [ ] T866 [P] [US8] Add a help-page spec (tour replay, help index from fixture, shortcut map renders every entry) in `src/app/enterprise/pages/help/help.spec.ts`

### Implementation for User Story 8

- [X] T877 [US8] Implement `keyboard.service.ts` (centralized global/context bindings; typing guard; single source consumed by the shortcut map) in `src/app/enterprise/services/keyboard.service.ts` (FR-043/FR-044)
- [X] T888 [US8] Create the onboarding-tour component (coach overlay from fixture steps; Skip/Next/Back/Done; completion/dismissal persisted; reduced-motion safe) in `src/app/enterprise/components/onboarding-tour/onboarding-tour.ts` (FR-041)
- [X] T899 [P] [US8] Create the contextual-help component (anchored popover with short explanation + help link per location key) in `src/app/enterprise/components/contextual-help/contextual-help.ts` (FR-042)
- [X] T900 [P] [US8] Create the shortcut-map component (grouped global/context entries, driven by `keyboard.service`) in `src/app/enterprise/components/shortcut-map/shortcut-map.ts` (FR-043)
- [X] T911 [US8] Build the Help page (tour replay, help index from fixture, shortcut map) in `src/app/enterprise/pages/help/help.ts` and register the `help` route in `src/app/enterprise/enterprise.routes.ts`

**Checkpoint**: First-run users get guided, help is one click away everywhere, and the
shortcut map is honest (every listed shortcut works).

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Product-wide quality gates, isolation verification, documentation, and
recorded validation results (SC-003, SC-004, FR-048/FR-049/FR-050).

- [ ] T922 [P] Run the accessibility + keyboard + responsive validation pass on every page template: axe zero critical/serious violations, keyboard-only journey completion, 320px/768px/1024px reflow, 200% zoom, reduced-motion behavior (per `specs/003-enterprise-app-foundation/quickstart.md` §7)
- [ ] T933 [P] Token/theming audit: confirm no hard-coded colors/radii/spacing remain in enterprise components and every state uses the standardized primitives (FR-002)
- [ ] T944 [P] Boundary/isolation check: no imports from `src/app/enterprise` into `src/app/survey|core|shared`; survey viewer styles, routes, and fixtures untouched; enterprise tokens do not leak into survey pages (FR-048)
- [ ] T955 Update `README.md` documenting the `/enterprise` demo area, fixture location/swapping, modes, and the validation commands
- [ ] T966 Run the full validation commands from `specs/003-enterprise-app-foundation/quickstart.md` (`ng test`/`vitest`, production build, manual scenario walkthrough) and record results in quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; **blocks all user stories** (fixtures,
  models, tokens/modes, persistence, copy must exist first).
- **User Stories (Phases 3–10)**: Depend on Phase 2.
  - US1 (shell) and US2 (design system/modes) both follow the foundation and can be
    developed in parallel after it; US1 is the suggested MVP first slice.
  - US3 depends on US1 shell (routes/home outlet) and US2 primitives (empty states).
  - US4 depends on US1 header trigger + foundation fixtures.
  - US5 depends on US1 (shell/breadcrumbs) and US2 (state-views/toast).
  - US6 depends on US1 (routes) and US2 (validated feedback/toast).
  - US7 depends on US1 (header bell) and US2 (toast/live regions).
  - US8 depends on US1 (profile/help hooks) and keyboard service.
- **Polish (Phase 11)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: After Foundational; no other story needed (MVP scope).
- **US2 (P1)**: After Foundational; independent of US1 except Settings reachable from the
  US1 profile menu (T038 notes the hook) — can be demoed via its own route/tests first.
- **US3 (P1)**: Needs US1 shell route/outlet and empty-state primitives from US2.
- **US4 (P2)**: Needs US1 header trigger; independent of US3/US5.
- **US5 (P2)**: Needs US2 state-views/toast; independent of US4/US6.
- **US6 (P2)**: Needs US2 validated-field/toast; independent of US5.
- **US7 (P2)**: Needs US1 bell hook + US2 toast/live-region primitives.
- **US8 (P3)**: Needs US1 profile/help entry points; wires global bindings other stories
  already use (US4 `Ctrl/Cmd+K` registered in US8's T087 — if US4 lands first, use the
  minimal local registration in T056 and refactor to `keyboard.service` in T087).

### Within Each User Story

- Tests MUST be written first and fail before implementation (constitution quality gate).
- Models/services before components; core behavior before page integration.
- Story complete (all checkboxes checked, tests + build green) before moving to the next
  priority, per the incremental strategy below.

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel.
- Foundational fixtures (T007–T011), models (T012–T015), and [P] services/tokens can run
  in parallel; T016/T018/T019 (validator→fixture→collections chain) run in sequence.
- US1: T024–T026 (tests) parallel; T027→T028→T029→T030 sequence; T031/T032/T034 parallel.
- US2: T035–T037 parallel; T040/T041 parallel before T043 audit.
- US3: T044–T046 parallel; T047/T048 parallel before T049–T051.
- US4: T052/T053 parallel; T054→T055→T056 sequence.
- US5: T057–T059 parallel; T060→T061 core; T062–T065 parallel; T066 after T061;
  T067–T069 parallel after T061; T070 last.
- US6: T071/T072 parallel; T073→T074 sequence, T075 parallel, T076 last.
- US7: T077–T079 parallel; T080→T081→T082 sequence; T083 sweep last.
- US8: T084–T086 parallel; T087→T088 sequence; T089/T090 parallel; T091 last.
- Polish: T092–T094 parallel; T096 last (depends on everything).

---

## Parallel Example: User Story 5

```bash
# Launch all tests for User Story 5 together:
Task: "views.service.spec.ts tests (T057)"
Task: "data-table.spec.ts tests (T058)"
Task: "bulk/export specs (T059)"

# Launch independent components after views.service + data-table exist:
Task: "advanced-filter (T062)"
Task: "column-personalizer (T063)"
Task: "saved-views-bar (T064)"
Task: "bulk-actions-bar (T065)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup and Phase 2 Foundational (fixtures, models, tokens/modes,
   persistence, copy, core services).
2. Complete Phase 3 US1 (lazy `/enterprise` route + shell + nav + header + breadcrumbs +
   profile menu + not-found).
3. Run the US1 independent test (shell usable on all viewports; survey viewer untouched)
   — this is a demoable MVP slice of the whole feature.

### Incremental Delivery

1. Add US2 (modes + standardized feedback primitives) → verify mode-swap + token audit.
2. Add US3 dashboard → verify command-center behavior.
3. Add US4 search → US5 data management → US6 guided task → US7 notifications (each
   independently testable; commit after each checkpoint).
4. Add US8 onboarding/help/shortcuts.
5. Complete Phase 11 polish: a11y/keyboard/responsive validation, isolation audit,
   README, and recorded quickstart results.

### Parallel Team Strategy

After Foundational: Developer A on US1+US3 (shell → dashboard), Developer B on US2,
then US4/US5/US6/US7/US8 distributed by story (each story is file-isolated by its
`src/app/enterprise/**` component/page/service paths).

---

## Traceability Summary

- **Foundational** serves FR-001 (token base), FR-045–FR-047 (fixtures/demo/reset),
  FR-051 (centralized copy), and the typed contract layer behind all stories.
- **US1** covers FR-006–FR-011 (shell, nav, header, breadcrumbs, command-bar surface,
  profile menu) and the FR-048 route-isolation requirement; contributes SC-008.
- **US2** covers FR-001–FR-005 (visual consistency, modes, accessibility mode, reduced
  motion) and the standardized-state primitives behind FR-002/FR-038–FR-040; SC-009.
- **US3** covers FR-012–FR-015 (dashboard, quick actions, recents, favorites sync);
  contributes SC-001/SC-002.
- **US4** covers FR-016–FR-020 (global search incl. shortcut entry); contributes SC-002.
- **US5** covers FR-021–FR-028 (data management: filter/search/sort/views/
  personalization/export/bulk, read-only dataset) plus FR-039/FR-040 on the table;
  contributes SC-004/SC-005.
- **US6** covers FR-029–FR-035 (stepper, inline validation, smart defaults, drafts);
  SC-006/SC-007 and SC-001.
- **US7** covers FR-036–FR-040 and FR-050 (notifications, scheduler, toasts,
  skeleton/empty/error application, assistive announcements); SC-005.
- **US8** covers FR-041–FR-044 (onboarding, contextual help, shortcut map, typing
  guard); contributes SC-001/SC-003.
- **Polish** verifies SC-003 (zero critical/serious a11y violations, keyboard-only
  journeys) and SC-004 (reflow) product-wide, and re-verifies FR-048 isolation.
- FR-049 (WCAG 2.2 AA baseline) is a standing acceptance criterion applied by T025,
  T092, and every component spec that runs axe assertions.

## Notes

- [P] tasks = different files, no dependencies.
- `[US#]` label maps each task to its spec.md user story for traceability.
- Route registration is centralized in `src/app/enterprise/enterprise.routes.ts`;
  later-story route tasks (T070, T076, T082, T091) append to it — never edit
  `src/app/app.routes.ts` again after T027 (isolation contract, T094).
- Where a later story consumes an earlier story's hook (US7 bell badge ← US1 header,
  US3 favorites group ← US1 nav, US8 keyboard service ← US4 shortcut), the earlier task
  leaves a clearly marked hook and the consuming task wires it.
- Commit after each task or logical group; stop at any checkpoint to validate the story
  independently.
- Avoid: vague tasks, cross-boundary imports, edits to survey-viewer files
  (`src/app/survey|core|shared` and `public/survey*.json`), or hard-coded user-visible
  strings.
