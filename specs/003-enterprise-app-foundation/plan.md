# Implementation Plan: Enterprise Application Foundation

**Branch**: `003-enterprise-app-foundation` | **Date**: 2026-09-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-enterprise-app-foundation/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Deliver a modern, Fluent 2 inspired **enterprise application** as a new product area of the
existing Angular 22 single-page application, using PrimeNG 22 and PrimeFlex, per the repository
constitution's technology constraints. Per the clarified scope the enterprise product:

- lives at a **dedicated route area `/enterprise/**`** inside the same application build
  (FR-048), with a hard folder/module boundary (`src/app/enterprise/**`) and the survey viewer
  untouched at its existing `/` and `/surveys/:surveyKey` URLs;
- is a **survey-operations themed demo** (Surveys, Responses, Participants collections and a
  "Launch a survey" guided task) over **read-only fixture data** with a simulated service layer
  (latency + injectable failure) and on-device persistence limited to user-created state
  (FR-045–FR-047, FR-026);
- ships **English-only centralized copy** (FR-051) and a **dual visual identity**: a token-driven
  Fluent 2 inspired look for the enterprise area only, with light/dark/accessibility modes
  (FR-001–FR-005), while the survey viewer keeps its maroon language.

The build covers the ten user stories in spec.md: an application shell (collapsible side
navigation, sticky header, breadcrumbs, profile menu), a command-center dashboard (quick actions,
recent activity, favorites), global search, personalizable data tables with saved views, export,
and bulk actions, a stepper-based guided task with draft resume, a notification center, the full
loading/empty/error/success feedback vocabulary, guided onboarding, contextual help, and keyboard
shortcuts — all WCAG 2.2 AA, responsive mobile-first, and verified per the quality gates in the
constitution. UX/visual behavior is defined normatively by the companion documents
(`ux-architecture.md`, `contracts/design-tokens.md`, `contracts/component-inventory.md`,
`contracts/primeng-component-mapping.md`) created in the specify phase.

## Technical Context

**Language/Version**: TypeScript 6.0 with Angular 22.1 (existing `src/` application)

**Primary Dependencies**: Angular 22, RxJS 7.8, PrimeNG 22 (drawer, popover, tabs, stepper,
table, toolbar, toggleswitch, select, multiselect, menu, breadcrumb, dialog, toast, skeleton,
message, tag, badge, avatar, tooltip, chart, paginator, fileupload, timeline, orderlist, etc.),
PrimeFlex 4 (grid/responsive utilities), Vitest (via the Angular unit-test builder), axe-core
(devDependency, automated accessibility assertions — see research.md)

**Storage**: Versionable JSON fixtures under `public/enterprise-fixtures/**` loaded by a
simulated fixture service; on-device user state (appearance/accessibility/density preferences,
saved views, favorites, drafts, notification read state, onboarding completion) in `localStorage`
under a namespaced key, managed by typed services; no backend, no shared persistence

**Testing**: Vitest unit/integration specs colocated with components/services (run via
`ng test`/`vitest`); automated accessibility assertions (axe-core) on page templates; keyboard
walkthroughs; responsive smoke checks at 320px/768px/1024px; Angular production build

**Target Platform**: Modern evergreen desktop/tablet/mobile browsers (latest two major versions)

**Project Type**: Angular single-page web application (single build; the enterprise feature is a
lazy-loaded route area, not a separate project)

**Performance Goals**: Enterprise route area lazy-loads and first paint within 2 s on a
mid-range device; search/typing feedback within 150 ms; guided-task step transitions within
300 ms; no regression to survey viewer load targets; all transitions within the motion-token
durations (≤300 ms)

**Constraints**:
- Enterprise code MUST NOT import or modify survey-viewer application code or fixtures
  (hard `src/app/enterprise` boundary; FR-048)
- Enterprise token/mode styling MUST be scoped to the enterprise host so the survey viewer's
  maroon visual language is unaffected (research.md: scoped token strategy)
- No new global state framework; typed services + Angular signals; deterministic latency +
  injectable failure in the fixture service (FR-046)
- Record dataset is read-only: bulk/launch actions are simulated transactions; only user-created
  state persists (FR-026)
- All user-visible copy centralized and English (FR-051)
- No secrets/environment files in client assets (constitution governance)

**Scale/Scope**: Three demo collections (≤ ~40 rows each), one guided task, one demo user; the
full page-template and component inventory from `ux-architecture.md`/`component-inventory.md` is
in scope

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **JSON-Driven Domain Contract**: PASS. Enterprise content is fixture-driven through a typed,
  validated contract layer (fixture JSON + models + service boundary defined before UI), so
  content changes never require application code changes (FR-045). The survey viewer's JSON
  contract is untouched.
* **Feature Isolation and Contracts First**: PASS. The enterprise area is isolated behind a
  folder boundary and explicit contracts (routing, fixtures, persisted state, component
  inventory, tokens). The survey viewer code, models, and services are not modified.
* **Validation and Submission Integrity**: PASS. Guided-task step validation and draft integrity
  are first-class requirements (FR-029–FR-035, SC-006/SC-007); the simulated action layer gives
  deterministic success/failure outcomes with user-visible feedback (FR-038).
* **Testable Quality Gates**: PASS. Unit + integration coverage for services, models, validators,
  and components; automated a11y assertions; formatting/type/test/production-build gates before
  review; ≥80% coverage target for maintained enterprise code.
* **Accessible, Responsive, and Maintainable UX**: PASS. WCAG 2.2 AA, keyboard/screen-reader
  operability, reflow to 320px, tokens and PrimeNG components, signals for stateful UI, mobile-
  first responsive layouts (FR-049, FR-003–FR-005). Dual visual identity is governed per product
  area with scoped tokens; survey viewer identity preserved (FR-048).

## Project Structure

### Documentation (this feature)

```text
specs/003-enterprise-app-foundation/
├── spec.md                  # Feature specification (/speckit-specify output)
├── ux-architecture.md       # UX/IA/journeys/templates/responsive/a11y/interactions
├── plan.md                  # This file (/speckit-plan output)
├── research.md              # Phase 0 output (/speckit-plan output)
├── data-model.md            # Phase 1 output (/speckit-plan output)
├── quickstart.md            # Phase 1 output (/speckit-plan output)
├── checklists/requirements.md
├── contracts/
│   ├── design-tokens.md                 # Deliverable 4+11 (specify output)
│   ├── component-inventory.md           # Deliverable 5 (specify output)
│   ├── primeng-component-mapping.md     # Deliverable 10 (specify output)
│   ├── enterprise-routing.md            # Route area, URL tree, isolation rules
│   ├── demo-fixtures.md                 # Fixture JSON shapes + simulated service API
│   ├── persisted-state.md               # localStorage schema + reset semantics
│   └── keyboard-shortcuts.md            # Shortcut map contract
└── tasks.md                # Phase 2 output (/speckit-tasks output - not created here)
```

### Source Code (repository root)

```text
public/
└── enterprise-fixtures/            # Versionable demo content (FR-045; swap without code change)
    ├── manifest.json               # Allowlisted area + fixture catalog
    ├── surveys.json                # Surveys collection
    ├── responses.json              # Responses collection
    ├── participants.json           # Participants collection
    ├── notifications.json          # Seed notification stream
    ├── activity.json               # Seed recent-activity entries
    ├── quick-actions.json          # Dashboard quick-action definitions
    ├── help-content.json           # Contextual help + onboarding tour steps
    └── shortcuts.json              # Keyboard shortcut map content

src/app/
├── app.routes.ts                   # Amended: adds lazy `/enterprise` route (survey routes unchanged)
├── core/                           # Survey-viewer core (UNTOUCHED)
├── shared/                         # Survey-viewer shared (UNTOUCHED)
├── survey/                         # Survey-viewer feature (UNTOUCHED)
└── enterprise/                     # NEW: enterprise product area (self-contained)
    ├── enterprise.routes.ts        # Lazy child routes under /enterprise
    ├── copy/                       # Centralized English copy (FR-051)
    │   └── copy.ts
    ├── tokens/
    │   ├── enterprise-tokens.css   # Semantic token sets: light/dark/a11y (scoped to host)
    │   └── theme.service.ts        # Mode state + class application
    ├── models/                     # Typed domain + persisted-state models
    │   ├── entities.models.ts      # Survey/Response/Participant/Notification/... entities
    │   ├── fixtures.models.ts      # Fixture file shapes
    │   └── state.models.ts         # Saved view, favorite, draft, preferences
    ├── services/
    │   ├── fixture.service.ts      # Fetch fixtures w/ latency + injectable failure (FR-046)
    │   ├── collections.service.ts  # Query/filter/sort/paginate read-only collections
    │   ├── notifications.service.ts# Stream + read-state + badge count (FR-036/FR-037)
    │   ├── activity.service.ts     # Recent-activity recording/cap (FR-014)
    │   ├── favorites.service.ts    # Favorites store + sync (FR-015)
    │   ├── views.service.ts        # Saved views CRUD (FR-025)
    │   ├── drafts.service.ts       # Guided-task drafts (FR-033)
    │   ├── preferences.service.ts  # Appearance/a11y/density persistence (FR-003–FR-005)
    │   ├── toast.service.ts        # Toast + live-region announcements (FR-038/FR-050)
    │   ├── search.service.ts       # Global search index + query (FR-016–FR-020)
    │   ├── simulation.service.ts   # Deterministic latency + failure injection helper
    │   └── keyboard.service.ts     # Shortcut registration/guards (FR-043/FR-044)
    ├── layout/
    │   ├── enterprise-shell/       # Host: header + nav + <router-outlet> + scoped tokens
    │   ├── top-header/             # Sticky header: brand, search trigger, bell, profile
    │   ├── side-nav/               # Expanded/rail/drawer states + favorites group (FR-006)
    │   ├── breadcrumbs/            # (FR-009)
    │   └── command-bar/            # (FR-010)
    ├── pages/
    │   ├── home/                   # Dashboard: quick actions/recents/favorites (FR-012–014)
    │   ├── surveys/                # Collection + detail (T3/T4)
    │   ├── responses/              # Collection + detail
    │   ├── participants/           # Collection + detail
    │   ├── launch-survey/          # Guided stepper task + success screen (FR-029–035)
    │   ├── notifications/          # Notification center page (FR-036)
    │   ├── help/                   # Tour replay/help index/shortcut map (FR-041–043)
    │   └── not-found/              # Friendly 404
    ├── components/
    │   ├── data-table/             # Toolbar: search/filter/view/personalize/export/bulk (FR-021–028)
    │   ├── saved-views-bar/        # (FR-025)
    │   ├── advanced-filter/        # Filter builder → chips
    │   ├── column-personalizer/    # Show/hide/reorder/density (FR-024)
    │   ├── bulk-actions-bar/       # (FR-026)
    │   ├── global-search/          # Overlay + grouped results (FR-016–020)
    │   ├── notification-center/    # Drawer/panel + list (FR-036/FR-037)
    │   ├── profile-menu/           # Identity + settings + reset (FR-008)
    │   ├── onboarding-tour/        # Coach overlay (FR-041)
    │   ├── contextual-help/        # Inline help popover (FR-042)
    │   ├── shortcut-map/           # (FR-043)
    │   ├── state-views/            # Empty/error/skeleton wrappers (FR-039/040)
    │   └── copy-field/             # Inline validated field helpers (FR-031)
    └── state/                      # Signal stores composing services (collections, views)
```

**Structure Decision**: Use the existing single Angular application; the enterprise product is a
lazy-loaded, self-contained `src/app/enterprise` route area with typed models/services/components
organized by concern, mirroring the conventions established by `src/app/core|shared|survey`.
Fixtures live in `public/enterprise-fixtures/` so content is versionable and swappable without
code changes. The `src/app/enterprise` boundary never imports from `src/app/survey`, `core`, or
`shared` (survey-viewer code stays untouched); small genuinely-shared utilities (if any arise)
are duplicated or moved only via an explicit decision, not imported across the product boundary.

## Implementation phases (task grouping for `/speckit-tasks`)

1. **Foundation**: fixture files + manifest; typed models; fixture/simulation services;
   enterprise tokens (light/dark/a11y) scoped to shell host; theme service; centralized copy.
2. **Shell**: routes (amended `app.routes.ts` + `enterprise.routes.ts`); enterprise shell layout;
   side nav (rail/drawer); sticky header; breadcrumbs; profile menu; not-found.
3. **System states & feedback**: toast service; state-views (skeleton/empty/error); notifications
   service + center; activity + favorites services; preferences persistence.
4. **Home dashboard**: quick actions, recents, favorites sections + smart empty states.
5. **Data management**: collections service; data-table + toolbar; advanced filter; column
   personalizer; saved views; export; bulk actions (simulated).
6. **Guided task**: stepper task "Launch a survey"; inline validation; smart defaults; drafts +
   resume; success state.
7. **Search & global nav**: global search overlay + index; keyboard shortcut map + keyboard
   service; command-bar focus shortcut.
8. **Guidance**: onboarding tour; contextual help; help page.
9. **Quality pass**: automated a11y assertions per template; keyboard walkthroughs; responsive
   checks (320/768/1024); cross-feature integration specs; production build.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | The single Angular project with a lazy-loaded, folder-isolated enterprise route area satisfies the feature scope and constitution constraints; no second build, project, or backend is introduced. |
