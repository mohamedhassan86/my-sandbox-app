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
- [X] T002 [P] Create feature directories under `src/app/core`, `src/app/shared`, and `src/app/survey`
- [X] T003 [P] Add the sample survey fixture at `public/survey.json`

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

- [X] T040 [P] Add keyboard and contrast checks for the survey flow in `src/app/survey/pages/survey-view/survey-view.spec.ts`
- [X] T041 [P] Add performance fixture coverage for 100 pages and 500 questions in `src/app/survey/services/survey-session.service.spec.ts`
- [X] T042 Update `README.md` with survey fixture, local run, test, and submission configuration guidance
- [X] T043 Run the validation commands from `specs/001-survey-management/quickstart.md` and record results in the pull request

## Phase 8: Survey UX Enhancement and Four-Page Demo

**Purpose**: Make the survey experience functional, engaging, and easy to scan while
keeping all controls accessible and aligned with the project UX guidelines.

**Independent Test**: Open the sample survey, verify four ordered pages with navigation
at the top, complete each page, revisit earlier pages without losing answers, and confirm
that responsive and keyboard interactions remain usable.

### Tests for UX Enhancement

- [X] T044 [P] [US2] Add four-page fixture and page-order assertions in `src/app/survey/pages/survey-view/survey-view.spec.ts`
- [X] T045 [P] [US2] Add top-navigation interaction and active/completed-state tests in `src/app/survey/components/survey-navigation/survey-navigation.spec.ts`
- [X] T046 [P] [US1] Add question feedback and answer-preservation tests in `src/app/survey/pages/survey-page/survey-page.spec.ts`
- [X] T047 [P] Add responsive and keyboard interaction regression tests in `src/app/survey/pages/survey-view/survey-view.spec.ts`

### Implementation for UX Enhancement

- [X] T048 [US2] Expand the sample configuration to exactly four ordered pages in `public/survey.json`
- [X] T049 [US2] Move page navigation above the page content and keep it visible in `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T050 [US2] Add direct page selection, progress percentage, and clear active/completed states in `src/app/survey/components/survey-navigation/survey-navigation.ts`
- [X] T051 [US2] Add top-navigation layout, responsive wrapping, and mobile-friendly controls in `src/app/survey/components/survey-navigation/survey-navigation.css`
- [X] T052 [US1] Add completion cues, question numbering, and friendly validation feedback in `src/app/survey/pages/survey-page/survey-page.ts`
- [X] T053 [US1] Add playful but restrained interaction states, focus styling, and responsive spacing in `src/app/survey/survey.css`
- [X] T054 [US2] Update the session service to support direct page selection without bypassing validation in `src/app/survey/services/survey-session.service.ts`
- [X] T055 Update the sample survey documentation and four-page UX behavior in `README.md` and `specs/001-survey-management/quickstart.md`
- [X] T056 Run the complete test, build, and responsive smoke-check commands and record results in `specs/001-survey-management/quickstart.md`

## Phase 9: Reference-Driven Survey UX

**Purpose**: Implement the respondent experience represented by `public/theme-preview.png`
without changing the JSON-driven domain contract or accessibility requirements.

**Independent Test**: Open the survey at desktop and mobile widths and verify a centered
white survey surface on the soft pink backdrop, clear question grouping, blue selected
states, usable rating tiles, compact choices, and satisfaction controls. Confirm that
keyboard focus, labels, validation, and answer persistence remain functional.

### UX Reference Tests

- [X] T057 [P] Add reference-pattern rendering tests for rating tiles, choice groups, and satisfaction controls in `src/app/survey/components/question-renderer/question-renderer.spec.ts`
- [X] T058 [P] Add responsive layout and keyboard-state regression tests against the reference behavior in `src/app/survey/pages/survey-view/survey-view.spec.ts`
- [X] T059 [P] Add selected/unselected visual-state assertions for rating, radio, checkbox, and satisfaction answers in the relevant survey component specs

### UX Reference Implementation

- [X] T060 Define shared UX tokens for the soft pink backdrop, white panel, dark typography, neutral gray controls, blue selected state, and maroon product accents in `src/styles.css`
- [X] T061 Implement the centered survey surface, generous spacing, rounded grouping, and responsive panel behavior in `src/app/survey/survey.css`
- [X] T062 Add a reusable 1-10 rating presentation with endpoint labels and keyboard semantics in `src/app/survey/components/rating-question/rating-question.ts`
- [X] T063 Add rating tile styles with neutral, hover, focus, and vivid-blue selected states in `src/app/survey/components/rating-question/rating-question.css`
- [X] T064 Add satisfaction/icon option rendering with text labels and accessible names in `src/app/survey/components/satisfaction-question/satisfaction-question.ts`
- [X] T065 Add satisfaction option styles and responsive wrapping behavior in `src/app/survey/components/satisfaction-question/satisfaction-question.css`
- [X] T066 Update the question model, validator, renderer, and sample configuration contracts for the new reference-supported question types in `src/app/core/models/survey.models.ts`, `src/app/core/validators/survey-config.validator.ts`, `src/app/survey/components/question-renderer/question-renderer.ts`, and `public/survey.json`
- [X] T067 Align existing radio, checkbox, file, navigation, validation, and submit controls with the reference spacing, Bootstrap-compatible form classes, and state tokens while preserving maroon brand accents in `src/app/survey/components/`, `src/app/shared/components/`, and `src/app/survey/survey.css`
- [X] T068 Update `README.md` and `specs/001-survey-management/quickstart.md` with the reference image, UX rules, supported question patterns, and responsive acceptance checks
- [ ] T069 Run the full test suite, production build, and desktop/mobile visual smoke checks; automated results are recorded, browser visual comparison remains pending in `specs/001-survey-management/quickstart.md`
- [X] T070 Apply the local Bootstrap-compatible form and layout subset across all question templates in `src/app/survey/components/` and `src/styles.css`
- [X] T071 Record the Bootstrap-compatible styling decision and dependency rationale in `specs/001-survey-management/research.md` and `specs/001-survey-management/plan.md`

## Phase 10: Final Completion Summary

**Purpose**: Give respondents a clear final state after successful submission, including
a high-level completion percentage and a concise success message.

**Independent Test**: Complete all required survey pages and submit successfully. Verify
that the survey actions are replaced or followed by a final summary showing `100%`
completion, a success message, and no misleading editable-state controls. Verify that
failed submissions remain on the editable survey and preserve entered answers.

### Completion Summary Tests

- [X] T072 [P] Add completion-summary rendering tests for successful submission, percentage display, and success messaging in `src/app/survey/pages/survey-view/survey-view.spec.ts`
- [X] T073 [P] Add completion percentage calculation tests for partial, complete, and submitted session states in `src/app/survey/services/survey-session.service.spec.ts`
- [X] T074 [P] Add keyboard, semantic-region, and visible-status assertions for the final summary in `src/app/survey/pages/survey-view/survey-view.spec.ts`

### Completion Summary Implementation

- [X] T075 Add an explicit submitted/completion state and completion percentage selector to `src/app/survey/services/survey-session.service.ts`
- [X] T076 Create the final completion summary component with a high-level percentage and success message in `src/app/survey/components/completion-summary/completion-summary.ts`
- [X] T077 Render the completion summary after successful submission and keep the editable survey visible on submission failure in `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T078 Add responsive, accessible completion-summary styling consistent with the reference panel and maroon product accents in `src/app/survey/components/completion-summary/completion-summary.css`
- [X] T079 Update `README.md` and `specs/001-survey-management/quickstart.md` with the final completion-state behavior and acceptance scenario
- [ ] T080 Run the full test suite, production build, and completion-summary smoke checks; automated test/build results are recorded, browser smoke checks remain pending in `specs/001-survey-management/quickstart.md`
- [X] T081 Replace the separate submit action with a context-aware Next/Submit action on the final page in `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T082 Give the completion summary a minimum height comparable to the three-input survey page in `src/app/survey/components/completion-summary/completion-summary.css`
- [X] T083 Add the independent eight-step, three-questions-per-step fixture covering all question types in `public/survey-8-step.json`
- [X] T084 Add query-parameter survey fixture selection while preserving the default survey in `src/app/survey/pages/survey-view/survey-view.ts`
- [X] T085 Add eight-step fixture selection tests and update `README.md` and `specs/001-survey-management/quickstart.md` with the independent survey URL and coverage rules
- [X] T086 Keep the survey steps header visible after successful submission while disabling all step navigation buttons in `src/app/survey/components/survey-navigation/survey-navigation.ts`
- [X] T087 Add submitted-state navigation tests confirming completion steps remain displayed but cannot be clicked in `src/app/survey/components/survey-navigation/survey-navigation.spec.ts` and `src/app/survey/pages/survey-view/survey-view.spec.ts`

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; T001-T003 can begin immediately.
- **Foundational (Phase 2)**: Depends on Phase 1; blocks all user stories.
- **User Stories (Phases 3-6)**: Depend on Phase 2. US1 and US2 are independently
  testable after foundation; US3 builds on the response state from US1 and US2; US4
  uses the configuration boundary from foundation and can be tested independently.
- **Polish (Phase 7)**: Depends on the desired user stories being complete.
- **UX Enhancement (Phase 8)**: Depends on US1, US2, and the existing polish checks.

### User Story Dependencies

- **US1**: Depends on T004-T012; MVP scope.
- **US2**: Depends on T004-T012 and the survey view introduced by US1.
- **US3**: Depends on T004-T012 and the response/page state from US1 and US2.
- **US4**: Depends on T006 and the survey view error boundary; can proceed after US1 view scaffolding.
- **UX Enhancement**: Depends on T013-T027 and extends the existing US1/US2 experience without changing the response contract.
- **Reference-Driven UX**: Depends on T057-T059 before implementation; T060-T067 and T070-T071 can proceed in parallel where files do not overlap; T068 documents the result; T069 is the visual validation gate.
- **Final Completion Summary**: Depends on the submission state from US3 and the completed reference-driven UX work; T072-T074 can run in parallel, followed by T075-T079 and T081-T082, then T080.

### Parallel Opportunities

- T002-T003 can run in parallel after T001.
- T004-T005, T011, and T012 can run in parallel where their files do not overlap.
- In US1, T013-T017 can run in parallel; T018-T020 follow the model and component contracts.
- In US2, T022-T23 can run in parallel; T024 and T027 can run in parallel before T026 integration.
- In US3, T028-T031 can run in parallel; T033 and T035 can proceed before T034 integration.
- In US4, T036-T037 can run in parallel.
- T040-T041 can run in parallel after all story behavior is available.
- T044-T047 can run in parallel before implementation; T048, T051, and T053 can run in parallel when their files do not overlap.
- T057-T059 can run in parallel; T060-T067 and T070-T071 can run in parallel where their files do not overlap; T068 can proceed after the UX contract is settled, with T069 last.
- T072-T074 can run in parallel; T075-T079 and T081-T082 can proceed in dependency order after the tests define the completion contract; T080 remains last.

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
5. Add Phase 8 four-page navigation and UX enhancements, then validate desktop, mobile, and keyboard flows.
6. Implement the Phase 9 reference-driven UX patterns and Bootstrap-compatible form layout, then complete visual smoke checks against `public/theme-preview.png`.
7. Implement the Phase 10 final completion summary, final-page Submit action, and validate the successful and failed submission states.

## Traceability Summary

- US1 covers FR-001, FR-003, FR-004, FR-005, and the primary answer-capture flow.
- US2 covers FR-006, FR-007, and FR-018.
- US3 covers FR-008 through FR-017.
- US4 covers FR-002 and configuration-related edge cases.
- Phase 7 covers FR-019, FR-020, SC-001 through SC-007, and constitution quality gates.
- Phase 8 strengthens FR-006, FR-018, FR-019, FR-020, and the four-page sample/demo requirement.
- Phase 9 adds the reference-driven visual and interaction acceptance criteria while preserving FR-001 through FR-020 and the existing response contract.
- T070-T071 formalize the shared Bootstrap-compatible form/layout language without adding Bootstrap as a runtime dependency.
- Phase 10 covers FR-016, FR-017, and FR-021 by making successful completion explicit while preserving respondent data on failure.
- T083-T085 add an independent eight-step survey fixture without modifying `public/survey.json`.
- T086-T087 preserve the completed steps header as non-interactive context after submission.
