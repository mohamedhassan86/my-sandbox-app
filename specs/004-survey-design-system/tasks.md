# Tasks: Survey Design System

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-09-10

## Phase 1: Setup

**Purpose**: Create the design-system directory structure and record the budget decision
that the rest of the work depends on.

- [x] T001 Create the `src/styles/{tokens,base,layout,components,integrations}` directories for the layered design-system stylesheets
- [x] T002 Raise the `anyComponentStyle` (8 kB warn / 16 kB error) and `initial` (700 kB warn / 1.2 MB error) budgets in `angular.json` per the plan's Complexity Tracking table

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The token layer. Every user story consumes it, so it must land first.

- [x] T003 [P] Write primitive palettes (maroon, blue, pink, neutral, status, alpha) with the reference anchors in `src/styles/tokens/primitives.css`
- [x] T004 [P] Write the fluid type scale, font stacks, weights, line heights, letter spacing, and measures in `src/styles/tokens/typography.css`
- [x] T005 [P] Write the spacing, radius, elevation, motion, layout, breakpoint, and z-index scales in `src/styles/tokens/space.css`
- [x] T006 Write semantic color roles mapped onto primitives, including the three brand roles and the focus ring composite, in `src/styles/tokens/semantic.css`
- [x] T007 Write the base layer: reset, element defaults, focus ring, skip link, screen-reader-only helper, reduced-motion collapse, and forced-colors guard in `src/styles/base/{reset,elements,a11y}.css`
- [x] T008 Rewire the `src/styles.css` entry to import the layers in cascade order (primitives → semantic → typography → space → reset → elements → a11y → layout → components → integrations → compat)

**Checkpoint**: Tokens and base styles are loaded; the application renders with design-system
typography and canvas colors.

## Phase 3: User Story 1 - Foundations and brand roles (Priority: P1)

**Goal**: The three brand roles are usable independently and the whole app is token-driven.

**Independent Test**: Render the survey and confirm the canvas uses the tertiary role, the
brand chrome uses the primary role, selected answers and focus use the secondary role, and
no raw values remain outside the primitive layer.

- [x] T009 [US1] Add the container, section, stack, cluster, grid, split, and rail composition utilities in `src/styles/layout/composition.css`
- [x] T010 [US1] Add the typography role classes (`.ds-display`, `.ds-title`, `.ds-heading`, `.ds-prompt`, `.ds-body`, `.ds-support`, `.ds-eyebrow`, `.ds-numeric`) in `src/styles/base/elements.css`
- [x] T011 [US1] Build the legacy class bridge (`.container`, `.row`, `.col-*`, `.question-block`, `.form-*`, `.survey-*`) on top of the design-system classes in `src/styles/compat.css`

**Checkpoint**: The survey renders on the reference canvas with the design-system type scale;
US1 is demonstrable without any card, progress, or motion work.

## Phase 4: User Story 2 - Question cards and answer controls (Priority: P1)

**Goal**: Every question type is presented in a card with legible prompts, comfortable
targets, and visible resting/hover/focus/selected/invalid states.

**Independent Test**: Answer every question type, leave one required question empty, and
confirm selected, answered, and invalid states are all visible and not color-only.

- [x] T012 [P] [US2] Implement `.ds-card` (variants, padding steps, states, parts) in `src/styles/components/card.css`
- [x] T013 [P] [US2] Implement field, choice, tile, and file classes with invalid/valid states in `src/styles/components/field.css`
- [x] T014 [P] [US2] Implement button classes with the full state set in `src/styles/components/button.css`
- [x] T015 [US2] Implement alert, validation-message, badge, and status classes in `src/styles/components/feedback.css`
- [x] T016 [US2] Re-skin the shared survey layout, panels, and question cards onto the new classes in `src/app/survey/survey.css`
- [x] T017 [P] [US2] Re-skin the rating tiles with endpoint labels beneath and the reference selected state in `src/app/survey/components/rating-question/rating-question.css`
- [x] T018 [P] [US2] Re-skin the satisfaction tiles with the reference selected state in `src/app/survey/components/satisfaction-question/satisfaction-question.css`
- [x] T019 [US2] Re-skin the file upload drop zone in `src/app/survey/components/file-upload/file-upload.css`
- [x] T020 [US2] Wire validation/answered state styling to the existing markup (`.question-block`, `:has(app-validation-message)`, `[aria-invalid]`)

**Checkpoint**: The full answer surface matches the reference and shows all four interaction
states plus validation feedback.

## Phase 5: User Story 3 - Progress indicators and navigation (Priority: P2)

**Goal**: Progress and steps are readable, accessible, and usable at every viewport width.

**Independent Test**: Step through the survey and confirm the progress value, current step,
completed steps, and unreachable steps are all distinguishable without color alone.

- [x] T021 [US3] Implement progress bar classes (`--sm/md/lg/pill/indeterminate`) in `src/styles/components/progress.css`
- [x] T022 [US3] Implement step list classes with current/complete/upcoming states, compact rail mode, and disabled steps in `src/styles/components/progress.css`
- [x] T023 [US3] Re-skin the survey navigation (progress, step rail, compact mode) in `src/app/survey/components/survey-navigation/survey-navigation.css`
- [x] T024 [US3] Re-skin the completion summary as the complete-state card in `src/app/survey/components/completion-summary/completion-summary.css`

**Checkpoint**: Progress and navigation are visually complete, and the mobile rail keeps
progress and page position visible.

## Phase 6: User Story 4 - Motion and micro-interactions (Priority: P2)

**Goal**: Short, purposeful motion everywhere, fully collapsed under reduced motion.

**Independent Test**: Reload with reduced motion enabled — no entrance, selection, or
progress motion is perceptible; every state remains distinguishable.

- [x] T025 [US4] Implement entrance, hover-lift, selection, progress, and shimmer utilities in `src/styles/components/motion.css`
- [x] T026 [US4] Apply entrance motion to panels, cards, validation messages, and completion in the component stylesheets
- [x] T027 [US4] Verify the global reduced-motion block collapses every duration and disables transform movement in `src/styles/base/a11y.css`

**Checkpoint**: The interface feels responsive, and reduced motion is a no-op experience.

## Phase 7: User Story 5 - Themed third-party controls (Priority: P3)

**Goal**: The dropdown and toggle use design tokens for every visible part.

**Independent Test**: Open, filter, select, and clear the dropdown and toggle the switch;
no library default styling is visible.

- [x] T028 [US5] Map `--p-select-*`, `--p-togglebutton-*`, `--p-overlay-*`, and shared focus/form-field variables onto design-system tokens in `src/styles/integrations/primeng.css`
- [x] T029 [US5] Add the minimal scoped structural overrides (radius, typography, overlay shadow, filter field, option list, empty state) in `src/styles/integrations/primeng.css`

**Checkpoint**: Library controls are visually indistinguishable from design-system controls.

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Prove the contract, document it, and verify the build.

- [x] T030 [P] Implement the token parser, WCAG contrast math, and documentation-coverage helpers in `src/app/shared/design-system/design-token.contract.ts`
- [x] T031 [US1] Add the automated contract check (resolution, discipline, contrast, scale rules, motion, documentation coverage) in `src/app/shared/design-system/design-token.contract.spec.ts`
- [x] T032 [P] Update `src/index.html` (document title, description, theme-color, color-scheme) to match the design system
- [x] T033 [P] Update `README.md` with the design-system section, token entry point, and how to run the contract check
- [x] T034 Run the quickstart verification (contract check, full unit suite, production build) and record the results in `specs/004-survey-design-system/quickstart.md`
- [ ] T035 Review the rendered survey at 320 px, 768 px, and 1440 px in the browser preview, including reduced motion, and confirm the reference match (reviewer step: the checklist is in [quickstart.md](quickstart.md) §6 and the development server is running with preview hosts allowed)

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks every user story.
- **US1 → US2 → US3 → US4 → US5**: US2 consumes the layout/typography classes from US1;
  US3 and US4 style navigation and motion on top of the card primitives from US2; US5 themes
  library controls and only needs the token layer.
- **Polish (Phase 8)**: Depends on all delivered stories, since the contract check parses the
  final CSS.

### Parallel Opportunities

- T003-T005 are independent files and can be written in parallel.
- T012-T014 (card, field, button) are independent component stylesheets.
- T017-T018 (rating, satisfaction tiles) are independent.
- T030 and T032-T033 can run in parallel with the styling work once the token names are
  frozen by T003-T006.

## Implementation Strategy

### MVP First (US1 + US2)

1. Land the token layer and base styles (Phase 2).
2. Land composition/typography classes plus the compat bridge (US1).
3. Land cards, fields, tiles, and validation states (US2) — this is the reference experience
   for the respondent and already delivers the feature's main value.

### Incremental Delivery

1. US3 progress/steps, then US4 motion, then US5 library controls.
2. Finish with the automated contract check, documentation, and the recorded verification.

## Traceability Summary

- US1 covers FR-001, FR-002, FR-004, FR-005, FR-012, FR-016 and SC-001, SC-003.
- US2 covers FR-006, FR-009, FR-010, FR-011, FR-017 and SC-004, SC-005.
- US3 covers FR-007, FR-008 and SC-003.
- US4 covers FR-013 and SC-004.
- US5 covers FR-014.
- Phase 8 covers FR-003, FR-015 and SC-001, SC-002, SC-006, SC-007.
