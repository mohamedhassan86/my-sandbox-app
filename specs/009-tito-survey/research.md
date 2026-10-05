# Research: TITO Survey

Phase 0 output. The Technical Context in [plan.md](plan.md) contains no NEEDS CLARIFICATION
items; the decisions below were resolved by inspecting the existing codebase and the clarified
spec (session 2026-10-05).

## R1. Delivery mechanism for the new survey

- **Decision**: Add one new JSON fixture in `public/` and one named entry in
  `public/survey-manifest.json`; expose it through the existing `/surveys/:surveyKey` route
  and `SurveyCatalogService`.
- **Rationale**: This is the documented extension pattern for the app ("new survey variants
  are added by placing a validated JSON file in `public/` and adding one named entry to
  `public/survey-manifest.json`") and the only approach compatible with Constitution
  Principle I (adding a survey MUST NOT require code changes). The catalog already resolves
  key → source → validated config, and any load or validation failure already produces a
  user-visible "temporarily unavailable" error.
- **Alternatives considered**:
  - _Add an Angular route/component per survey_ — rejected: requires code changes (violates
    Principle I) and duplicates the catalog mechanism.
  - _Extend an existing fixture_ — rejected: FR-011 requires existing surveys to remain
    unchanged; a separate asset also keeps the TITO survey independently removable.

## R2. Fixture file name and survey identifier

- **Decision**: File `public/survey-tito.json`; `surveyId` `SV011`; `version` `1.0`.
- **Rationale**: Matches the existing naming convention by deriving the file name from the
  manifest key (`quick-pulse` → `survey-quick-pulse.json`, `event-feedback` →
  `survey-event-feedback.json`). Existing survey IDs are `SV001`, `SV008`, `SV009`, `SV010`;
  `SV011` continues the sequence without collision.
- **Alternatives considered**:
  - _`tito.json` (no `survey-` prefix)_ — rejected: inconsistent with the existing
    `survey-*.json` convention.
  - _Reuse an existing survey ID_ — rejected: IDs are unique per survey document and a
    duplicate would confuse response processing.

## R3. Manifest key and URL

- **Decision**: Catalog key `tito`, URL `/surveys/tito`.
- **Rationale**: The key is derived from the survey name and is not used by any existing
  entry (`customer-feedback`, `extended-feedback`, `quick-pulse`, `event-feedback`). The key
  keeps the URL short and predictable for sharing with Abdelrahman, and `SurveyCatalogService`
  already rejects unknown keys before loading any arbitrary source.
- **Alternatives considered**:
  - _`tito-survey`_ — rejected: redundant with the `survey-` file prefix; `tito` is the
    shortest unambiguous key.
  - _Reusing an existing key_ — rejected: FR-011 and the catalog-integrity contract check
    require distinct keys, sources, and survey IDs.

## R4. Question composition (4 closed questions over 2 steps)

- **Decision**: Composed as:
  - **Step 1 "Personal Info"** (icon `id-card`): `S1Q1` radio **required** — current living
    situation (5 options: with family, university dorm, rented apartment, own home, other);
    `S1Q2` dropdown optional — age group (5 options: under 18, 18–24, 25–34, 35–44, 45+).
  - **Step 2 "Education Info"** (icon `laptop-file`): `S2Q1` radio **required** — highest
    completed level of education (6 options: high school or below, diploma, bachelor's,
    master's, doctorate, other); `S2Q2` rating optional — overall education experience so far
    (1–5, `leftLabel` "Poor", `rightLabel` "Excellent").
- **Rationale**: Satisfies the user's request — two steps with two questions each (FR-002,
  FR-003), personal and education info (FR-010), closed types only (FR-004), and the last
  question of the survey is the rating (FR-005). The mix mirrors the existing surveys'
  component coverage (radio, dropdown, rating are all already rendered and tested) without
  introducing new component types.
- **Alternatives considered**:
  - _Use satisfaction or toggle for education level_ — rejected: satisfaction tiles read as an
    agree/disagree scale and a toggle is binary; neither expresses ordered education levels
    clearly. A radio group does, and a dropdown keeps step 1 compact.
  - _Use checkbox for personal info_ — rejected: the user's "closed type" request does not
    require multi-select, and the two personal questions are single-choice facts.

## R5. Rating scale: 1–5 instead of 1–10

- **Decision**: The closing rating uses `minValue: 1`, `maxValue: 5` with `leftLabel` "Poor"
  and `rightLabel` "Excellent".
- **Rationale**: Matches the event-feedback survey's rating (the most recent survey-contract
  precedent) and keeps the final question quick to answer on a phone. The schema validator
  enforces integers with `minValue < maxValue` and step divisibility; the contract check
  fixes the range for this survey.
- **Alternatives considered**:
  - _1–10 (the base fixture's scale)_ — rejected: a 5-point scale matches the existing
    survey-contract precedents and the short nature of this questionnaire.

## R6. Required-question policy

- **Decision**: Exactly one required question per step, and it is the step's first question
  (`S1Q1` radio, `S2Q1` radio). `S1Q2` (dropdown) and `S2Q2` (rating) are optional.
- **Rationale**: Consistent with the quick-pulse and event-feedback surveys, so progress,
  validation messaging, and the completion summary behave identically. The two answers the
  survey exists to collect — living situation and highest education level — are therefore
  guaranteed, while the "nice to have" details stay skippable.
- **Alternatives considered**:
  - _All questions required_ — rejected: inconsistent with the shipped surveys and would
    block a fast completion for optional details.
  - _Only the rating required_ — rejected: the rating is the last question, so the survey
    would have no gate on step 1, and the required-question self-check in the contract spec
    would need a per-survey exception.

## R7. Page chrome (titles, descriptions, icons, estimate)

- **Decision**: Titles "Personal Info" and "Education Info" with one-line descriptions, icons
  `id-card` and `laptop-file` (both have `.page-icon[data-icon=…]` rules in
  `src/styles/components/card.css`), and `estimatedMinutes: 2`.
- **Rationale**: The dock and topbar render these fields; the icon contract check requires a
  shipped style, and unknown keys would fall back to the clipboard glyph. A 2-minute estimate
  is truthful for four closed questions and satisfies FR-009 (1–3 minutes).
- **Alternatives considered**:
  - _Unshipped icons (`user`, `graduation-cap`)_ — rejected: they would fall back to the
    default glyph and fail the shipped-icon contract check.
  - _No page descriptions_ — rejected: the existing survey chrome and contract checks
    require page descriptions.

## R8. Answer value representation per question type

- **Decision**: Radio and dropdown answers are the selected option's `value` string
  (`with_family`, `18_24`, `bachelor`, …); the rating answer is the numeric string
  `"1"`–`"5"`; unanswered optional questions are absent or `null`; no response attachments
  exist.
- **Rationale**: These are the shapes the existing `SurveySessionService` and
  `validateSurveyResponse` already produce and accept for the shipped surveys; reusing them
  means the TITO responses flow through the existing submission path unchanged.

## R9. Duplicate-manifest-key edge case

- **Decision**: The contract check asserts that `tito` maps to `survey-tito.json` and that
  every catalog key still maps to a distinct source file and a distinct `surveyId`.
- **Rationale**: The catalog itself does not police aliasing; a key pointing at an existing
  fixture would silently serve the wrong survey. The assertion makes the "distinct asset"
  requirement (FR-011) executable.
- **Alternatives considered**:
  - _Trust review only_ — rejected: the project's quality gate is automated (Constitution
    Principle IV), and 008 established the same contract check.

## R10. Verification strategy: a contract spec, not only a manual quickstart

- **Decision**: Add `src/app/survey/tito-survey.contract.spec.ts` covering catalog integrity,
  the FR-002–FR-010 structure rules with a deliberate-violation table, the response shapes,
  the required-answer gates, and a `SurveySessionService` journey.
- **Rationale**: The schema validator is deliberately generic and cannot enforce
  per-survey rules such as "exactly two steps" or "the last question is the rating". Spec
  FR-012 and SC-005 require those rules to be provable and to fail loudly when broken.
- **Alternatives considered**:
  - _Extend the existing `survey-fixtures.contract.spec.ts`_ — rejected: that file encodes the
    event-feedback rules and shared catalog integrity; a per-survey file keeps each survey's
    rules isolated and readable (Principle II).
