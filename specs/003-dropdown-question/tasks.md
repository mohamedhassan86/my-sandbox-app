# Tasks: Dropdown Question Type

**Input**: Design documents from `/specs/003-dropdown-question/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Included because the project constitution requires unit and integration
coverage for every feature and a production build before review.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment.

## Phase 1: Setup

**Purpose**: Prepare the feature's new component directory; no new dependencies are
required (the feature reuses existing Angular/PrimeNG/PrimeFlex/Vitest tooling).

- [X] T001 Create the `src/app/survey/components/dropdown-question/` directory for the new standalone component

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the shared domain model so every user story can build on a
consistent `dropdown` type. No answer-value widening is needed (dropdown answers are
strings, already supported), and no `survey-page` or renderer input-type changes are
needed (both already handle `string | null`).

- [X] T002 Add the `DropdownQuestion` interface, add `'dropdown'` to `QuestionType`, and add it to the `Question` union in `src/app/core/models/survey.models.ts`

**Checkpoint**: Shared model types recognize `dropdown` before any story-specific
validation, rendering, or submission work begins.

## Phase 3: User Story 1 - Author defines a dropdown question (Priority: P1)

**Goal**: Let a survey author add a `dropdown` question to a survey's JSON definition
and have it load and render without any application code changes.

**Independent Test**: Load a survey JSON file containing a `dropdown` question and
verify it loads without validation errors and the question renders blank (no
placeholder, no preselection) on the correct page; loading a definition with missing or
empty `options`, duplicate option values, or an option missing its label/value must
produce a visible configuration error.

### Tests for User Story 1

- [X] T003 [P] [US1] Add schema validator tests for a valid `dropdown` question, missing/empty `options`, duplicate option values, and options missing label/value in `src/app/core/validators/survey-config.validator.spec.ts`
- [X] T004 [P] [US1] Add `dropdown` rendering coverage (maps to the standalone component for the type) to `src/app/survey/components/question-renderer/question-renderer.spec.ts`

### Implementation for User Story 1

- [X] T005 [US1] Add `dropdown` to the recognized question type set and to the selectable-options validation branch (non-empty options, non-empty label/value, unique values) in `src/app/core/validators/survey-config.validator.ts`
- [X] T006 [US1] Implement the `DropdownQuestionComponent` render skeleton (label, required marker, PrimeNG `Select` bound to the static options with `optionLabel`/`optionValue`, accessible question-label binding, no placeholder, blank initial render; interaction bindings follow in US2) in `src/app/survey/components/dropdown-question/dropdown-question.ts`
- [X] T007 [US1] Wire the `@case ('dropdown')` branch into the template and `componentFor` helper (including widening the `componentFor` return union with `'dropdown'`) in `src/app/survey/components/question-renderer/question-renderer.ts`
- [X] T008 [US1] Add a required `dropdown` question (e.g. `country_of_residence`, "Country of residence") and an optional `dropdown` question (to demonstrate clearing) to page `P1` in `public/survey.json`

**Checkpoint**: A survey JSON containing a `dropdown` question loads, validates, and
renders end to end; `public/survey.json` demonstrates the new type on its first page.

## Phase 4: User Story 2 - Respondent answers a dropdown question (Priority: P1)

**Goal**: Let a respondent expand the list, filter long option lists by typing, select
exactly one option, change the selection, and clear the selection on optional questions.

**Independent Test**: Render a page containing a `dropdown` question, expand and filter
the list, select an option, change it, and (on an optional question) clear it, and
confirm the displayed state and underlying answer value update accordingly at each step.

### Tests for User Story 2

- [X] T009 [P] [US2] Add component tests for blank initial state, select/change value helpers, label resolution, clearable flag, and clear-emits-`null` answer shape in `src/app/survey/components/dropdown-question/dropdown-question.spec.ts` (filtering is PrimeNG-owned and verified manually via quickstart step 2)
- [X] T010 [P] [US2] Add survey-page integration tests asserting a dropdown answer is preserved and reflected across navigation in `src/app/survey/pages/survey-page/survey-page.spec.ts`

### Implementation for User Story 2

- [X] T011 [US2] Implement the selection handlers that emit `{ questionId, value }` on change and `{ questionId, value: null }` on clear, backed by unit-testable answer-shape helpers, and add the `(onChange)`/`(onClear)` template bindings in `src/app/survey/components/dropdown-question/dropdown-question.ts`
- [X] T012 [US2] Bind the clear affordance to optional questions only (`showClear` when not required), enable filtering (`filter` by label, contains match), and configure the no-match filter message ("No options match your search") in `src/app/survey/components/dropdown-question/dropdown-question.ts`

**Checkpoint**: Respondents can filter, select, change, and (when optional) clear the
dropdown, and the survey page correctly preserves and displays the string answer.

## Phase 5: User Story 3 - Dropdown answers are validated and submitted (Priority: P2)

**Goal**: Ensure every submitted `dropdown` answer is a string exactly matching a
predefined option value, reject unknown or non-string values, enforce required
selections, and persist the response in the documented
`{ "<question_id>": "<selected_value>" }` format.

**Independent Test**: Submit responses with valid option values, and separately with
invalid values (unknown string, number, boolean, array) and with no selection on a
`required: true` question, and verify acceptance or rejection respectively.

### Tests for User Story 3

- [X] T013 [P] [US3] Add response validator tests rejecting unknown strings and non-string values (number, boolean, array) for a `dropdown` question with a question-specific message in `src/app/core/validators/response.validator.spec.ts`
- [X] T014 [P] [US3] Add response validator tests confirming a `required: true` dropdown fails with no selection and an optional dropdown passes unselected in `src/app/core/validators/response.validator.spec.ts`
- [X] T015 [P] [US3] Add a submission integration test confirming a dropdown answer is submitted as `{ "<question_id>": "<selected_value>" }` in `src/app/core/services/response-submission.service.spec.ts`

### Implementation for User Story 3

- [X] T016 [US3] Add a string-in-options check for `dropdown` answers (reject unknown strings and non-string values) alongside the existing required-empty check in `src/app/core/validators/response.validator.ts`

**Checkpoint**: Dropdown answers are validated as known option-value strings before page
navigation and before submission, and submitted responses match the documented format.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality and documentation across all stories.

- [X] T017 [P] Add accessible-name assertions (non-empty label resolution for every option) for the dropdown control in `src/app/survey/components/dropdown-question/dropdown-question.spec.ts` (keyboard traversal is verified manually via quickstart step 2)
- [X] T018 Update `README.md` with the `dropdown` question type and its schema fields
- [X] T019 Run the validation commands from `specs/003-dropdown-question/quickstart.md` (tests, build) and record results

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001 can begin immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Stories (Phases 3-5)**: Depend on Phase 2. US1 is the MVP; US2 builds on the
  component US1 creates; US3's validator changes are independently testable but exercise
  the full path once US1/US2 exist.
- **Polish (Phase 6)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1**: Depends on T002; MVP scope (schema support + basic rendering).
- **US2**: Depends on T006-T007 (the component and renderer wiring from US1).
- **US3**: Depends on T002 (the `DropdownQuestion.options` model for the membership
  check) and benefits from US1/US2 being in place to exercise the full
  load-render-answer-submit path, but its validator changes (T016) are independently
  testable against `response.validator.ts` alone.

### Parallel Opportunities

- In US1, T003-T004 can run in parallel; T005 and T006 can run in parallel before T007 integration.
- In US2, T009-T010 can run in parallel; T011-T012 touch the same file and proceed in sequence.
- In US3, T013-T015 can run in parallel before T016 implementation.
- T017-T018 can run in parallel after all story behavior is available; T019 remains last.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundational model changes.
2. Complete Phase 3 US1: schema validation, the dropdown component (blank render with
   options, filter, no placeholder), and the sample `public/survey.json` questions.
3. Run the US1 independent test and confirm the survey loads and renders the dropdown.

### Incremental Delivery

1. Add US2 interaction behavior (filter, select, change, clear on optional) and verify
   with component/integration tests.
2. Add US3 strict string-in-options validation for required and malformed-value handling.
3. Complete Phase 6 polish, documentation, and quickstart validation.

## Traceability Summary

- US1 covers FR-001, FR-002, FR-003, FR-004 (initial blank render), and SC-001.
- US2 covers FR-004 (filter/display), FR-005, and SC-004.
- US3 covers FR-006, FR-007, FR-008, and SC-002, SC-003.
- FR-009 (support across schema validation, UI rendering, data persistence, response
  submission contracts, and response processing/summary logic) is satisfied
  cumulatively by Phases 2-5; the completion-summary, submission, and survey-page
  services already operate generically on string/`null` answers and require no
  `dropdown`-specific branching.
