# Feature Specification: TITO Survey

**Feature Branch**: `009-tito-survey`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Create new survey with name TITO survey to ask my friend abdelrahman about some personal and education info. Just two steps each have 2 questions. Make questions from closed type and last question must be rating"

## Clarifications

### Session 2026-10-05

- Q: Who is the respondent and what should the two steps cover? → A: The respondent is Abdelrahman. Step 1 ("Personal Info") covers personal details; step 2 ("Education Info") covers his education. The survey is registered under the catalog key `tito` and served at `/surveys/tito`.
- Q: Which closed question types should the four questions use? → A: Step 1 uses a required radio and an optional dropdown; step 2 uses a required radio and ends on the rating. No free-text or file-upload questions appear anywhere.
- Q: Which questions are required? → A: Exactly one required question per step, and it is the step's first question (the radio on each step). The dropdown and the closing rating stay optional, matching the required-question policy of the existing quick-pulse and event-feedback surveys.
- Q: The user's message said "some personal and education info" → A: implemented as personal info on step 1 (living situation, age group) and education info on step 2 (highest completed level of education, rating of the overall education experience).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - A new TITO survey is published without code changes (Priority: P1)

A survey author adds a new, standalone "TITO Survey" definition to the application as a
validated configuration asset and registers it in the survey catalog. The survey becomes
reachable at its own named URL (`/surveys/tito`), while every existing survey continues to
work exactly as before. No existing application behavior is modified.

**Why this priority**: This is the foundation of the JSON-driven contract; without a valid,
registered survey definition there is nothing to render, validate, or submit. It delivers
immediate value on its own: the TITO survey is published and can be shared with Abdelrahman.

**Independent Test**: Can be fully tested by loading `/surveys/tito` and verifying that it
renders with exactly two steps and two questions per step, that the configuration passes
validation without errors, and that every existing survey URL still renders its unchanged
content.

**Acceptance Scenarios**:

1. **Given** the new survey configuration asset and its catalog entry are in place, **When**
   the application is loaded and `/surveys/tito` is opened, **Then** the survey renders with
   title "TITO Survey", a short completion estimate, and exactly two steps — "Personal Info"
   and "Education Info" — each containing exactly two questions, with no validation or
   loading errors shown.
2. **Given** the TITO survey is registered in the catalog, **When** the existing default,
   extended, quick-pulse, and event-feedback survey URLs are opened, **Then** each renders
   exactly as it did before the TITO survey was added.
3. **Given** the project's standard test suite, **When** it is run, **Then** an automated
   check confirms the TITO survey's structure (two steps, two closed questions per step, a
   closing rating, the required-question policy, no attachments) and that every catalog entry
   resolves to a valid, distinct survey definition.

---

### User Story 2 - Abdelrahman completes the 2-step survey end to end (Priority: P1)

Abdelrahman opens the TITO survey and walks through both steps. Every one of the four
questions is a closed question — he answers by selecting a predefined option or choosing a
rating value, never by typing free text. Step navigation, progress, and the completion
summary behave exactly as on the existing surveys, and the response is submitted through the
standard response flow.

**Why this priority**: This is the core end-user value of the feature: a short, all-closed
survey that collects Abdelrahman's personal and education info quickly.

**Independent Test**: Can be fully tested by opening `/surveys/tito`, answering the four
questions using only selection controls, navigating between the steps, submitting the
response, and confirming the completion summary shows both steps fully answered.

**Acceptance Scenarios**:

1. **Given** the TITO survey is open on step 1, **When** Abdelrahman answers the required
   radio and optionally the dropdown and moves to the next step, **Then** all of step 1's
   answers are preserved and step 2 is shown.
2. **Given** Abdelrahman is on step 2, **When** he answers the required education question,
   chooses a rating value on the closing rating scale, and submits, **Then** the response is
   submitted through the standard flow and the completion summary shows both steps answered.
3. **Given** the survey is fully answered, **When** he submits, **Then** the submitted
   answers use the documented value representation for each question type (option values for
   radio and dropdown, a numeric string for the rating) and no attachments.
4. **Given** the survey is open, **When** he looks at any question, **Then** every question
   is a closed control — radio group, dropdown, or rating scale — and no free-text field or
   file upload appears anywhere.

---

### User Story 3 - Required closed answers are enforced once per step (Priority: P2)

Abdelrahman cannot leave step 1 or submit the survey until the one required question of each
step is answered, exactly as on the existing surveys.

**Why this priority**: Guarantees the two answers the survey exists to collect (personal
living situation and highest completed education level) are present in every submission,
without blocking the optional questions.

**Independent Test**: Can be fully tested by attempting to continue with nothing answered,
answering only the required questions, and confirming navigation and submission behave as
documented.

**Acceptance Scenarios**:

1. **Given** step 1 is shown with nothing answered, **When** Abdelrahman attempts to
   continue, **Then** navigation is blocked and a visible error identifies the required
   question.
2. **Given** only the required question on step 1 is answered, **When** he continues, **Then**
   navigation to step 2 succeeds with no validation errors.
3. **Given** only the required question on step 2 is answered, **When** he submits, **Then**
   the response is accepted with just the two required answers, and the optional dropdown and
   rating may remain unanswered.
4. **Given** a fully answered survey, **When** the response is validated, **Then** it is
   accepted with all four answers.

---

### Edge Cases

- **Duplicate/conflicting catalog key**: registering `tito` must not replace or alias any
  existing key; in particular it must not map to an existing fixture, and every key must keep
  a distinct source file and survey ID (documented manifest convention).
- **Changing an answer**: selecting a different radio or dropdown option keeps only the
  latest value; clearing the optional dropdown returns it to an unanswered state.
- **Untouched rating**: the closing rating is optional; submitting without it must succeed and
  it must not count as answered in the completion summary.
- **Out-of-range or unknown values**: a dropdown value that is not one of the listed options
  is rejected by the existing response validator; rating values outside 1–5 are not offered.
- **Small screens**: the two-question steps and the 1–5 rating scale must remain fully usable
  at phone width (~390 px).
- **Invalid configuration**: a broken TITO fixture (duplicate option value, empty options,
  invalid estimate) must fail visibly with the standard "temporarily unavailable" state and
  must not render a partial survey.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The application MUST publish a new survey titled "TITO Survey" from a new
  configuration asset registered in the survey catalog under the key `tito`, reachable at
  `/surveys/tito`, without any runtime application code change.
- **FR-002**: The survey MUST contain exactly two steps (pages).
- **FR-003**: Each step MUST contain exactly two questions (four questions in total).
- **FR-004**: Every question MUST use a closed question type — one of radio, checkbox,
  dropdown, rating, satisfaction, or toggle button. No free-text question (`textbox`,
  `textarea`) or file-upload question may appear.
- **FR-005**: The last question of the survey MUST be a rating question with a 1–5 integer
  scale and non-empty labels for both ends of the scale.
- **FR-006**: Step/page identifiers and question identifiers MUST be unique within the
  survey; every selectable question MUST define non-empty options with unique values.
- **FR-007**: Exactly one question per step MUST be required, and it MUST be that step's
  first question; no question may define a minimum or maximum selection bound.
- **FR-008**: No question may accept attachments; every question MUST set
  `attachmentsRequired` to 0 with no accepted file types or size limits.
- **FR-009**: The survey MUST define its chrome: a non-empty description, version, an
  estimated completion time of 1–3 minutes, and for each step a title, a description, and an
  icon key that has a shipped style.
- **FR-010**: The survey content MUST cover Abdelrahman's personal info on step 1 (living
  situation, age group) and education info on step 2 (highest completed level of education,
  rating of overall education experience).
- **FR-011**: Adding the TITO survey MUST NOT change any existing survey, catalog key, or URL.
- **FR-012**: An automated contract check MUST verify the catalog entry, the structure rules
  of FR-002–FR-010, the respondent journey, and the required-answer behavior, and MUST fail
  with a message naming the violated rule when any of those rules is broken deliberately.

### Key Entities

- **Survey**: the TITO survey document — ID `SV011`, title "TITO Survey", version, short
  description, 1–3 minute estimate, and exactly two pages.
- **Survey Page (step)**: "Personal Info" (icon `id-card`) and "Education Info" (icon
  `laptop-file`), each with a description and exactly two questions.
- **Question**: four closed questions — `S1Q1` radio (required), `S1Q2` dropdown, `S2Q1`
  radio (required), `S2Q2` rating 1–5 (last question of the survey).
- **Option**: a label/value pair on the radio and dropdown questions.
- **Answer**: a selected option value (radio, dropdown) or a numeric rating value (rating).
- **Response**: the submitted answers with the survey ID and version; no attachments.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: `/surveys/tito` loads and renders exactly 2 steps × 2 closed questions with zero
  validation errors, and the survey chrome (title, estimate, both step titles, descriptions,
  and icons) is visible.
- **SC-002**: 100% of the survey's questions can be answered using only selection controls —
  no keyboard text entry is ever required.
- **SC-003**: The survey's declared completion estimate is 3 minutes or fewer.
- **SC-004**: A submission with only the two required answers succeeds, and the completion
  summary reports the answered counts per step (1/2 and 1/2 when the optional questions are
  skipped).
- **SC-005**: Deliberately breaking any structure rule (step or question count, a free-text
  swap, moving the rating off the last question, a second required question, an attachment,
  an unshipped icon) makes the automated contract check fail with the violated rule named.

## Assumptions

- The survey audience is Abdelrahman, so question labels are written in the second person and
  the tone matches the existing surveys.
- "TITO" is the survey's name as given; it is used verbatim in the title and the catalog key
  `tito` is derived from it.
- The required-question policy follows the established quick-pulse and event-feedback surveys:
  exactly one required question per step, its first.
- The survey identifier `SV011` continues the existing ID sequence (`SV001`, `SV008`,
  `SV009`, `SV010`); the version starts at `1.0`.
- No new question types, validators, or runtime code are needed; the existing renderer,
  session, response validator, and submission service handle all four questions.
