# Phase 0 Research: Enterprise Application Foundation

Format: one `Decision / Rationale / Alternatives considered` block per technical unknown or
technology choice. All unknowns from the plan's Technical Context are resolved here; no
"NEEDS CLARIFICATION" markers remain.

## Decision: Product-area packaging — lazy route area in the existing SPA

- **Decision**: Ship the enterprise product as a **lazy-loaded Angular route area at
  `/enterprise/**`** inside the existing application. `app.routes.ts` gains one lazy child-route
  entry pointing at `src/app/enterprise/enterprise.routes.ts`; the existing `''` →
  SurveyViewComponent and `surveys/:surveyKey` routes are byte-for-byte unchanged. The enterprise
  shell (layout, header, navigation) is the route-area container; it never renders inside survey
  pages and vice versa.
- **Rationale**: Clarification (spec session 2026-09-09) chose "same application deliverable,
  dedicated route area". Lazy-loading keeps the enterprise payload (PrimeNG table/stepper/chart
  etc.) out of the initial survey-viewer bundle, preserves one build/preview/deploy, and gives a
  clean review URL (`/enterprise`).
- **Alternatives considered**: A second Angular application/project — rejected: two builds and
  deploy targets, duplicated shell tooling, and more CI surface than a demo needs. Re-rooting the
  app to the enterprise shell with surveys moved behind `/surveys` — rejected: displaces the
  survey viewer, violating FR-048.

## Decision: Dual visual identity — token sets scoped to the enterprise host

- **Decision**: Enterprise visual language is implemented as **semantic CSS custom-property token
  sets defined on the enterprise shell host element** (e.g., `app-enterprise-shell`), with mode
  variants applied as classes on that same host (`data-appearance="light|dark"`,
  `data-a11y="on"`). PrimeNG 22 components resolve their style tokens from CSS variables in
  scope at the element (the `--p-*`/`--*` custom-property layer), so defining the enterprise set
  on the host styles only the enterprise subtree. Survey-viewer styles and the global
  survey tokens in `src/styles.css` are untouched; the two identities never share a token source.
- **Rationale**: FR-048 + clarified "dual visual identity, governed per product area". Because
  PrimeNG variables inherit through the DOM, a scoped host class provides full isolation without
  a second theme build. Light/dark/accessibility are pure token-set swaps on the host, which is
  what makes FR-003/FR-004/SC-009 testable ("swap the set, everything restyles").
- **Alternatives considered**: A second PrimeNG theme globally swapped at `:root` — rejected:
  global theme would restyle survey-viewer PrimeNG controls (the toggle button already used
  there). A second Angular application with its own theme — rejected under the packaging
  decision.

## Decision: Appearance modes and system preferences

- **Decision**: A `preferences.service` owns `appearance: 'light' | 'dark' | 'system'` and
  `accessibilityMode: boolean`, persisted on-device. `system` resolves via
  `prefers-color-scheme` media query (live-updated on change); reduced motion is honored via
  `prefers-reduced-motion` and additionally forced when accessibility mode is on. All motion and
  theme state flows through the token sets on the enterprise host; there is no per-component
  theming logic.
- **Rationale**: FR-003–FR-005 and SC-009. Centralizing in one service + one host class keeps
  the "product-wide restyle with no reload" guarantee trivially testable.
- **Alternatives considered**: Per-component theme bindings — rejected as untestable drift; a
  third-party theme library — rejected as unnecessary weight over the CSS-variable approach.

## Decision: Persistence — namespaced localStorage via typed services

- **Decision**: All on-device user state is stored under a single namespaced key prefix
  (e.g., `enterprise.demo.v1.*`) in `localStorage`, written through typed services (preferences,
  views, favorites, drafts, activity cap, notification read state, onboarding completion). Each
  store is a small typed service exposing signals; serialization is versioned and defensive
  (corrupt/unparseable entries are dropped with a console warning, never thrown). "Reset demo
  data" clears the namespace after explicit typed confirmation and reloads to first-run state
  (FR-047). Fixture/collection data is never persisted.
- **Rationale**: FR-026 + clarified "on-device persistence covers only user-created state".
  localStorage matches the demo, single-user scope; typed services + versioned keys give
  durability without a state framework.
- **Alternatives considered**: IndexedDB — heavier than needed for < a few hundred KB of demo
  state. In-memory only — fails SC-006/SC-009 (persist across restart). A state library (NgRx/
  signals-store) — rejected as unnecessary framework weight for a demo area; Angular signals
  suffice.

## Decision: Fixture architecture — JSON assets + manifest + simulated service

- **Decision**: Enterprise content ships as versionable JSON fixtures under
  `public/enterprise-fixtures/**` (surveys, responses, participants, notifications, activity,
  quick-actions, help-content, shortcuts) with a `manifest.json` catalog, mirroring the survey
  viewer's `public/survey-manifest.json` pattern. A `fixture.service` loads them over HTTP
  through a `simulation.service` that applies deterministic latency (e.g., 250–700 ms) and an
  injectable failure mode (a test/`?fail=region`-style hook or a service flag) so skeleton,
  empty, error, and retry states are real (FR-039/FR-040/FR-046). A lightweight demo-event
  scheduler generates new notifications on an interval and on significant simulated actions so
  the notification center and badge are demonstrable live (FR-037).
- **Rationale**: FR-045–FR-047; matches the repository's established JSON-driven pattern and the
  constitution's JSON-Driven Domain Contract principle; content authors can swap the demo domain
  without code changes.
- **Alternatives considered**: Fixtures as TypeScript modules — rejected: content changes would
  require a rebuild, violating the swappable-content requirement. Hardcoded component state —
  rejected outright.

## Decision: Read-only collections and simulated actions

- **Decision**: Collections services expose read-only query results (search/filter/sort/paginate
  over in-memory fixture data). Mutating-style operations (bulk archive, delete, "launch survey"
  submission) run as **simulated transactions**: a `simulation.service` executes them with the
  same latency/failure controls, returns a typed outcome, and the UI reports success/error per the
  feedback vocabulary. Fixtures are not mutated; a completed "launch" may append to
  session-only derived state (e.g., a toast + activity entry + notification) but never rewrites
  fixture files or durable collection rows.
- **Rationale**: Clarification Q4 (read-only dataset). Gives every bulk/action UX pattern a
  realistic, deterministic lifecycle while eliminating a persistence/conflict subsystem.
- **Alternatives considered**: Durable mutation with conflict handling — rejected in
  clarification; in-memory session mutation — adds "stale after reload" edge cases without
  user value for a demo.

## Decision: Automated accessibility validation

- **Decision**: Add `axe-core` as a devDependency and assert axe results (no `critical`/`serious`
  violations) in component/page-level specs run in the jsdom unit-test builder; complement with
  scripted keyboard walkthrough specs (tab order, focus management, Escape handling) and a manual
  checklist per template (screen-reader pass, 320px reflow, 200% zoom, reduced motion). Target:
  every page template covered (SC-003).
- **Rationale**: SC-003 requires "automated accessibility checks with zero critical/serious
  violations"; axe-core is the de-facto standard and integrates with Vitest/jsdom; keyboard
  assertions cover what axe cannot.
- **Alternatives considered**: Lighthouse-only manual runs — not repeatable in CI/gates; a
  dedicated e2e a11y harness (Playwright + axe) — heavier than this demo needs and not part of the
  current toolchain.

## Decision: Global search implementation

- **Decision**: Client-side search over a lightweight index built from fixture content + app
  structure (areas/pages, records, saved views, actions), grouped by kind, with substring/word-
  prefix matching on ≥2 characters, debounced (~150 ms), keyboard-operable (arrows/Enter/Escape).
  A corrected suggestion is offered only when a single confident near-match exists (simple
  edit-distance heuristic); otherwise the empty state gives a browse path.
- **Rationale**: FR-016–FR-020. Demo dataset sizes (≤ ~40 rows per collection) make a client-side
  index instant and dependency-free; deterministic behavior keeps specs simple.
- **Alternatives considered**: Full-text search library (e.g., Fuse.js) — rejected as a needless
  dependency for the scale; server search — no backend in scope.

## Decision: Export format

- **Decision**: Export produces a client-generated **CSV** file (and JSON as a secondary format)
  from the current filtered/sorted result set (choice of current page or all matching rows),
  downloaded via a Blob + anchor. Export runs through the simulation layer so success/failure
  toasts and retry are demonstrable (FR-027).
- **Rationale**: CSV opens everywhere and is the standard enterprise "export" expectation;
  JSON supports the API-minded reviewer; client generation matches the local, no-backend demo.
- **Alternatives considered**: XLSX generation — adds a heavy dependency; server export — no
  backend in scope.

## Decision: Copy centralization

- **Decision**: All user-visible English copy lives in one typed copy module
  (`src/app/enterprise/copy/copy.ts`) as a nested, type-checked dictionary with a tiny
  interpolation helper for parameterized strings (e.g., "Archive {count} surveys?"); components
  never contain user-visible literals. Fixture-driven content (record titles, notification
  bodies) travels with the fixtures.
- **Rationale**: Clarification Q3 (English-only, centralized) + FR-051. A typed dictionary gives
  compile-time completeness for today and a mechanical path to a locale pipeline later; fixture
  copy stays data, per the domain-contract principle.
- **Alternatives considered**: Angular `$localize`/i18n pipeline now — rejected: full i18n
  machinery for a single locale adds build complexity with no present user value; inline strings
  — rejected outright by the clarification.
