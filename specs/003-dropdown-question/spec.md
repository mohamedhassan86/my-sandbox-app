# Feature Specification: Dropdown Question Type

**Feature Branch**: `003-dropdown-question`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Add a new question type: "dropdown", which renders a single-select dropdown list populated from a predefined static array of values defined in the survey JSON schema."

## Clarifications

### Session 2026-09-10

- Q: Should a dropdown question support an optional preselected default value, or always start unselected? → A: Always start unselected; there is no `defaultValue` field. The control shows an empty state initially and required questions force an explicit choice.
- Q: For optional dropdowns, should respondents be able to clear a selection back to unselected? → A: Yes; optional questions offer a way back to the empty state, and a cleared answer counts as unanswered.
- Q: Should the dropdown list support searching/filtering options as the respondent types? → A: Yes; the list is searchable (type-to-filter) in addition to being scrollable.
- Q: How should the placeholder (empty-state) text be handled? → A: No placeholder text at all; the control shows a blank state until an option is selected, and `placeholder` is not a schema field.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author defines a dropdown question (Priority: P1)

A survey author adds a `dropdown` question to a survey's JSON definition (e.g.
"Country of residence") with a label and a static array of label/value options, and
the survey renders correctly without any application code changes.

**Why this priority**: Without a valid schema definition, no other part of the feature
(rendering, validation, submission) can function. This is the foundation of the
JSON-driven domain contract.

**Independent Test**: Can be fully tested by loading a survey JSON file containing a
`dropdown` question and verifying the survey loads without validation errors and the
question appears on the correct page.

**Acceptance Scenarios**:

1. **Given** a survey JSON with a well-formed `dropdown` question (type, questionId,
   label, required, options array of label/value pairs), **When** the survey is
   loaded, **Then** the survey parses successfully and the question is available for
   rendering.
2. **Given** a `dropdown` question with a missing or empty `options` array, **When**
   the survey is loaded, **Then** the system reports a user-visible schema validation
   error and does not render an ambiguous or partially valid survey.
3. **Given** a `dropdown` question with duplicate option values, or an option missing
   its label or value, **When** the survey is loaded, **Then** the system reports a
   user-visible schema validation error identifying the offending question/option.

---

### User Story 2 - Respondent answers a dropdown question (Priority: P1)

A respondent viewing a survey page sees the dropdown question rendered as a
single-select dropdown list showing an empty state when nothing is selected, can
expand the list to view the predefined options, can type to filter the list, and can
select exactly one option.

**Why this priority**: This is the core end-user interaction the feature exists to
deliver; without it the question type has no value to respondents.

**Independent Test**: Can be fully tested by rendering a page containing a `dropdown`
question, expanding the list, filtering, selecting and clearing an option, and
confirming the displayed state and the underlying value update accordingly.

**Acceptance Scenarios**:

1. **Given** a dropdown question with no selection yet, **When** the page is rendered,
   **Then** the control shows an empty (blank) state with no placeholder text and no
   answer value is recorded.
2. **Given** a dropdown question with its option list available, **When** the
   respondent selects an option, **Then** the control displays that option's label and
   the underlying answer value becomes the option's value.
3. **Given** a dropdown question with an option already selected, **When** the
   respondent selects a different option, **Then** the displayed label and the
   underlying answer value update to the newly selected option, with only one option
   selected at a time.
4. **Given** a dropdown question with a long option list, **When** the respondent
   types filter text, **Then** the displayed list narrows to matching options and
   selection works against the filtered list.
5. **Given** an optional dropdown question with an option already selected, **When**
   the respondent clears the selection, **Then** the control returns to its empty
   state and the answer is treated as unanswered.

---

### User Story 3 - Dropdown answers are validated and submitted (Priority: P2)

When a respondent submits a survey containing dropdown questions, the system validates
that every answer is a string matching one of the question's predefined option values,
rejects unknown or malformed values, enforces required selections, and persists the
response in the documented format.

**Why this priority**: Ensures data integrity for downstream processing/reporting;
depends on Stories 1 and 2 already working end to end.

**Independent Test**: Can be fully tested by submitting responses with valid option
values, and separately with invalid values (unknown string, wrong type, empty value on
a required question), and verifying acceptance or rejection respectively.

**Acceptance Scenarios**:

1. **Given** a completed survey with a dropdown question answered with option value
   `"opt-a"`, **When** the response is submitted, **Then** the persisted/submitted
   response contains `{ "<question_id>": "opt-a" }`.
2. **Given** a submission payload where a dropdown question's value is not one of its
   predefined option values (or is a non-string type such as a number, boolean,
   array, or object), **When** validation runs, **Then** the submission is rejected
   with a clear validation error identifying the offending question.
3. **Given** a dropdown question marked `required: true` with no option selected,
   **When** the respondent attempts page navigation or submission, **Then** navigation
   or submission is blocked with visible feedback until an option is selected.

---

### Edge Cases

- What happens when `options` is missing or an empty array? The survey MUST be
  rejected with a user-visible schema validation error; no partial rendering is
  allowed.
- How does the system handle duplicate option `value` entries within one dropdown
  question? The survey MUST be rejected with a schema validation error (values must be
  unique within the question).
- How does the system handle an option missing `label` or `value`, or with an empty
  label/value? The survey MUST be rejected with a schema validation error.
- What happens when a submitted answer value does not match any predefined option
  value (e.g. stale or tampered payload)? The submission MUST be rejected with a
  question-specific validation error.
- What happens when an optional (`required: false`) dropdown is left unselected, or
  is cleared after a selection was made? The page/submission MUST validate
  successfully and the unanswered question MUST be represented as absent/null,
  consistent with other optional question types.
- What happens when filter text matches no options? The list MUST show an empty
  (no-match) state and no value may be selected until the filter matches at least one
  option.
- How does the system handle duplicate `questionId` values across questions, including
  dropdown questions? Existing survey-wide duplicate-id validation MUST also apply to
  `dropdown` questions (no special-case exemption).
- What happens with a long static option list (e.g. 100+ options)? The dropdown list
  MUST remain usable (scrollable, filterable, and selectable) without requiring schema
  or interaction changes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The survey schema MUST support a `dropdown` question type with fields
  `type`, `questionId`, `label`, `required` (boolean, optional, default `false`),
  `options` (required non-empty array of `{ label, value }` pairs), and the standard
  attachment fields (`attachmentsRequired`, `acceptedFileTypes`, `maxFileSizeBytes`)
  shared with other question types. There is no `defaultValue` or `placeholder`
  field; every dropdown starts unselected.
- **FR-002**: Schema validation MUST require each dropdown option to have a non-empty
  string `label` and a non-empty string `value`, MUST require option values to be
  unique within the question, and MUST reject the survey definition with a clear,
  question-specific error when these rules are violated.
- **FR-003**: The system MUST render `dropdown` questions as a single-select dropdown
  list populated exclusively from the question's predefined static `options` array;
  exactly one option may be selected at a time.
- **FR-004**: The rendered control MUST show an empty (blank) state with no
  placeholder text while no option is selected, MUST show the predefined option list
  when expanded, MUST support typing to filter the displayed options, and MUST
  display the selected option's label once a selection is made.
- **FR-005**: Respondents MUST be able to expand the list and select an option, MUST
  be able to change the selection to a different predefined option at any time before
  submission, and — when the question is not required — MUST be able to clear the
  selection back to the empty (unanswered) state; each change MUST be reflected
  immediately in the displayed state and in the underlying response state.
- **FR-006**: Response validation MUST accept only string values that exactly match
  one of the question's predefined option values, MUST accept an absent/empty value
  only when the question is not required, and MUST reject unknown strings and
  non-string values (numbers, booleans, arrays, objects) with a clear,
  question-specific validation error.
- **FR-007**: When a `dropdown` question is marked `required: true`, the system MUST
  require a selected option value before the page can be navigated away from and
  before the survey can be submitted successfully.
- **FR-008**: The persisted/submitted response for a `dropdown` question MUST use the
  format `{ "<question_id>": "<selected_value>" }`, where `<selected_value>` is the
  string `value` of the selected predefined option.
- **FR-009**: The `dropdown` type MUST be supported wherever other question types are
  already supported: schema validation, UI rendering, data persistence, response
  submission contracts, and response processing/summary logic (e.g. completion
  summaries).

### Key Entities

- **Dropdown Question**: A survey question definition with a single-select answer
  domain constrained to a predefined static array of label/value options, a blank
  empty state before selection, a required flag, and standard attachment settings.
- **Question Response**: The respondent-provided value for a question; for dropdown
  questions this is constrained to the string domain of the question's predefined
  option values, stored as a string within the shared answer value type alongside the
  value types already used by other question types.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Survey authors can add a `dropdown` question to a survey JSON file and
  see it render as a single-select dropdown list without any application code
  changes.
- **SC-002**: 100% of submitted `dropdown` answers in valid survey responses are
  persisted as string values exactly matching one of the question's predefined option
  values in the documented response format.
- **SC-003**: 100% of submission attempts containing an unknown, empty-required, or
  non-string value for a `dropdown` question are rejected with a validation error
  identifying the question.
- **SC-004**: Respondents can determine the current state of a dropdown question
  (empty vs. selected option label) at a glance, without ambiguity, in under 1
  second of viewing the control.

## Assumptions

- The `dropdown` type is added alongside existing question types (radio, checkbox,
  text, rating, satisfaction, toggle button, file upload) without altering their
  behavior.
- Only single-select behavior is in scope; multi-select dropdowns are out of scope
  (checkbox questions already cover multi-select needs).
- Options are a static array defined in the survey JSON; dynamic, remote, or
  asynchronously loaded option sources are out of scope for this feature.
- Option entries reuse the existing `{ label, value }` contract used by other
  selectable question types; any extra option attributes beyond label/value are
  ignored by the dropdown unless explicitly specified in a future change.
- The dropdown shows no placeholder text; the empty state is blank until an option is
  selected (confirmed in the 2026-09-10 clarification session).
- The dropdown list is searchable (type-to-filter) in addition to being scrollable
  (confirmed in the 2026-09-10 clarification session).
- Clearing a selection back to unanswered is supported for optional questions;
  required questions must hold a selected option value to pass validation (confirmed
  in the 2026-09-10 clarification session).
- No new external API or backend service is introduced; persistence follows the
  existing response submission mechanism already used by other question types.
- The shared string answer value already used by other question types carries dropdown
  answers; no new answer value type is required.
- Accessibility expectations (keyboard operability, semantic labeling) for the
  dropdown control follow the same standards already applied to other interactive
  question controls in this project.
