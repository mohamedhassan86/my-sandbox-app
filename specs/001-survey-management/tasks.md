# Tasks: Dynamic Survey Management and Response Collection

**Input**: Design documents from `/specs/001-survey-management/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

**Tests**: Included because the project constitution requires unit and integration coverage
for every feature and a production build before review.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and the feature directory structure.

- [X] T001 Add PrimeNG and PrimeFlex dependencies to `package.json` and refresh `pnpm-lock.yaml`
- [ ] T002 [P] Create feature directories under `src/app/core`, `src/app/shared`, and `src/app/survey`
- [ ] T003 [P] Add the sample survey fixture at `public/survey.json`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish shared contracts, state, validation, and error boundaries required
by every user story.

- [X] T004 [P] Create typed survey entities and discriminated question types in `src/app/core/models/survey.models.ts`
- [X] T005 [P] Create response and attachment types in `src/app/core/models/response.models.ts`
- [X] T006 Implement JSON schema validation for surveys in `src/app/core/validators/survey-config.validator.ts`
- [X] T007 Implement reusable answer and attachment validation rules in `src/app/core/validators/response.validator.ts`
- [X] T008 Implement configuration loading and invalid-configuration errors in `src/app/core/services/survey-config.service.ts`
- [X] T009 Implement active response state and page navigation state in `src/app/survey/services/survey-session.service.ts`
- [X] T010 Define the submission service interface and typed result states in `src/app/core/services/response-submission.service.ts`
- [X] T011 [P] Add shared validation message and loading/error presentation components in `src/app/shared/components/validation-message/validation-message.ts`
- [X] T012 Add foundational model, configuration, and validator tests in `src/app/core/**/*.spec.ts`

**Checkpoint**: Shared models, configuration validation, session state, and service
contracts are ready before story implementation begins.

## Phase 3: User Story 1 - Complete a Configured Survey (Priority: P1) MVP

**Goal**: Render a valid configured survey and capture radio, checkbox, textbox, and
textarea answers with required indicators.

**Independent Test**: Load a one-page fixture containing all four question types, answer
required questions, and verify that values are stored and incomplete required fields are
identified.

### Tests for User Story 1

- [X] T013 [P] [US1] Add survey configuration contract tests using `specs/001-survey-management/contracts/survey-json.md` in `src/app/core/services/survey-config.service.spec.ts`
- [X] T014 [P] [US1] Add question renderer integration tests in `src/app/survey/components/question-renderer/question-renderer.spec.ts`

### Implementation for User Story 1

- [X] T015 [P] [US1] Implement the radio question component in `src/app/survey/components/radio-question/radio-question.ts`
- [X] T016 [P] [US1] Implement the checkbox question component in `src/app/survey/components/checkbox-question/checkbox-question.ts`
- [X] T017 [P] [US1] Implement the text input components in `src/app/survey/components/text-question/text-question.ts`
- [X] T018 [US1] Implement the question renderer switch for supported types in `src/app/survey/components/question-renderer/question-renderer.ts`
- [X] T019 [US1] Implement the survey page view and required indicators in `src/app/survey/pages/survey-page/survey-page.ts`
- [X] T020 [US1] Connect loaded configuration and response state in `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T021 [US1] Add survey feature styles and responsive question layout in `src/app/survey/survey.css`

**Checkpoint**: A valid one-page survey renders, captures supported answers, and exposes
required-field state without navigation or submission dependencies.

## Phase 4: User Story 2 - Navigate a Multi-Page Survey (Priority: P1)

**Goal**: Let respondents move through ordered pages while preserving answers and
blocking invalid current pages.

**Independent Test**: Load a two-page fixture, answer both pages, move backward and
forward, and verify answer preservation and blocked invalid navigation.

### Tests for User Story 2

- [X] T022 [P] [US2] Add page navigation and answer-preservation integration tests in `src/app/survey/services/survey-session.service.spec.ts`
- [X] T023 [P] [US2] Add navigation control tests in `src/app/survey/pages/survey-view/survey-view.spec.ts`

### Implementation for User Story 2

- [X] T024 [US2] Implement previous, next, active-page, and completed-page controls in `src/app/survey/components/survey-navigation/survey-navigation.ts`
- [X] T025 [US2] Add current-page validation and navigation transitions to `src/app/app.ts` and `src/app/survey/services/survey-session.service.ts`
- [X] T026 [US2] Integrate navigation controls and page state into `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T027 [US2] Add accessible progress and navigation styling in `src/app/survey/components/survey-navigation/survey-navigation.css`

**Checkpoint**: Respondents can complete and revisit pages without losing answers, and
invalid current pages cannot advance.

## Phase 5: User Story 3 - Submit Responses and Attachments (Priority: P1)

**Goal**: Collect validated answers and required files, submit them, and preserve state
when submission fails.

**Independent Test**: Complete a survey with zero through three attachment requirements,
submit valid data, and simulate a failure to verify success and error behavior.

### Tests for User Story 3

- [X] T028 [P] [US3] Add attachment count, type, and size validator tests in `src/app/core/validators/response.validator.spec.ts`
- [X] T029 [P] [US3] Add response submission contract tests in `src/app/core/services/response-submission.service.spec.ts`
- [X] T030 [P] [US3] Add submission success and failure integration tests in `src/app/survey/pages/survey-view/survey-view.spec.ts`

### Implementation for User Story 3

- [X] T031 [P] [US3] Implement the file upload question component in `src/app/survey/components/file-upload/file-upload.ts`
- [X] T032 [US3] Add attachment validation and response assembly to `src/app/survey/services/survey-session.service.ts`
- [X] T033 [US3] Implement the submission adapter using the contract in `specs/001-survey-management/contracts/response-submission.md` in `src/app/core/services/response-submission.service.ts`
- [X] T034 [US3] Add submit action, loading state, success confirmation, and failure recovery to `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T035 [US3] Add attachment control styles and accessible file feedback in `src/app/survey/components/file-upload/file-upload.css`

**Checkpoint**: Valid responses submit with attachments; invalid submissions are blocked;
failed submissions preserve respondent data.

## Phase 6: User Story 4 - Recover from Invalid Configuration (Priority: P2)

**Goal**: Prevent partial rendering and present meaningful errors for malformed or
unsupported survey definitions.

**Independent Test**: Load malformed JSON, empty pages, and unsupported question types
and verify that controls are unavailable and a configuration error is shown.

### Tests for User Story 4

- [X] T036 [P] [US4] Add malformed and structurally invalid configuration tests in `src/app/core/validators/survey-config.validator.spec.ts`
- [X] T037 [P] [US4] Add configuration-error view integration tests in `src/app/survey/pages/survey-view/survey-view.spec.ts`

### Implementation for User Story 4

- [X] T038 [US4] Add configuration loading, error, and retry states to `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T039 [US4] Render user-safe configuration errors through `src/app/shared/components/validation-message/validation-message.ts`

**Checkpoint**: Invalid definitions never produce a partially usable survey and provide a
clear recovery path.

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify quality, accessibility, performance, documentation, and deployment
readiness across all stories.

- [ ] T040 [P] Add keyboard and contrast checks for the survey flow in `src/app/survey/pages/survey-view/survey-view.spec.ts`
- [ ] T041 [P] Add performance fixture coverage for 100 pages and 500 questions in `src/app/survey/services/survey-session.service.spec.ts`
- [ ] T042 Update `README.md` with survey fixture, local run, test, and submission configuration guidance
- [ ] T043 Run the validation commands from `specs/001-survey-management/quickstart.md` and record results in the pull request

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001-T003 can begin immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Phase 2. US1 and US2 are independently
  testable after foundation; US3 builds on the response state from US1 and US2; US4
  uses the configuration boundary from foundation and can be tested independently.
- **Polish (Phase 7)**: Depends on the desired user stories being complete.

### User Story Dependencies

- **US1**: Depends on T004-T012; MVP scope.
- **US2**: Depends on T004-T012 and the survey view introduced by US1.
- **US3**: Depends on T004-T012 and the response/page state from US1 and US2.
- **US4**: Depends on T006 and the survey view error boundary; can proceed after US1 view scaffolding.

### Parallel Opportunities

- T002-T003 can run in parallel after T001.
- T004-T005, T011, and T012 can run in parallel where their files do not overlap.
- In US1, T013-T017 can run in parallel; T018-T020 follow the model and component contracts.
- In US2, T022-T23 can run in parallel; T024 and T027 can run in parallel before T026 integration.
- In US3, T028-T031 can run in parallel; T033 and T035 can proceed before T034 integration.
- In US4, T036-T037 can run in parallel.
- T040-T041 can run in parallel after all story behavior is available.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup and Phase 2 foundation.
2. Complete Phase 3 US1.
3. Run the US1 independent test and production build.
4. Deploy or demo the one-page JSON-driven survey before adding navigation and submission.

### Incremental Delivery

1. Add US2 navigation and verify answer preservation.
2. Add US3 attachments and submission failure recovery.
3. Add US4 invalid-configuration recovery.
4. Complete Phase 7 quality and quickstart validation.

## Traceability Summary

- US1 covers FR-001, FR-003, FR-004, FR-005, and the primary answer-capture flow.
- US2 covers FR-006, FR-007, and FR-018.
- US3 covers FR-008 through FR-017.
- US4 covers FR-002 and configuration-related edge cases.
- Phase 7 covers FR-019, FR-020, SC-001 through SC-007, and constitution quality gates.
