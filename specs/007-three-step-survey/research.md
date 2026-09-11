# Research: Three-Step Closed-Question Survey

Phase 0 output. The Technical Context in [plan.md](plan.md) contains no NEEDS
CLARIFICATION items; the decisions below were resolved by inspecting the existing
codebase and the clarified spec (session 2026-09-11).

## R1. Delivery mechanism for the new survey

- **Decision**: Add one new JSON fixture in `public/` and one named entry in
  `public/survey-manifest.json`; expose it through the existing `/surveys/:surveyKey`
  route and `SurveyCatalogService`.
- **Rationale**: This is the documented extension pattern for the app ("new survey
  variants are added by placing a validated JSON file in `public/` and adding one named
  entry to `public/survey-manifest.json`") and the only approach compatible with
  Constitution Principle I (adding a survey MUST NOT require code changes). The
  catalog already resolves key → source → validated config, and unknown keys already
  produce a user-visible error.
- **Alternatives considered**:
  - *Add an Angular route/component per survey* — rejected: requires code changes
    (violates Principle I) and duplicates the catalog mechanism.
  - *Extend the default four-page survey or the extended fixture* — rejected: spec
    FR-011 requires existing surveys to remain unchanged; a separate asset also keeps
    the new survey independently removable.

## R2. Fixture file name and survey identifier

- **Decision**: File `public/survey-quick-pulse.json`; `surveyId` `SV009`; `version`
  `1.0`.
- **Rationale**: Matches the existing naming convention (`survey.json` for
  `customer-feedback`, `survey-8-step.json` for `extended-feedback`) by deriving the
  file name from the manifest key. Existing survey IDs are `SV001` and `SV008`;
  `SV009` continues the sequence without collision.
- **Alternatives considered**:
  - *`quick-pulse.json` (no `survey-` prefix)* — rejected: inconsistent with the
    `survey-8-step.json` convention.
  - *Reuse an existing survey ID* — rejected: IDs are unique per survey document and a
    duplicate would confuse response processing.

## R3. Question composition (9 closed questions over 3 steps)

- **Decision**: Product experience pulse subject (clarified), composed as:
  - **Step 1 "How You Use"** (icon `laptop-file`): `S1Q1` radio **required** — usage
    frequency (5 options); `S1Q2` checkbox **required**, `minSelections: 1` — areas
    used most (5 options); `S1Q3` dropdown **required** — main device (4 options).
  - **Step 2 "Your Experience"** (icon `star`): `S2Q1` rating optional — overall
    experience (1–10, `leftLabel` "Poor", `rightLabel` "Excellent"); `S2Q2`
    satisfaction optional — overall satisfaction (5 standard options); `S2Q3`
    checkbox optional — most-wanted improvements (5 options).
  - **Step 3 "Next Steps"** (icon `shield-check`): `S3Q1` radio optional — likelihood
    to recommend (5 options); `S3Q2` toggle_button optional, `defaultValue: false` —
    product update notifications; `S3Q3` dropdown optional — preferred follow-up
    channel (3 options).
- **Rationale**: Satisfies every structural rule at once — exactly 3 pages × 3
  questions (FR-002); all closed types with no text or attachments (FR-003/FR-007);
  at least one radio, checkbox, and dropdown (FR-004); the clarified minimum-required
  mix with exactly one required radio, one required checkbox, and one required
  dropdown and all other questions optional (FR-006, Q4 answer); each required
  selection control style is exercised by `response.validator.ts`'s required-empty and
  min/max-selection checks. The subject follows the clarified product-experience-pulse
  theme (Q2 answer) and is consistent with the app's existing customer-feedback
  surveys.
- **Alternatives considered**:
  - *All nine questions from only the three named types* — rejected by clarification
    Q1 (all supported closed types allowed).
  - *Majority-required or all-required mix* — rejected by clarification Q4 (minimum
    required mix chosen).
  - *Different subject (employee engagement, event feedback)* — rejected by
    clarification Q2 (product experience pulse chosen).

## R4. Manifest key and URL

- **Decision**: Manifest key `quick-pulse`, URL `/surveys/quick-pulse` (clarified,
  Q3 answer); entry `"quick-pulse": "survey-quick-pulse.json"`.
- **Rationale**: Confirmed with the user; short, descriptive, and stylistically
  consistent with `customer-feedback` and `extended-feedback`.
- **Alternatives considered**: *Other slugs* — rejected by user confirmation of
  `quick-pulse`.

## R5. Page chrome (titles, descriptions, icons, estimate)

- **Decision**: Survey title "Product Pulse Survey" with a ≤280-char description and
  `estimatedMinutes: 3`; each page carries a title, a ≤280-char description, and a
  documented icon key (`laptop-file`, `star`, `shield-check`).
- **Rationale**: FR-008 requires the dock/topbar chrome to render as on existing
  surveys; the icon keys are taken from the documented icon token set
  (`src/styles/tokens/icons.css` — includes `id-card`, `star`, `clipboard`,
  `shield-check`, `file-shield`, `laptop-file`, `check`, `clock`, …), avoiding the
  unknown-key fallback-to-clipboard behavior. `estimatedMinutes: 3` is inside the
  validated 1–120 range and keeps the displayed estimate within the 5-minute bound of
  spec SC-003.
- **Alternatives considered**: *Omit icons/descriptions and rely on fallbacks* —
  rejected: FR-008 requires valid icon keys and per-step descriptions so the chrome
  matches existing surveys.

## R6. Answer value representation per question type

- **Decision**: radio → selected option value (string); checkbox → array of selected
  option values (string[]); dropdown → selected option value (string); rating →
  numeric value as a string (e.g. `"7"`); satisfaction → selected option value
  (string); toggle → boolean (`true`/`false`), with the validator falling back to the
  question's `defaultValue` (`false`) when no answer is recorded; unanswered optional
  questions → absent answer or `null`.
- **Rationale**: Directly observed in the existing code — `rating-question.ts`
  emits `String(value)`, `satisfaction-question.ts` emits the option's `value`,
  `response.models.ts` defines `Answer.value` as `string | string[] | boolean |
  null`, and `response.validator.ts` validates dropdown values against the option
  set, checkbox min/max selections, and toggle booleans with the `defaultValue`
  fallback. No model or validator changes are needed.
- **Alternatives considered**: *Numeric answer value for rating* — rejected: the
  shared `Answer.value` union has no number member and the renderer already emits
  strings; changing it would be an out-of-scope code change.

## R7. Duplicate-manifest-key edge case

- **Decision**: The `quick-pulse` key MUST NOT collide with existing keys; the
  manifest is a plain JSON key → source map, so a conflicting registration is detected
  as the new key overwriting/aliasing an existing entry or pointing at the wrong
  fixture, and the quickstart includes an explicit check that all three keys resolve
  to their own distinct fixture files.
- **Rationale**: A JSON object cannot contain the same key twice, so "duplicate key"
  at load time is impossible; the realistic failure is authoring the manifest so that
  `quick-pulse` maps to an existing survey's file (or vice versa), which would serve
  the wrong content under a key — the quickstart's distinct-source check catches it.
- **Alternatives considered**: *Add runtime duplicate detection to the catalog
  service* — rejected: would require code changes (Principle I) for a state that JSON
  cannot represent.
