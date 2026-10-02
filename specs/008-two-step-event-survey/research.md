# Research: Two-Step Event Feedback Survey

Phase 0 output. The Technical Context in [plan.md](plan.md) contains no NEEDS
CLARIFICATION items; the decisions below were resolved by inspecting the existing
codebase and the clarified spec (session 2026-10-02).

## R1. Delivery mechanism for the new survey

- **Decision**: Add one new JSON fixture in `public/` and one named entry in
  `public/survey-manifest.json`; expose it through the existing `/surveys/:surveyKey`
  route and `SurveyCatalogService`.
- **Rationale**: This is the documented extension pattern for the app ("new survey
  variants are added by placing a validated JSON file in `public/` and adding one named
  entry to `public/survey-manifest.json`") and the only approach compatible with
  Constitution Principle I (adding a survey MUST NOT require code changes). The
  catalog already resolves key → source → validated config, and any load or validation
  failure already produces a user-visible "temporarily unavailable" error.
- **Alternatives considered**:
  - *Add an Angular route/component per survey* — rejected: requires code changes
    (violates Principle I) and duplicates the catalog mechanism.
  - *Extend an existing fixture* — rejected: spec FR-011 requires existing surveys to
    remain unchanged; a separate asset also keeps the new survey independently
    removable.

## R2. Fixture file name and survey identifier

- **Decision**: File `public/survey-event-feedback.json`; `surveyId` `SV010`; `version`
  `1.0`.
- **Rationale**: Matches the existing naming convention (`survey.json` for
  `customer-feedback`, `survey-8-step.json` for `extended-feedback`,
  `survey-quick-pulse.json` for `quick-pulse`) by deriving the file name from the
  manifest key. Existing survey IDs are `SV001`, `SV008`, and `SV009`; `SV010`
  continues the sequence without collision.
- **Alternatives considered**:
  - *`event-feedback.json` (no `survey-` prefix)* — rejected: inconsistent with the
    existing `survey-*.json` convention.
  - *Reuse an existing survey ID* — rejected: IDs are unique per survey document and a
    duplicate would confuse response processing.

## R3. Question composition (6 closed questions over 2 steps)

- **Decision**: Event-feedback subject (clarified), composed as:
  - **Step 1 "Your Attendance"** (icon `id-card`): `S1Q1` radio **required** — how the
    respondent attended (4 options); `S1Q2` checkbox optional — which parts of the
    event they took part in (5 options, no selection bounds); `S1Q3` dropdown optional
    — how they heard about the event (5 options).
  - **Step 2 "Your Experience"** (icon `star`): `S2Q1` rating **required** — overall
    rating (1–5, `leftLabel` "Poor", `rightLabel` "Excellent"); `S2Q2` satisfaction
    optional — satisfaction with content quality (5 standard options); `S2Q3`
    toggle_button optional, `defaultValue: false` — opt in to future-event
    invitations.
- **Rationale**: Satisfies every structural rule at once — exactly 2 pages × 3
  questions (FR-002); closed types only, no text and no attachments (FR-003/FR-007); at
  least one radio, checkbox, and dropdown (FR-004); the clarified one-required-per-step
  policy — the first question of each step (radio, rating) — with all other questions
  optional and no selection-bounds rules (FR-006); and event-feedback content split
  into attendance (step 1) and experience + follow-up preference (step 2) (FR-012).
  Required-answer enforcement is exercised once per step by the existing required-empty
  check in `response.validator.ts`. Each of the six questions uses a different closed
  type, so every closed renderer is exercised exactly once.
- **Alternatives considered**:
  - *Two radios or two dropdowns for variety* — rejected: the clarified mix asks for
    variety, and a distinct type per slot maximizes coverage of the closed renderers
    within six questions.
  - *Make every question required or none required* — rejected by clarification Q2
    (exactly one required question per step, the step's first).
  - *Different subject (product pulse, employee engagement)* — rejected by clarification
    Q1 (event feedback chosen); product pulse is already shipped as `quick-pulse`.

## R4. Rating scale: 1–5 instead of 1–10

- **Decision**: `S2Q1` uses `minValue: 1`, `maxValue: 5` (default step 1), with
  `leftLabel` "Poor" and `rightLabel` "Excellent".
- **Rationale**: `RatingQuestionComponent.ratingReadout` shows descriptive readouts
  ("4 / 5 — Good") only for a contiguous 1–5 scale; other scales show just "7 / 10".
  A five-tile scale is the conventional event-rating shape, fits narrow mobile widths
  without wrapping, and stays within the existing validator rules (`minValue` <
  `maxValue`, step divisibility). The "Poor"/"Excellent" end labels agree with the
  component's first and last descriptors.
- **Alternatives considered**: *1–10 as in `survey.json`/`survey-quick-pulse.json`* —
  rejected: loses the descriptive readout, and ten tiles are cramped on small screens.
  The data model has no scale-specific code path, so either choice is valid for the
  contract; 1–5 is the better fit for this subject.

## R5. Toggle semantics: opt-in with an explicit "no" default

- **Decision**: `S2Q3` is a `toggle_button` with `defaultValue: false`, labels "Yes,
  keep me informed" / "No, thank you", and an explanatory description. It is optional.
- **Rationale**: Inviting someone to future events is a consent-flavored choice, so the
  initial state must be "no". Existing behavior already treats an untouched toggle as
  `defaultValue` for validation, and the answer is only recorded once the respondent
  interacts (`SurveySessionService.setAnswer` is called from the toggle's change
  event), so an untouched toggle is **not** counted as answered and is **absent** from
  the response — exactly the spec's edge case. Explicitly choosing "No" records
  `false`.
- **Alternatives considered**: *`defaultValue: true`* — rejected: would pre-select
  consent. *Radio Yes/No instead of a toggle* — rejected: the toggle type is part of the
  closed-type mix the user asked for, and radio is already used on step 1.

## R6. Manifest key and URL

- **Decision**: Manifest key `event-feedback`, URL `/surveys/event-feedback`; entry
  `"event-feedback": "survey-event-feedback.json"`.
- **Rationale**: Confirmed with the user in the clarification session; short,
  descriptive, and stylistically consistent with `customer-feedback`,
  `extended-feedback`, and `quick-pulse`.
- **Alternatives considered**: *Other slugs* — rejected by user confirmation of
  `event-feedback`.

## R7. Page chrome (titles, descriptions, icons, estimate)

- **Decision**: Survey title "Event Feedback Survey" with a short description and
  `estimatedMinutes: 2`; each page carries a title, a ≤280-char description, and a
  documented icon key (`id-card`, `star`).
- **Rationale**: FR-008 requires the dock/topbar chrome to render as on the existing
  surveys. Both icon keys have `.page-icon[data-icon=…]` rules in
  `src/styles/components/card.css`, avoiding the unknown-key fallback to the clipboard
  glyph. `estimatedMinutes: 2` is inside the validated 1–120 range, matches six
  selection-only questions, and keeps the displayed estimate within SC-003's 3-minute
  bound.
- **Alternatives considered**: *Omit icons/descriptions and rely on fallbacks* —
  rejected: FR-008 requires valid icon keys and per-step descriptions.

## R8. Answer value representation per question type

- **Decision**: radio → selected option value (string); checkbox → array of selected
  option values (string[]); dropdown → selected option value (string); rating →
  numeric value as a string (e.g. `"4"`); satisfaction → selected option value
  (string); toggle → boolean (`true`/`false`) once touched; unanswered optional
  questions → absent answer or `null`.
- **Rationale**: Directly observed in the existing code — `rating-question.ts` emits
  `String(value)`, `satisfaction-question.ts` emits the option's `value`,
  `response.models.ts` defines `Answer.value` as `string | string[] | boolean | null`,
  and `response.validator.ts` validates dropdown values against the option set and
  toggle values as booleans (with the `defaultValue` fallback). No model or validator
  changes are needed.
- **Alternatives considered**: *Numeric answer value for rating* — rejected: the shared
  `Answer.value` union has no number member and the renderer already emits strings;
  changing it would be an out-of-scope code change.

## R9. Duplicate-manifest-key edge case

- **Decision**: The `event-feedback` key MUST NOT collide with existing keys. Because a
  JSON object cannot contain the same key twice, the realistic failure is a manifest
  entry that aliases another survey's file (or reuses its `surveyId`). The contract spec
  asserts that every manifest key has its own distinct source file and every source has
  its own distinct `surveyId`, and that the four expected keys map to the four
  expected files.
- **Rationale**: Gives an automated, repeatable check for the spec's collision edge
  case (007 relied on a manual quickstart step for the same risk).
- **Alternatives considered**: *Add runtime duplicate detection to the catalog service*
  — rejected: would require code changes (Principle I) for a state JSON cannot
  represent.

## R10. Verification strategy: a contract spec, not only a manual quickstart

- **Decision**: Add `src/app/survey/survey-fixtures.contract.spec.ts` (test only). It
  reads the manifest and fixtures from `public/`, then:
  1. validates every manifest entry with the real `validateSurveyConfig` and checks
     distinct sources/IDs (R9);
  2. runs a pure `structureViolations(survey)` rule set for the `event-feedback`
     fixture — 2 pages × 3 questions, closed types only, radio/checkbox/dropdown
     present, required set = first question of each page, no selection bounds, no
     attachments, chrome fields and known icon keys, estimate ≤3 — and expects none;
  3. proves each rule can fail by applying deliberate violations to cloned fixtures
     (spec SC-006);
  4. drives a real `SurveySessionService`: `next()` is blocked until `S1Q1` is
     answered; `buildResponse()` is `null` until `S2Q1` is answered; a required-only
     response is accepted with `surveyId` `SV010` and empty attachments;
     `buildCompletionTiles` reports "1/3 answered" for both steps (an untouched toggle
     is not counted) and "3/3 answered" when everything is answered.
- **Rationale**: Constitution Principle IV requires unit tests for a feature's domain
  rules; here the domain rules *are* the fixture's structure and required policy. The
  existing schema validator checks generic shape (unique IDs, non-empty options,
  ranges) and has no per-survey rule for step/question counts, question-type
  allow-lists, or required distribution, so a third step, a fourth question, a
  `textbox`, or a second required question would load and render without any
  user-visible error. 007's quickstart expected such edits to produce a visible error;
  a repeatable test is the correct control. The spec reads files with the Node
  built-ins already typed in `src/types/node-builtins.d.ts`, the same technique used by
  `src/app/shared/design-system/design-token.contract.spec.ts`.
- **Alternatives considered**:
  - *Configuration-only with manual validation (as in 007)* — rejected: leaves FR-013
    and SC-006 unmet and makes regressions invisible to CI.
  - *Strengthen the runtime validator with per-survey rules* — rejected: out of scope,
    changes runtime code (Principle I), and the "2 × 3" shape is a property of this one
    survey, not of the schema.
  - *A TestBed rendering test* — rejected for this feature: component rendering is
    already covered by the existing per-component specs, and a TestBed spec would only
    run under `ng test` (the raw `vitest run` command cannot JIT-compile Angular
    components, the pre-existing `app.spec.ts` failure). Rendering is verified through
    the quickstart browser walk-through instead.
