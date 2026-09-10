# Tasks: Survey Dock Brand (GCC Maroon · Gold · Cream)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-09-10

**Organization**: Tasks are grouped by user story so each story stays independently
implementable and testable. Format: `[ID] [P?] [Story] Description` — `[P]` runs in
parallel (different files, no dependencies), `[USn]` maps the task to its story.

## Phase 1: Setup

**Purpose**: Prove the starting point is green before touching anything.

- [x] T001 Run the baseline verification (`pnpm exec vitest run src/app/core src/app/survey src/app/shared`, `pnpm exec prettier --check .`, `pnpm exec ng build`) and confirm all green; do not proceed on a red baseline
  - Baseline 2026-09-10: vitest 16 files / 121 tests green after adding the missing `import '@angular/compiler';` first line to 4 spec files (test-only, zero behavior change — the same line `survey-view.spec.ts` already had); `ng build` green (634 kB initial total). Repo-wide `prettier --check` was already red on 74 files before this feature, so every file touched by this feature is verified per-file clean instead of reformatting the repository.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The token delta, the JSON amendment, and the shared domain helpers. Every
user story consumes these, so they land first. Check/contract-test tasks are written
FIRST and MUST fail before their implementation tasks.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Extend `CONTRAST_PAIRS` in `src/app/shared/design-system/design-token.contract.ts` with the 11 added pairs from [contracts/brand-delta.md](contracts/brand-delta.md) §5 (check fails until T004–T005 land)
- [x] T003 Extend `src/app/shared/design-system/design-token.contract.spec.ts` to merge documented tokens from the 004 + 006 contracts and to assert the shell-geometry tokens (existence, `shell-sizes.md` documentation, use on shell selectors, drawer-cap formula) (fails until T004–T006 and Phase 4 land)
- [x] T004 [P] Add the gold, cream, and red ramps, `--ds-maroon-950`, and the dock alphas in `src/styles/tokens/primitives.css` per [contracts/brand-delta.md](contracts/brand-delta.md) §1
- [x] T005 Re-point the canvas/selection/tertiary/danger/focus roles and add the accent + dock roles in `src/styles/tokens/semantic.css` per [contracts/brand-delta.md](contracts/brand-delta.md) §§2–3 (depends on T004)
- [x] T006 [P] Add the shell layout tokens in `src/styles/tokens/space.css` and `--ds-font-weight-extrabold` in `src/styles/tokens/typography.css` per [contracts/brand-delta.md](contracts/brand-delta.md) §4
- [x] T007 [P] Add the star, shield-check, clipboard, chevrons, and upload SVG-mask tokens in `src/styles/tokens/icons.css` per [contracts/brand-delta.md](contracts/brand-delta.md) §1
- [x] T008 Add the optional `estimatedMinutes`, `description`, and `icon` fields in `src/app/core/models/survey.models.ts` with validation in `src/app/core/validators/survey-config.validator.ts` (+ spec updates) per [contracts/brand-delta.md](contracts/brand-delta.md) §6
- [x] T009 Add pure `isQuestionAnswered()` + `pageProgress()` in `src/app/core/validators/response.validator.ts` (+ spec), and refactor `SurveyPageComponent.isAnsweredValue` in `src/app/survey/pages/survey-page/survey-page.ts` to delegate to the single definition
- [x] T010 Add page descriptions, page icons, and time estimates to the `public/survey.json` and `public/survey-8-step.json` fixtures, satisfying the T008 rules (depends on T008)

**Checkpoint**: Token/contrast/docs assertions green; `ng build` green; existing suites
pass; the app renders with the new palette on the old layout.

## Phase 3: User Story 1 - Survey wears the GCC dock brand (Priority: P1) 🎯 MVP

**Goal**: The cream/maroon/gold brand covers every survey with a single-source value
layer and zero behavior change.

**Independent Test**: Open each catalog survey and confirm the cream canvas + backdrop,
white panels, maroon chrome/actions, gold accents, and extrabold sans headings; answer,
navigate, and submit to confirm behavior is unchanged (quickstart §2).

- [x] T011 [US1] Render the cream canvas, fading dot pattern, and two ambient washes on existing hooks in `src/styles/base/elements.css` (no new markup, no assets)
- [x] T012 [US1] Apply extrabold sans headings and the brand type roles (headings on `--ds-font-text`, display role kept available) in `src/styles/base/elements.css` (same file as T011 — sequential)
- [x] T013 [US1] Verify the PrimeNG dropdown and toggle inherit the rebrand through the token bridge and fix only deliberate semantic-choice mappings in `src/styles/integrations/primeng.css`
- [x] T014 [US1] Re-skin the compat-bridge surfaces (`.question-block`, `.form-*`, panels) to brand fills, borders, and text in `src/styles/compat.css`

**Checkpoint**: US1 is fully demonstrable side-by-side with `public/index.html` on both
fixtures without any dock, chrome, or summary work.

## Phase 4: User Story 2 - Dock sidebar navigation (Priority: P1)

**Goal**: Fixed dock with live steps + progress ring on desktop, icon rail when collapsed,
slide-in drawer on mobile, existing gating untouched.

**Independent Test**: Step through a multi-page survey on desktop and mobile; dock counts,
bars, ring, and status agree with answered-over-total; collapse/expand and drawer
open/close preserve answers and position; forward steps stay gated as before
(quickstart §3).

- [x] T015 [P] [US2] Write unit tests for the session answered/total computeds and the pure `progressBand()` mapper in `src/app/survey/services/survey-session.service.spec.ts` (fail first)
- [x] T016 [US2] Add `answeredQuestionCount`/`totalQuestionCount` computeds and the `progressBand` static in `src/app/survey/services/survey-session.service.ts` (no rule changes)
- [x] T017 [US2] Add the `progress` input (per-page answered/total) with counts, mini-bars, and ring data in the `src/app/survey/components/survey-navigation/survey-navigation.ts` template (+ spec)
- [x] T018 [US2] Create the dock/rail/drawer/backdrop styles in new `src/app/survey/survey-shell.css` per [contracts/shell-sizes.md](contracts/shell-sizes.md) R-01–R-04
- [x] T019 [US2] Restructure the `src/app/survey/pages/survey-view/survey-view.ts` template into the dock shell (header/live-survey card/steps/footer ring), add the `dockCollapsed` signal, move the drawer breakpoint to 1024 px, handle `Escape`, and register `survey-shell.css` in the component styles
- [x] T020 [US2] Re-skin the step treatments (state tiles, gold active, green completed, mini-bars, rail mode, non-color cues) in `src/app/survey/components/survey-navigation/survey-navigation.css` (depends on T017 hooks)

**Checkpoint**: US1 + US2 work together and US2's dock is independently verifiable; the
shell-geometry contract assertions go green.

## Phase 5: User Story 3 - Topbar, progress card, survey card chrome (Priority: P2)

**Goal**: Sticky topbar + mobile pills, progress card, and survey-card header/footer frame
every page.

**Independent Test**: Page through a survey at desktop and mobile widths; topbar sticks
with breadcrumb + title, pills track steps on mobile, the progress card advances, and the
footer shows Back/Continue/Submit per position (quickstart §4).

- [x] T021 [US3] Add the topbar markup (menu toggle, breadcrumb, title) and the mobile step-pill strip in `src/app/survey/pages/survey-view/survey-view.ts` (depends on T019 shell)
  - Landed inside the T019 rewrite (topbar/menu/crumbs/meta-pills + `mobile-pills` + `progress-card` markup are all in the new template); styles follow in T022.
- [x] T022 [US3] Add the topbar, pills, and progress-card styles in `src/app/survey/survey-shell.css` per [contracts/shell-sizes.md](contracts/shell-sizes.md) R-06, R-07, R-09
- [x] T023 [US3] Add the survey-card header (step badge, required/optional counts, JSON-driven title/description/icon) and footer action row in `src/app/survey/pages/survey-view/survey-view.ts` (depends on T019 shell)
- [x] T024 [US3] Add the survey-card header gradient, footer treatments, maroon Continue (+ transform-based sheen) and gold Submit styles in `src/styles/components/card.css` per [contracts/shell-sizes.md](contracts/shell-sizes.md) R-08

**Checkpoint**: US1–US3 chrome is visually complete and every page carries progress +
position without color-only cues.

## Phase 6: User Story 4 - Branded questions, answers, validation feedback (Priority: P2)

**Goal**: All eight question types + attachments wear the brand; validation surfaces as
rose errors + toasts; nothing behavior-changing.

**Independent Test**: Render every question type, exercise hover/focus/selected states,
leave a required question empty (rose error + toast + announcement), and clear an
optional answer (clean resting state) (quickstart §5).

- [x] T025 [P] [US4] Write unit tests for the pure `ratingReadout()` mapper (`N / max`, Poor…Excellent descriptor on 5-step scales only) in a new `src/app/survey/components/rating-question/rating-question.spec.ts` (fail first)
- [x] T026 [P] [US4] Write unit tests for the pure toast mappers (`toastForNavigation`, `toastForSubmission`) in a new `src/app/survey/pages/survey-view/survey-view.spec.ts` (fail first)
- [x] T027 [US4] Re-skin choice treatments (hover lift + gold border, maroon selected + tint + check badge) in `src/styles/components/field.css` and `src/styles/compat.css`
- [x] T028 [US4] Add the gold selected state, star glyph, and readout line to `src/app/survey/components/rating-question/rating-question.ts` (+ `rating-question.css`)
- [x] T029 [P] [US4] Re-skin the satisfaction tiles to the brand selected state in `src/app/survey/components/satisfaction-question/satisfaction-question.css`
- [x] T030 [P] [US4] Re-skin the toggle to the brand on/off treatment and verify the dropdown field/overlay/options against the reference (bridge inherits; fix deliberate mappings only)
- [x] T031 [US4] Re-skin the dropzone (dashed/hover/active states, success rows, remove action) in `src/app/survey/components/file-upload/file-upload.css`
- [x] T032 [US4] Wire the rose error treatment (message + icon + card border/tint, announced, only after validation runs) and answered cues via existing hooks in `src/styles/components/feedback.css` and `src/styles/compat.css`
- [x] T033 [US4] Add the toast region markup, signal, and auto-dismiss to `src/app/survey/pages/survey-view/survey-view.ts` with styles in `src/app/survey/survey-shell.css` per [contracts/shell-sizes.md](contracts/shell-sizes.md) R-10 (depends on T019 shell)

**Checkpoint**: Every answer surface matches the reference with all interaction states
plus announced validation feedback; US1–US4 are independently functional.

## Phase 7: User Story 5 - Branded completion summary (Priority: P3)

**Goal**: Post-submission summary with medallion, `100% complete`, survey-derived tiles,
new-response action, and motion-safe celebration.

**Independent Test**: Submit a complete survey; confirm the summary reflects _this_
survey's pages (never fixed demo fields) and that reduced motion removes all celebration
movement while success stays unmistakable (quickstart §6).

- [x] T034 [P] [US5] Write unit tests for pure `buildCompletionTiles()` (per-page `n/m answered` + files tile + overflow cap) in new `src/app/survey/presenters/completion-tiles.spec.ts` (fail first)
- [x] T035 [US5] Implement `buildCompletionTiles()` in new `src/app/survey/presenters/completion-tiles.ts`
- [x] T036 [US5] Add the `tiles` input, medallion/summary-tiles/actions markup, and re-skin in `src/app/survey/components/completion-summary/completion-summary.ts` (+ `completion-summary.css`)
- [x] T037 [US5] Add the celebration ring/pulse keyframes (`opacity`/`transform` only) in `src/styles/components/motion.css` and apply them to the completion styles

**Checkpoint**: All user stories are independently functional; the full flow matches the
reference end to end.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Record the measured geometry, document the brand, and prove the whole
feature.

- [ ] T038 Measure and fill the shell-size table in [contracts/shell-sizes.md](contracts/shell-sizes.md) §2 at 320/375/768/1280/1440 (16 px root) and confirm ≤1 px drift from the shipped CSS
- [x] T039 [P] Update `README.md` (dock-brand section, optional JSON fields, merged contract check, shell geometry contract)
- [x] T040 [P] Update `src/index.html` (document title, description, theme-color) to the dock brand
- [x] T041 Run the full verification (`pnpm exec vitest run src/app/core src/app/survey src/app/shared`, `pnpm exec prettier --check .`, `pnpm exec ng build`) and record the results in [quickstart.md](quickstart.md) §8
- [ ] T042 Browser review pass at 320/375/768/1280/1440 + 200% zoom + keyboard-only + reduced motion per [quickstart.md](quickstart.md) §§2–7 (reviewer step; confirm zero reference mismatches and identical behavior for the same inputs)
  - Agent static pre-review 2026-09-10 (live pass still needs a human + browser): reduced-motion universal collapse covers `dock-ping`, `ds-celebrate-*`, sheen, and all transitions; keyboard paths are native buttons/inputs with visible rings (gold on dock) + Escape-to-close + aria-current/labels on steps; z-order sticky 10 < overlay 40 < dock 50 < toast 60; zoom reflows through the 1024 px breakpoint; fixed bug found in review (`.visually-hidden` → `.ds-sr-only`, class did not exist). Serve with `pnpm start` and open `/` (4-page) + `/surveys/extended-feedback` (6-step).

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — establishes the green baseline.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks every user story. T002–T003 are
  written first and stay red until their implementation tasks land.
- **US1 → US2 → US3 → US4 → US5**: US1 establishes the brand surfaces; US2 builds the
  dock shell that US3 (topbar/cards) and US4 (toast) extend in the same two files
  (`survey-view.ts`, `survey-shell.css`); US5 is independent of US2–US4 and needs only
  the foundation + US1 brand.
- **Polish (Phase 8)**: Depends on all delivered stories — T038 measures final CSS and
  T041 verifies the final tree.

### Within Each Phase

- Check/test tasks (T002–T003, T015, T025–T026, T034) MUST be written and FAIL before
  their implementation tasks.
- T005 follows T004 (semantic roles reference the new ramps); T010 follows T008
  (fixtures must satisfy the new validation); T020 follows T017 (CSS follows template
  hooks); T019 precedes T021/T023/T033 (same template file, sequential edits).
- T041–T042 run last, in order.

### Parallel Opportunities

- T004, T006, T007 are independent token files and can be written in parallel; T008–T009
  (different validator/model files) can join them.
- T015, T025, T026, T034 (test tasks in different spec files) can run in parallel once
  the foundation lands.
- T029–T031 (satisfaction, toggle/dropdown, file CSS) are independent stylesheets.
- T039–T040 can run in parallel with any story work once token/JSON names are frozen by
  Phase 2.
- US5 (Phase 7) can proceed in parallel with US2–US4 (different files throughout).

## Implementation Strategy

### MVP First (US1 + US2)

1. Land the token delta, JSON amendment, and shared helpers (Phase 2) — the check goes
   green up to the shell-geometry assertions.
2. Land the brand surfaces + backdrop (US1) — every survey wears the brand.
3. Land the dock shell (US2) — the signature layout; shell-geometry assertions go green.
4. **STOP and VALIDATE**: quickstart §§2–3 on both fixtures; this is the reference
   experience for navigation and already delivers the feature's main value.

### Incremental Delivery

1. US3 chrome, then US4 questions/validation, then US5 completion (US5 may overlap).
2. Finish with measured geometry, documentation, recorded verification, and the browser
   review pass.

## Traceability Summary

- Phase 2 covers FR-001 (ramps/roles), FR-015 (contrast inputs), FR-017 (additive JSON, fixtures), FR-018 (contract-check merge), FR-019 (single answered-state definition) and SC-002, SC-003 (inputs), SC-006 (no regressions).
- US1 covers FR-001 (roles applied), FR-002 (canvas/backdrop), FR-003 (type), FR-016 (no CDN: masks, CSS backdrop) and SC-001 (brand parity).
- US2 covers FR-004–FR-007 (dock/rail/drawer/steps/ring), FR-014 (drawer/viewports), FR-019 (gating unchanged) and SC-001 (dock parity), SC-004 (viewports).
- US3 covers FR-008–FR-010 (topbar/pills/progress card/survey card) and SC-001 (chrome parity), SC-004.
- US4 covers FR-011 (all question types), FR-012 (errors/toasts), FR-015 (focus/targets/cues/motion) and SC-003.
- US5 covers FR-013 (summary/celebration) and SC-001 (summary parity).
- Phase 8 covers FR-018 (measured shell contract, docs) and SC-002, SC-005, SC-006.

## Notes

- [P] tasks = different files, no dependencies; [USn] maps each task to its story.
- Never edit `public/index.html` — it is the read-only reference.
- Verify check/test tasks fail before implementing; commit after each task or logical group.
- Stop at any checkpoint to validate the story independently per its quickstart section.
- Behavior parity is the release bar: for the same inputs, answer values, validation messages, gating, and payloads must be identical before/after (T041 + T042).
