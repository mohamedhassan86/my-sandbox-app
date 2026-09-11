# Feature Specification: Three-Step Closed-Question Survey

**Feature Branch**: `007-three-step-survey`

**Created**: 2026-09-11

**Status**: Draft

**Input**: User description: "add another survey to the application with just 3 steps and each steps have 3 questions, try to choose the closed questions types (checkbox, radio, dropdown, ..)"

## Clarifications

### Session 2026-09-11

- Q: Should the nine questions be limited to the three selection types (radio, checkbox, dropdown), or should the remaining slots also use other supported closed types such as rating, satisfaction, and toggle? → A: Radio, checkbox, and dropdown are each guaranteed at least once; the remaining slots may also use rating, satisfaction, or toggle (all closed types allowed, open-text and file-upload still excluded).
- Q: What subject should the new survey's nine questions cover? → A: A short product experience pulse — usage habits, experience/satisfaction, and follow-up preferences.
- Q: Should the new survey be registered in the survey manifest under the key `quick-pulse`, making its URL `/surveys/quick-pulse`? → A: Yes — the survey is registered under the manifest key `quick-pulse` at `/surveys/quick-pulse`.
- Q: How many of the nine questions should be marked required? → A: Minimum required — at least one required radio, one required checkbox, and one required dropdown; all other questions optional.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A new compact survey is added without code changes (Priority: P1)

A survey author adds a new, standalone survey definition to the application as a
validated configuration asset and registers it in the survey manifest. The survey
becomes reachable at its own named URL, while every existing survey continues to work
exactly as before. No application code is modified.

**Why this priority**: This is the foundation of the JSON-driven contract; without a
valid, registered survey definition there is nothing to render, validate, or submit.
It delivers immediate value on its own: a new, ready-to-use survey is published.

**Independent Test**: Can be fully tested by loading the new survey's URL and
verifying that it renders with exactly three steps and three questions per step, that
the configuration passes validation without errors, and that the existing surveys'
URLs still render their unchanged content.

**Acceptance Scenarios**:

1. **Given** the new survey configuration asset and its manifest entry are in place,
   **When** the application is loaded and the new survey's URL is opened, **Then**
   the survey renders with exactly three steps, each containing exactly three
   questions, and no validation or loading errors are shown.
2. **Given** the new survey is registered in the manifest, **When** the existing
   default survey URL and the existing extended survey URL are opened, **Then** both
   render exactly as they did before the new survey was added.
3. **Given** the new survey's manifest entry, **When** the application starts,
   **Then** the survey catalog includes the new survey alongside the existing ones
   without affecting their names or URLs.

---

### User Story 2 - A respondent completes the 3-step survey end to end (Priority: P1)

A respondent opens the new survey and walks through all three steps. Every one of the
nine questions is a closed question — the respondent answers by selecting from
predefined options (radio, checkbox, or dropdown) or choosing a closed scale value
(rating, satisfaction, or a toggle) — never by typing free text. Step navigation,
progress, and the completion summary behave exactly as on the existing surveys, and
the response is submitted through the standard response flow.

**Why this priority**: This is the core end-user value of the feature: a short,
all-closed survey that respondents can finish quickly. It depends only on Story 1 and
delivers the user experience on its own.

**Independent Test**: Can be fully tested by opening the new survey, answering all
nine questions using only selection controls, navigating step by step, submitting the
response, and confirming the completion summary shows all three steps fully answered.

**Acceptance Scenarios**:

1. **Given** the new survey is open on step 1, **When** the respondent answers the
   step's three closed questions and moves to the next step, **Then** all three
   answers are recorded and the progress indicators (step buttons, progress ring,
   answered counts) update to reflect the completed step.
2. **Given** the respondent is on any step, **When** they move forward and then back,
   **Then** the previously given answers are preserved and displayed on return.
3. **Given** all required answers have been given, **When** the respondent submits
   from the final step, **Then** the submission succeeds and the survey is replaced
   by the standard completion summary.
4. **Given** the new survey is rendered, **When** the respondent inspects any of the
   nine questions, **Then** the question offers only a closed answer interface
   (radio group, checkbox group, dropdown list, rating scale, satisfaction scale, or
   toggle) and provides no free-text input field.
5. **Given** a checkbox question on any step, **When** the respondent selects one or
   more options, **Then** all selected options are recorded and the answer reflects
   every selected value.
6. **Given** a radio or dropdown question on any step, **When** the respondent
   selects an option, **Then** exactly one value is recorded for that question and
   changing the selection replaces the previously recorded value.

---

### User Story 3 - Required closed answers are enforced (Priority: P2)

When a question on the new survey is marked required, the system prevents the
respondent from leaving the step or submitting the survey until a valid answer is
present, with immediate, visible feedback identifying which question is incomplete.
Optional questions may be left unanswered, and an unanswered optional question does
not block navigation or submission.

**Why this priority**: Data integrity depends on required answers being enforced
consistently with the other surveys; it depends on Story 2 working end to end.

**Independent Test**: Can be fully tested by attempting to advance from a step with
required questions unanswered (navigation blocked, visible error shown), then
answering only the required questions and confirming navigation and submission
succeed while optional questions remain empty.

**Acceptance Scenarios**:

1. **Given** the current step contains a required radio, checkbox, or dropdown
   question with no answer, **When** the respondent attempts to move to the next
   step, **Then** navigation is blocked and a visible validation message identifies
   the incomplete question.
2. **Given** a required question has been answered and then cleared (for a checkbox
   or dropdown question that allows clearing), **When** the respondent attempts to
   navigate or submit, **Then** the validation error for that question is shown again.
3. **Given** a checkbox question with a minimum-selection rule, **When** the
   respondent selects fewer than the required number of options and attempts to
   navigate, **Then** navigation is blocked with a message explaining the minimum
   selection.
4. **Given** all required questions are answered and optional questions are left
   unanswered, **When** the respondent submits the survey, **Then** the submission
   succeeds and the unanswered optional questions are represented as absent or null
   in the response.
5. **Given** all required questions are unanswered on the final step, **When** the
   respondent attempts to submit, **Then** submission is blocked with visible
   validation feedback and all previously entered answers are preserved.

---

### Edge Cases

- What happens if the manifest key for the new survey already exists? The
  registration MUST be rejected with a clear error identifying the duplicate key; the
  application MUST NOT serve an ambiguous or conflicting survey under that key.
- How are duplicate question IDs or page IDs handled within the new survey? The
  configuration MUST be rejected by the existing survey validation with a
  question-specific or page-specific error; no partial rendering is allowed.
- What happens when a selectable question (radio, checkbox, or dropdown) has a
  missing or empty option list, or duplicate option values? The configuration MUST be
  rejected with a user-visible schema validation error identifying the offending
  question/option, consistent with the existing surveys.
- What happens when a respondent leaves every question on a step unanswered and the
  step contains only optional questions? Navigation MUST succeed and the step counts
  as fully valid with zero answered questions.
- What happens when a respondent changes an answer after moving past its step and
  later returns? The most recent answer MUST be the one displayed and the one
  submitted.
- What happens if the new survey's configuration fails validation at load time? The
  system MUST show a user-visible error for that survey only; the existing surveys
  MUST remain loadable and unaffected.
- How does the completion summary behave for this survey? It MUST follow the standard
  summary: all three steps shown as answered tiles reflecting the questions answered
  per step (e.g. "n/3 answered" per step), with no files tile content contributed by
  this survey (it contains no attachment questions).
- What happens on small screens? The survey MUST remain fully usable (answerable,
  navigable, submittable) at mobile widths using the existing responsive layout;
  no question type may be rendered in a way that is truncated or unusable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST add one new survey as a standalone, validated
  configuration asset registered in the survey manifest under a unique named key,
  reachable at its own named URL. Adding the survey MUST NOT require changes to
  application code.
- **FR-002**: The new survey MUST contain exactly three steps and exactly three
  questions on each step (nine questions in total).
- **FR-003**: Every one of the nine questions MUST use a closed question type —
  `radio`, `checkbox`, `dropdown`, `rating`, `satisfaction`, or `toggle_button`.
  Free-text question types (`textbox`, `textarea`) and file-upload questions MUST NOT
  appear in this survey.
- **FR-004**: The survey MUST include at least one `radio` question, at least one
  `checkbox` question, and at least one `dropdown` question among its nine questions.
- **FR-005**: Every selectable question (`radio`, `checkbox`, `dropdown`) MUST define
  a non-empty option list with unique, non-empty option values and labels; page IDs
  MUST be unique within the survey and question IDs MUST be unique within the survey.
- **FR-006**: The survey MUST include both required and optional questions, and each
  of the three required types — `radio`, `checkbox`, and `dropdown` — MUST be
  represented by at least one required question, so that required-answer enforcement
  is exercised across all three selection control styles.
- **FR-007**: No question in the survey MAY require or allow attachments (zero
  attachments for every question).
- **FR-008**: The survey MUST define a title, a short description, and an estimated
  completion time in minutes, and each of the three steps MUST define a title, a
  short description, and a valid icon key so the dock and topbar chrome render the
  same way they do for the existing surveys.
- **FR-009**: Required answers MUST be validated before step navigation and before
  submission, with the standard visible validation feedback; optional answers MAY be
  left unanswered and MUST be represented as absent or null in the response.
- **FR-010**: Submissions MUST flow through the standard response submission
  mechanism, and each question type MUST be represented in the submitted response
  using its documented format (radio: single option value; checkbox: list of selected
  option values; dropdown: selected option value; rating and satisfaction: scale
  value; toggle: boolean).
- **FR-011**: The existing default survey and the existing extended survey MUST remain
  unchanged and fully functional (content, URLs, and behavior) after this feature is
  added.

### Key Entities

- **Survey Definition (new survey asset)**: A standalone, validated survey
  configuration consisting of a unique survey identifier, title, description,
  estimated completion time, and exactly three steps; registered in the survey
  manifest under a unique named key.
- **Step (page)**: One of exactly three ordered stages of the survey, each with a
  unique step identifier, title, short description, icon key, and exactly three
  questions.
- **Closed Question**: A question definition whose answer domain is fully
  predefined — a single-select choice set (radio, dropdown), a multi-select choice
  set (checkbox), a closed scale (rating, satisfaction), or a boolean toggle — with
  a label, an optional required flag, and, where applicable, an option list.
- **Response**: The respondent's answers to the nine questions plus the standard
  submission metadata, produced by the existing response flow and constrained to the
  documented value format of each closed question type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The new survey is published with zero changes to application source
  code (only a new survey configuration asset and one manifest entry), and it loads
  and renders successfully at its named URL.
- **SC-002**: 100% of the survey's questions (9 of 9) use closed question types,
  and the survey contains exactly 3 steps with exactly 3 questions each.
- **SC-003**: A respondent who answers only by selecting predefined options can
  complete and submit the survey in under 5 minutes, and the displayed completion
  estimate is consistent with that (a 3-step survey with at most a 5-minute
  estimate).
- **SC-004**: 100% of attempts to leave a step or submit while a required question
  is unanswered are blocked with visible validation feedback, and 100% of
  well-formed completed responses are accepted by the submission flow.
- **SC-005**: After the change, 100% of the existing surveys (default and extended)
  still load at their existing URLs with unchanged content, and the project's
  existing test and build gates pass.

## Assumptions

- The new survey's subject is a short product experience pulse covering usage
  habits, experience/satisfaction, and follow-up preferences; exact wording and
  option content follow this subject and may be refined during implementation,
  provided the structural and type constraints above hold.
- The survey is registered in the survey manifest under the key `quick-pulse`
  and is reachable at `/surveys/quick-pulse`.
- The user's phrase "closed question types (checkbox, radio, dropdown, ..)" is
  interpreted as: the three explicitly named types must each appear at least once,
  and the remaining questions may be any of the other supported closed types
  (`rating`, `satisfaction`, `toggle_button`). Open-text and file-upload types are
  excluded.
- The survey reuses the existing rendering, navigation, validation, and submission
  infrastructure; no new question type, validation rule, or service is introduced.
- The completion estimate is set to roughly 3 minutes (a short survey of nine
  selection-based questions).
- Toggle questions may define a default value as already permitted by the existing
  schema; no other question type in this survey uses default values.
- Survey content is static (no dynamic or remote option sources, no conditional
  logic), consistent with the existing surveys and the current product scope.
