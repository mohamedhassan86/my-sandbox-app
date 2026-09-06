# Tasks: Toggle Button Question Type

**Input**: Design documents from `/specs/002-toggle-button-question/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Included because the project constitution requires unit and integration
coverage for every feature and a production build before review.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment.

## Phase 1: Setup

**Purpose**: Prepare the feature's new component directory; no new dependencies are
required (the feature reuses existing Angular/PrimeNG/PrimeFlex/Vitest tooling).

- [X] T001 Create the `src/app/survey/components/toggle-button-question/` directory for the new standalone component

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared domain model so every user story can build on a
consistent `toggle_button` type and a boolean-capable answer value.

- [X] T002 [P] Add the `ToggleButtonQuestion` interface, add `'toggle_button'` to `QuestionType`, and add it to the `Question` union in `src/app/core/models/survey.models.ts`
- [X] T003 [P] Widen `Answer.value` from `string | string[] | null` to `string | string[] | boolean | null` in `src/app/core/models/response.models.ts`
- [X] T004 Update the `value` input type on `QuestionRendererComponent` to include `boolean` in `src/app/survey/components/question-renderer/question-renderer.ts`
- [X] T005 Update `answerFor`, `isAnsweredValue`, and `findAnswerValue` to accept and handle boolean answer values in `src/app/survey/pages/survey-page/survey-page.ts`

**Checkpoint**: Shared model types recognize `toggle_button` and boolean answers before
any story-specific validation, rendering, or submission work begins.

## Phase 3: User Story 1 - Author defines a toggle button question (Priority: P1)

**Goal**: Let a survey author add a `toggle_button` question to a survey's JSON
definition and have it load and render without any application code changes.

**Independent Test**: Load a survey JSON file containing a `toggle_button` question
(with and without `options.onLabel`/`offLabel`) and verify it loads without validation
errors and the question renders on the correct page; loading a definition with an
invalid (non-boolean) `defaultValue` must produce a visible configuration error.

### Tests for User Story 1

- [X] T006 [P] [US1] Add schema validator tests for valid `toggle_button` questions, missing `options` (defaults applied), and invalid non-boolean `defaultValue` in `src/app/core/validators/survey-config.validator.spec.ts`
- [X] T007 [P] [US1] Add `toggle_button` rendering coverage (renders the standalone component for the type) to `src/app/survey/components/question-renderer/question-renderer.spec.ts`

### Implementation for User Story 1

- [X] T008 [US1] Add `toggle_button` to the recognized question type set and validate `defaultValue` (boolean) and `options.onLabel`/`options.offLabel` (non-empty strings when present) in `src/app/core/validators/survey-config.validator.ts`
- [X] T009 [US1] Implement the `ToggleButtonQuestionComponent` (label, description, on/off label display, default-off render) using the existing `form-check`/`form-check-input` conventions in `src/app/survey/components/toggle-button-question/toggle-button-question.ts`
- [X] T010 [US1] Wire the `@case ('toggle_button')` branch into the template and `componentFor` helper in `src/app/survey/components/question-renderer/question-renderer.ts`
- [X] T011 [US1] Add one `toggle_button` question (e.g. `enable_notifications`, "Enable Notifications", `defaultValue: false`, `options.onLabel: "Enabled"`, `options.offLabel: "Disabled"`) to page `P1` in `public/survey.json`

**Checkpoint**: A survey JSON containing a `toggle_button` question loads, validates,
and renders end to end; `public/survey.json` demonstrates the new type on its first page.

## Phase 4: User Story 2 - Respondent answers a toggle button question (Priority: P1)

**Goal**: Let a respondent see the toggle rendered as a switch showing the correct
on/off label and change its value by interacting with the control.

**Independent Test**: Render a page containing a `toggle_button` question, toggle it,
and confirm the displayed label and underlying answer value update accordingly.

### Tests for User Story 2

- [X] T012 [P] [US2] Add component tests for initial off-state label, toggling to on/off, and emitted `Answer` value in `src/app/survey/components/toggle-button-question/toggle-button-question.spec.ts`
- [X] T013 [P] [US2] Add survey-page integration tests asserting a toggle answer is preserved and reflected across navigation in `src/app/survey/pages/survey-page/survey-page.spec.ts`

### Implementation for User Story 2

- [X] T014 [US2] Implement the toggle interaction handler that flips the boolean value and emits `{ questionId, value }` on change in `src/app/survey/components/toggle-button-question/toggle-button-question.ts`
- [X] T015 [US2] Ensure the label displayed next to the control switches immediately between `options.onLabel` and `options.offLabel` based on the current value in `src/app/survey/components/toggle-button-question/toggle-button-question.ts`

**Checkpoint**: Respondents can toggle the control, see the correct label at every
state, and the survey page correctly preserves and displays the boolean answer.

## Phase 5: User Story 3 - Toggle answers are validated and submitted (Priority: P2)

**Goal**: Ensure every submitted `toggle_button` answer is a genuine boolean, reject
malformed values, and persist the response in the documented `{ "<question_id>": <boolean> }` format.

**Independent Test**: Submit responses with valid boolean values, and separately with
invalid values (`null`, string, number, array), and verify acceptance or rejection
respectively; verify a `required: true` toggle with no value (no default, no
interaction) is rejected.

### Tests for User Story 3

- [X] T016 [P] [US3] Add response validator tests rejecting `null`, string, number, and array values for a `toggle_button` question with a question-specific message in `src/app/core/validators/response.validator.spec.ts`
- [X] T017 [P] [US3] Add response validator tests confirming a `required: true` toggle passes when a `defaultValue` is present (no interaction) and fails only when no value is present at all in `src/app/core/validators/response.validator.spec.ts`
- [X] T018 [P] [US3] Add a submission integration test confirming a toggle answer of `true` is submitted as `{ "<question_id>": true }` in `src/app/core/services/response-submission.service.spec.ts`

### Implementation for User Story 3

- [X] T019 [US3] Add a strict boolean-only type check for `toggle_button` answers (reject `null`, strings, numbers, arrays) alongside the existing required-empty check in `src/app/core/validators/response.validator.ts`

**Checkpoint**: Toggle answers are validated as genuine booleans before page
navigation and before submission, and submitted responses match the documented format.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality and documentation across all stories.

- [X] T020 [P] Add keyboard-operability and accessible-name assertions for the toggle control in `src/app/survey/components/toggle-button-question/toggle-button-question.spec.ts`
- [X] T021 Update `README.md` with the `toggle_button` question type and its schema fields
- [X] T022 Run the validation commands from `specs/002-toggle-button-question/quickstart.md` (tests, build) and record results

## Phase 7: Migrate Toggle Control to PrimeNG ToggleButton

**Purpose**: Replace the native `<input type="checkbox" role="switch">` markup with
PrimeNG's `ToggleButton` (`primeng/togglebutton`, `p-togglebutton`) per the updated
rendering-approach decision in `specs/002-toggle-button-question/research.md`, reusing
the already-installed PrimeNG dependency instead of a hand-built switch control.

**Independent Test**: Render a page containing the `toggle_button` question and
confirm it displays as a PrimeNG toggle button showing `options.onLabel`/`offLabel`,
responds to mouse click and keyboard (Space/Enter), and still emits the same
`{ questionId, value: boolean }` answer shape consumed by validation and submission.

### Tests for PrimeNG ToggleButton Migration

- [X] T023 [P] [US1] Update rendering tests to assert `ToggleButtonQuestionComponent` binds `onLabel`/`offLabel` and the checked value to PrimeNG's `ToggleButton` inputs in `src/app/survey/components/toggle-button-question/toggle-button-question.spec.ts`
- [X] T024 [P] [US2] Add/adjust tests confirming the `onChange` event from `p-togglebutton` (`ToggleButtonChangeEvent.checked`) is translated into an emitted `Answer` in `src/app/survey/components/toggle-button-question/toggle-button-question.spec.ts`

### Implementation for PrimeNG ToggleButton Migration

- [X] T025 [US1] Import `ToggleButton` from `primeng/togglebutton` and replace the native checkbox markup with `<p-togglebutton [onLabel]="..." [offLabel]="..." [ngModel]="checked()" (onChange)="toggle($event.checked)" />` in `src/app/survey/components/toggle-button-question/toggle-button-question.ts`
- [X] T026 [US2] Update the `toggle()` handler to accept the `ToggleButtonChangeEvent.checked` boolean (instead of the native `$event.target.checked`) and keep emitting `{ questionId, value: checked }` in `src/app/survey/components/toggle-button-question/toggle-button-question.ts`
- [X] T027 [US1] Keep the question label, required marker, and description rendering (`form-label`, `form-text`) around the `p-togglebutton` element for consistency with other question renderers in `src/app/survey/components/toggle-button-question/toggle-button-question.ts`
- [X] T028 Run the full test suite and production build to confirm the migration does not regress validation, submission, or the production bundle

**Checkpoint**: The toggle question renders and behaves identically from a
respondent/validation/submission perspective, now backed by PrimeNG's `ToggleButton`
instead of a native checkbox.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001 can begin immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Phase 2. US1 is the MVP; US2 builds on the
  component US1 creates; US3 builds on the validator changes and can be tested once
  US1's schema support and US2's interaction exist.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.
- **PrimeNG Migration (Phase 7)**: Depends on the component created in Phase 3 (US1)
  and the interaction behavior from Phase 4 (US2); can proceed after Phase 6 or in
  parallel with it since it only touches the toggle component's template/handler.

### User Story Dependencies

- **US1**: Depends on T002-T005; MVP scope (schema support + basic rendering).
- **US2**: Depends on T009-T010 (the component and renderer wiring from US1).
- **US3**: Depends on T003 (widened `Answer.value`) and benefits from US1/US2 being
  in place to exercise the full load-render-answer-submit path, but its validator
  changes (T019) are independently testable against `response.validator.ts` alone.

### Parallel Opportunities

- T002 and T003 can run in parallel (different files).
- In US1, T006-T007 can run in parallel; T008 and T009 can run in parallel before T010 integration.
- In US2, T012-T013 can run in parallel.
- In US3, T016-T018 can run in parallel before T019 implementation.
- T020-T021 can run in parallel after all story behavior is available.
- T023-T024 can run in parallel before the Phase 7 migration implementation; T025-T027 touch the same file and proceed in sequence; T028 remains last.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundational model changes.
2. Complete Phase 3 US1: schema validation, the toggle component (default render), and
   the sample `public/survey.json` question.
3. Run the US1 independent test and confirm the survey loads and renders the toggle.

### Incremental Delivery

1. Add US2 interaction behavior (toggle switching, label updates) and verify with
   component/integration tests.
2. Add US3 strict boolean validation for required and malformed-value handling.
3. Complete Phase 6 polish, documentation, and quickstart validation.
4. Migrate the toggle control's rendering to PrimeNG's `ToggleButton` (Phase 7) without
   changing the schema, validation, or submission contracts.

## Traceability Summary

- US1 covers FR-001, FR-002, FR-003, FR-004 (initial render), and SC-001.
- US2 covers FR-004, FR-005, and SC-004.
- US3 covers FR-006, FR-007, FR-008, and SC-002, SC-003.
- FR-009 (support across schema validation, UI rendering, data persistence, response
  submission contracts, and response processing/summary logic) is satisfied
  cumulatively by Phases 2-5; the completion-summary and submission services already
  operate generically on `Answer[]` and require no `toggle_button`-specific branching.
- Phase 7 changes only the rendering technology (PrimeNG `ToggleButton` instead of a
  native checkbox) behind the same `Question`/`Answer` contracts; it does not add or
  change functional requirements.
