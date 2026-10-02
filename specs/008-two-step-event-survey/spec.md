# Feature Specification: Two-Step Event Feedback Survey

**Feature Branch**: `008-two-step-event-survey`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "I need to add new survey, with 2 steps and each step have 3 questions. All questions must be closed questions. Make sure to use speckit in the implementation"

## Clarifications

### Session 2026-10-02

- Q: What should the new 2-step survey be about? → A: Event feedback — step 1 covers how the respondent attended and took part in the event; step 2 covers their rating of the event and a follow-up preference. The survey is registered under the catalog key `event-feedback` and is served at `/surveys/event-feedback`.
- Q: Which of the six questions should be required? → A: Exactly one required question per step, and it is the step's first question (a radio on step 1, a rating on step 2); the other four questions are optional.
- Q: Which closed question types should the six questions use? → A: A varied closed mix — radio, checkbox, and dropdown are each guaranteed at least once; the remaining slots may use rating, satisfaction, or toggle. Free-text and file-upload questions are excluded.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A new compact event-feedback survey is published without code changes (Priority: P1)

A survey author adds a new, standalone event-feedback survey definition to the
application as a validated configuration asset and registers it in the survey catalog.
The survey becomes reachable at its own named URL, while every existing survey
continues to work exactly as before. No existing application behavior is modified.

**Why this priority**: This is the foundation of the JSON-driven contract; without a
valid, registered survey definition there is nothing to render, validate, or submit.
It delivers immediate value on its own: a new, ready-to-use survey is published.

**Independent Test**: Can be fully tested by loading the new survey's URL and
verifying that it renders with exactly two steps and three questions per step, that
the configuration passes validation without errors, and that the existing surveys'
URLs still render their unchanged content.

**Acceptance Scenarios**:

1. **Given** the new survey configuration asset and its catalog entry are in place,
   **When** the application is loaded and the new survey's URL is opened, **Then**
   the survey renders with exactly two steps, each containing exactly three
   questions, no validation or loading errors are shown, and the survey title,
   estimated completion time, and each step's title, description, and icon appear in
   the standard navigation and header.
2. **Given** the new survey is registered in the catalog, **When** the existing
   default survey URL, the existing extended survey URL, and the existing quick-pulse
   survey URL are opened, **Then** each renders exactly as it did before the new
   survey was added.
3. **Given** the new survey's catalog entry, **When** the application starts,
   **Then** the survey catalog includes the new survey alongside the existing ones,
   with every catalog key resolving to its own distinct survey definition and no
   effect on the existing names or URLs.
4. **Given** the project's standard test suite, **When** it is run, **Then** an
   automated check confirms the new survey's structure (two steps, three closed
   questions per step, required-question distribution, no attachments) and that every
   catalog entry resolves to a valid, distinct survey definition.

---

### User Story 2 - A respondent completes the 2-step survey end to end (Priority: P1)

A respondent opens the new survey and walks through both steps. Every one of the six
questions is a closed question — the respondent answers by selecting from predefined
options (radio, checkbox, or dropdown) or choosing a closed scale value (rating,
satisfaction, or a toggle) — never by typing free text. Step navigation, progress, and
the completion summary behave exactly as on the existing surveys, and the response is
submitted through the standard response flow.

**Why this priority**: This is the core end-user value of the feature: a short,
all-closed event-feedback survey that attendees can finish quickly. It depends only on
Story 1 and delivers the user experience on its own.

**Independent Test**: Can be fully tested by opening the new survey, answering all six
questions using only selection controls, navigating step by step, submitting the
response, and confirming the completion summary shows both steps fully answered.

**Acceptance Scenarios**:

1. **Given** the new survey is open on step 1, **When** the respondent answers the
   step's three closed questions and moves to the next step, **Then** all three
   answers are recorded and the progress indicators (step buttons, progress ring,
   answered counts) update to reflect the completed step.
2. **Given** the respondent is on step 2, **When** they move back to step 1 and then
   forward again, **Then** the previously given answers are preserved and displayed
   on return.
3. **Given** all required answers have been given, **When** the respondent submits
   from the final step (step 2), **Then** the submission succeeds and the survey is
   replaced by the standard completion summary showing both steps.
4. **Given** the new survey is rendered, **When** the respondent inspects any of the
   six questions, **Then** the question offers only a closed answer interface (radio
   group, checkbox group, dropdown list, rating scale, satisfaction scale, or toggle)
   and provides no free-text input field.
5. **Given** a checkbox question, **When** the respondent selects one or more
   options, **Then** all selected options are recorded and the answer reflects every
   selected value.
6. **Given** a radio or dropdown question, **When** the respondent selects an option,
   **Then** exactly one value is recorded for that question and changing the
   selection replaces the previously recorded value.
7. **Given** the new survey is rendered, **When** the respondent reads the two steps,
   **Then** step 1 asks how they attended and took part in the event and step 2 asks
   them to rate the event and state a follow-up preference.

---

### User Story 3 - Required closed answers are enforced once per step (Priority: P2)

When a question on the new survey is marked required, the system prevents the
respondent from leaving the step or submitting the survey until a valid answer is
present, with immediate, visible feedback identifying which question is incomplete.
Optional questions may be left unanswered, and an unanswered optional question does
not block navigation or submission.

**Why this priority**: Data integrity depends on required answers being enforced
consistently with the other surveys; it depends on Story 2 working end to end.

**Independent Test**: Can be fully tested by attempting to advance from step 1 with
its required question unanswered (navigation blocked, visible error shown), then
answering only the required questions and confirming navigation and submission
succeed while optional questions remain empty.

**Acceptance Scenarios**:

1. **Given** step 1's required question (its first question, a radio) has no answer,
   **When** the respondent attempts to move to step 2, **Then** navigation is blocked
   and a visible validation message identifies the incomplete question.
2. **Given** step 1's required question has been answered, **When** the respondent
   moves to step 2 while the step's other (optional) questions are left unanswered,
   **Then** navigation succeeds without validation errors.
3. **Given** a checkbox question with one or more options selected, **When** the
   respondent deselects all options and attempts to navigate, **Then** the question
   is treated as unanswered and navigation succeeds (no minimum-selection rule applies
   to any question in this survey).
4. **Given** both required questions (one per step) are answered and all optional
   questions are left unanswered, **When** the respondent submits the survey, **Then**
   the submission succeeds and the unanswered optional questions are represented as
   absent or null in the response.
5. **Given** step 2's required question (its first question, a rating) is unanswered,
   **When** the respondent attempts to submit, **Then** submission is blocked with
   visible validation feedback and all previously entered answers are preserved.

---

### Edge Cases

- What happens if the new survey's catalog key collides with an existing key or
  points at another survey's definition? The new survey MUST have its own unique key
  and its own definition; the catalog MUST NOT serve one survey's content under
  another's key, and the automated structure check MUST fail when two catalog keys
  share a definition or a survey identifier.
- How are duplicate question IDs or step IDs handled within the new survey? The
  configuration MUST be rejected by the existing survey validation with a
  question-specific or step-specific error; no partial rendering is allowed.
- What happens when a selectable question (radio, checkbox, dropdown, or
  satisfaction) has a missing or empty option list, or duplicate option values? The
  configuration MUST be rejected with a user-visible schema validation error
  identifying the offending question/option, consistent with the existing surveys.
- What happens when a respondent leaves every question on a step unanswered? Each
  step contains exactly one required question (its first), so navigation from that
  step MUST be blocked until that required question is answered.
- What happens when a respondent changes an answer after moving past its step and
  later returns? The most recent answer MUST be the one displayed and the one
  submitted.
- What happens if the new survey's configuration fails validation at load time? The
  system MUST show a user-visible error for that survey only; the existing surveys
  MUST remain loadable and unaffected.
- How does the completion summary behave for this survey? It MUST follow the standard
  summary: both steps shown as answered tiles reflecting the questions answered per
  step (e.g. "n/3 answered" per step), and the standard Files tile MUST read "0 files
  attached" because this survey contains no attachment questions.
- What happens on small screens? The survey MUST remain fully usable (answerable,
  navigable, submittable) at mobile widths using the existing responsive layout; no
  question type may be rendered in a way that is truncated or unusable.
- What happens when the respondent leaves the opt-in toggle untouched? The toggle's
  initial state means "no"; an untouched toggle MUST NOT be counted as answered and
  MUST NOT record a consent or interest on the respondent's behalf.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST add one new survey as a standalone, validated
  configuration asset registered in the survey catalog under the unique named key
  `event-feedback`, reachable at its own named URL. Adding the survey MUST NOT require
  changes to existing application behavior.
- **FR-002**: The new survey MUST contain exactly two steps and exactly three
  questions on each step (six questions in total).
- **FR-003**: Every one of the six questions MUST use a closed question type —
  `radio`, `checkbox`, `dropdown`, `rating`, `satisfaction`, or `toggle_button`.
  Free-text question types (`textbox`, `textarea`) and file-upload questions MUST NOT
  appear in this survey.
- **FR-004**: The survey MUST include at least one `radio` question, at least one
  `checkbox` question, and at least one `dropdown` question among its six questions.
- **FR-005**: Every selectable question (`radio`, `checkbox`, `dropdown`,
  `satisfaction`) MUST define a non-empty option list with unique, non-empty option
  values and labels; step IDs MUST be unique within the survey and question IDs MUST
  be unique within the survey.
- **FR-006**: Each of the two steps MUST contain exactly one required question, and it
  MUST be the step's first question (a `radio` on step 1 and a `rating` on step 2);
  all other questions MUST be optional, so required-answer enforcement is exercised
  exactly once per step. No question in the survey defines a minimum- or
  maximum-selection rule.
- **FR-007**: No question in the survey MAY require or allow attachments (zero
  attachments for every question).
- **FR-008**: The survey MUST define a title, a short description, and an estimated
  completion time in minutes, and each of the two steps MUST define a title, a short
  description, and a valid icon key so the dock and topbar chrome render the same way
  they do for the existing surveys.
- **FR-009**: Required answers MUST be validated before step navigation and before
  submission, with the standard visible validation feedback; optional answers MAY be
  left unanswered and MUST be represented as absent or null in the response.
- **FR-010**: Submissions MUST flow through the standard response submission
  mechanism, and each question type MUST be represented in the submitted response
  using its documented format (radio: single option value; checkbox: list of selected
  option values; dropdown: selected option value; rating and satisfaction: scale
  value; toggle: boolean).
- **FR-011**: The existing default survey, extended survey, and quick-pulse survey
  MUST remain unchanged and fully functional (content, URLs, and behavior) after this
  feature is added.
- **FR-012**: The survey's content MUST address event feedback: step 1 captures how
  the respondent attended and took part in the event, and step 2 captures their rating
  of the event and their follow-up preference.
- **FR-013**: The survey's structural rules (FR-002 through FR-008) and its
  required-answer behavior (FR-006, FR-009) MUST be verified by an automated check
  that runs with the project's standard test suite, so a regression is caught before
  release.

### Key Entities

- **Survey Definition (new survey asset)**: A standalone, validated survey
  configuration consisting of a unique survey identifier, title, description,
  estimated completion time, and exactly two steps; registered in the survey catalog
  under the unique named key `event-feedback`.
- **Step (page)**: One of exactly two ordered stages of the survey, each with a unique
  step identifier, title, short description, icon key, and exactly three questions.
- **Closed Question**: A question definition whose answer domain is fully predefined —
  a single-select choice set (radio, dropdown), a multi-select choice set (checkbox),
  a closed scale (rating, satisfaction), or a boolean toggle — with a label, an
  optional required flag, and, where applicable, an option list.
- **Response**: The respondent's answers to the six questions plus the standard
  submission metadata, produced by the existing response flow and constrained to the
  documented value format of each closed question type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The new survey is published without changing any existing application
  behavior — the only additions are the survey definition, its single catalog entry,
  an automated structure check, and documentation — and it loads and renders
  successfully at its named URL.
- **SC-002**: 100% of the survey's questions (6 of 6) use closed question types, and
  the survey contains exactly 2 steps with exactly 3 questions each.
- **SC-003**: A respondent who answers only by selecting predefined options can
  complete and submit the survey in under 3 minutes, and the displayed completion
  estimate is consistent with that (a 2-step survey with at most a 3-minute
  estimate).
- **SC-004**: 100% of attempts to leave a step or submit while a required question is
  unanswered are blocked with visible validation feedback, and 100% of well-formed
  completed responses are accepted by the submission flow.
- **SC-005**: After the change, 100% of the existing surveys (default, extended, and
  quick-pulse) still load at their existing URLs with unchanged content, and the
  project's existing test and build gates pass.
- **SC-006**: The new survey's structural rules are confirmed on every run of the
  project's test suite with zero manual steps, and a deliberate violation (a third
  step, a fourth question, a free-text question, or a second required question on a
  step) causes that run to fail.

## Assumptions

- The new survey's subject is event feedback covering attendance and participation
  (step 1) and the respondent's rating of the event with a follow-up preference
  (step 2); exact wording and option content follow this subject and may be refined
  during implementation, provided the structural and type constraints above hold.
- The survey is registered in the survey catalog under the key `event-feedback` and is
  reachable at `/surveys/event-feedback` (confirmed in clarification session
  2026-10-02).
- The user's phrase "closed questions" is interpreted as: the three selection types
  (radio, checkbox, dropdown) must each appear at least once, and the remaining
  questions may be any of the other supported closed types (`rating`, `satisfaction`,
  `toggle_button`). Open-text and file-upload types are excluded. This is the same
  interpretation confirmed for the existing quick-pulse survey.
- The survey reuses the existing rendering, navigation, validation, and submission
  behavior; no new question type, validation rule, or service is introduced, and no
  existing behavior changes.
- The completion estimate is set to roughly 2 minutes (a short survey of six
  selection-based questions).
- The follow-up preference is an opt-in toggle whose initial state is "no", so an
  untouched toggle never records interest or consent on the respondent's behalf. No
  other question in this survey uses a default value.
- No question defines a minimum- or maximum-selection rule, so the optional checkbox
  is fully skippable (zero or more selections), consistent with the quick-pulse
  survey.
- Survey content is static (no dynamic or remote option sources, no conditional
  logic), consistent with the existing surveys and the current product scope; for
  example, an online attendee may simply skip an in-person-only option.
