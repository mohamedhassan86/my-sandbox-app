# Feature Specification: Toggle Button Question Type

**Feature Branch**: `002-toggle-button-question`

**Created**: 2026-09-06

**Status**: Draft

**Input**: User description: "Update the questionnaire schema to support a new question type called `toggle_button`. Boolean-only values (true/false), rendered as a toggle switch with configurable on/off labels, default value, required flag, and response format `{ \"<question_id>\": true }`. Must be supported across schema validation, UI rendering, data persistence, API contracts, and response processing logic."

## Clarifications

### Session 2026-09-06

- Q: Should a toggle question's value be persisted as a native boolean, or serialized as the string "true"/"false" to match the existing answer storage model? → A: Widen the answer value type to include `boolean` natively; toggle answers are stored as real booleans, not strings.
- Q: Does leaving a required toggle at its unmodified `defaultValue` count as a valid answer, or must the respondent explicitly interact with the toggle for it to satisfy `required: true`? → A: The default value counts as answered; `required` only fails when no value (no default, no interaction) is present at all.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author defines a toggle button question (Priority: P1)

A survey author adds a `toggle_button` question to a survey's JSON definition (e.g.
"Enable Notifications") with an on/off label pair and a default value, and the survey
renders correctly without any application code changes.

**Why this priority**: Without a valid schema definition, no other part of the feature
(rendering, validation, submission) can function. This is the foundation of the
JSON-driven domain contract.

**Independent Test**: Can be fully tested by loading a survey JSON file containing a
`toggle_button` question and verifying the survey loads without validation errors and
the question appears on the correct page.

**Acceptance Scenarios**:

1. **Given** a survey JSON with a well-formed `toggle_button` question (type, id, label,
   defaultValue, required, options.onLabel, options.offLabel), **When** the survey is
   loaded, **Then** the survey parses successfully and the question is available for
   rendering.
2. **Given** a `toggle_button` question missing `options.onLabel` or `options.offLabel`,
   **When** the survey is loaded, **Then** the system applies reasonable default labels
   ("On"/"Off") rather than failing to load the survey.
3. **Given** a `toggle_button` question with an invalid `defaultValue` (non-boolean),
   **When** the survey is loaded, **Then** the system reports a user-visible schema
   validation error and does not render an ambiguous survey.

---

### User Story 2 - Respondent answers a toggle button question (Priority: P1)

A respondent viewing a survey page sees the toggle question rendered as a switch,
showing the configured on/off label depending on its current state, and can change the
value by interacting with the control.

**Why this priority**: This is the core end-user interaction the feature exists to
deliver; without it the question type has no value to respondents.

**Independent Test**: Can be fully tested by rendering a page containing a
`toggle_button` question, toggling it, and confirming the displayed label and the
underlying value update accordingly.

**Acceptance Scenarios**:

1. **Given** a toggle question with `defaultValue: false` and `offLabel: "Disabled"`,
   **When** the page is rendered, **Then** the control shows the off state and displays
   "Disabled".
2. **Given** a toggle question currently off, **When** the respondent activates the
   control, **Then** the value becomes `true` and the on label is displayed.
3. **Given** a toggle question marked `required: true` with a `defaultValue` present,
   **When** the respondent navigates away from the page or submits without touching
   the control, **Then** the page/submission validates successfully because the
   default value counts as an explicit answer.

---

### User Story 3 - Toggle answers are validated and submitted (Priority: P2)

When a respondent submits a survey containing toggle button questions, the system
validates that every answer is a genuine boolean, rejects malformed values, and
persists the response in the documented format.

**Why this priority**: Ensures data integrity for downstream processing/reporting;
depends on Stories 1 and 2 already working end to end.

**Independent Test**: Can be fully tested by submitting responses with valid boolean
values, and separately with invalid values (null, string, number, array), and verifying
acceptance or rejection respectively.

**Acceptance Scenarios**:

1. **Given** a completed survey with a toggle question answered `true`, **When** the
   response is submitted, **Then** the persisted/submitted response contains
   `{ "<question_id>": true }`.
2. **Given** a submission payload where a toggle question's value is a string, number,
   array, or null, **When** validation runs, **Then** the submission is rejected with a
   clear validation error identifying the offending question.
3. **Given** a toggle question marked `required: true` with no value present in the
   submission payload (no `defaultValue` and no respondent interaction), **When**
   validation runs, **Then** the submission is rejected until a boolean value
   (default or explicit) is supplied.

---

### Edge Cases

- What happens when `defaultValue` is omitted entirely? System MUST treat the question
  as unanswered (not implicitly `false`) until the respondent provides an explicit
  value, unless `required` is `false`, in which case the omitted default is treated as
  `false`.
- How does the system handle a `toggle_button` question with `required: true` and no
  `defaultValue`? Because no value (explicit or default) is present, the respondent
  MUST interact with the toggle before the page/submission validates successfully.
  When a `defaultValue` is present, it already counts as an explicit answer and no
  interaction is required.
- How does the system handle duplicate `id` values across questions, including toggle
  questions? Existing survey-wide duplicate-id validation MUST also apply to
  `toggle_button` questions (no special-case exemption).
- What happens if `options` is omitted entirely? System MUST fall back to default
  labels "On" and "Off".

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The survey schema MUST support a `toggle_button` question type with
  fields `type`, `id`, `label`, `description` (optional), `defaultValue` (boolean,
  optional), `required` (boolean, optional, default `false`), and `options.onLabel` /
  `options.offLabel` (optional strings, defaulting to "On"/"Off").
- **FR-002**: Schema validation MUST accept only boolean literals (`true`/`false`) for
  `defaultValue`, and MUST reject the question definition with a clear error if a
  non-boolean value is supplied.
- **FR-003**: The system MUST render `toggle_button` questions as a toggle
  switch/button control that visually distinguishes the on and off states.
- **FR-004**: The rendered control MUST display `options.onLabel` when the current
  value is `true` and `options.offLabel` when the current value is `false`.
- **FR-005**: Respondents MUST be able to change the toggle value by interacting with
  the control, and the change MUST be reflected immediately in the displayed label and
  in the underlying response state.
- **FR-006**: Response validation MUST accept only genuine boolean values (`true` or
  `false`) as answers to `toggle_button` questions and MUST reject `null`, strings,
  numbers, and arrays with a clear, question-specific validation error.
- **FR-007**: When a `toggle_button` question is marked `required: true`, the system
  MUST require a boolean value be present (either the configured `defaultValue` or a
  value set by respondent interaction) before the page/survey can be submitted
  successfully; `required` only fails validation when no value is present at all (no
  default and no interaction).
- **FR-008**: The persisted/submitted response for a `toggle_button` question MUST use
  the format `{ "<question_id>": <boolean> }`, where `<boolean>` is a native boolean
  value (not a quoted string). The shared answer value domain MUST be widened to
  accept booleans alongside the value types already used by other question types.
- **FR-009**: The `toggle_button` type MUST be supported wherever other question types
  are already supported: schema validation, UI rendering, data persistence, response
  submission contracts, and response processing/summary logic (e.g. completion
  summaries).

### Key Entities

- **Toggle Button Question**: A survey question definition with a boolean answer
  domain, an optional default value, a required flag, and configurable on/off display
  labels.
- **Question Response**: The respondent-provided value for a question; for toggle
  button questions this is constrained to the boolean domain `{true, false}`, stored as
  a native boolean within the shared answer value type (widened alongside the existing
  string and string-array value types).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Survey authors can add a `toggle_button` question to a survey JSON file
  and see it render correctly without any application code changes.
- **SC-002**: 100% of submitted `toggle_button` answers in valid survey responses are
  persisted as boolean values matching the documented response format.
- **SC-003**: 100% of submission attempts containing a non-boolean value for a
  `toggle_button` question are rejected with a validation error identifying the
  question.
- **SC-004**: Respondents can determine the current state of a toggle question at a
  glance, without ambiguity, in under 1 second of viewing the control.

## Assumptions

- The `toggle_button` type is added alongside existing question types (radio,
  checkbox, text, rating, satisfaction, file upload) without altering their behavior.
- "On"/"Off" are acceptable default labels when `options.onLabel`/`options.offLabel`
  are not supplied.
- No new external API or backend service is introduced; persistence follows the
  existing response submission mechanism already used by other question types.
- Accessibility expectations (keyboard operability, semantic labeling) for the toggle
  control follow the same standards already applied to other interactive question
  controls in this project.
