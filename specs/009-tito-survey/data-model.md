# Data Model: TITO Survey

This feature introduces **new instances** of the existing domain model established in
[001-survey-management/data-model.md](../001-survey-management/data-model.md) (and extended by
002–008). No entity, field, type, or validator is added, changed, or removed — the tables
below constrain the shape of the new `SV011` survey asset only. Full fixture rules live in
[contracts/survey-json.md](contracts/survey-json.md); answer shapes live in
[contracts/response-submission.md](contracts/response-submission.md).

## Survey (new instance)

| Field            | Value                                                      | Rules                                                                    |
| ---------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| surveyId         | `SV011`                                                    | Unique within the catalog (existing: `SV001`, `SV008`, `SV009`, `SV010`) |
| title            | "TITO Survey"                                              | Non-empty (existing rule); fixed by FR-009                               |
| description      | 1 sentence about Abdelrahman's personal and education info | Non-empty when present (existing rule)                                   |
| version          | `1.0`                                                      | Non-empty (existing rule)                                                |
| estimatedMinutes | `2`                                                        | Integer 1–120 (existing rule; spec FR-009 requires 1–3)                  |
| pages            | 2 entries                                                  | Existing rule: ≥1; **this survey fixes exactly 2** (FR-002)              |

## SurveyPage (2 new instances)

| pageId | title            | icon (documented key) | questions | Constraint                   |
| ------ | ---------------- | --------------------- | --------- | ---------------------------- |
| `S1`   | "Personal Info"  | `id-card`             | 2         | Exactly 2 questions (FR-003) |
| `S2`   | "Education Info" | `laptop-file`         | 2         | Exactly 2 questions (FR-003) |

All pages follow the existing `SurveyPage` rules: non-empty `pageId`/`title`, `pageId`s unique
within the survey, optional `description` 1–280 chars, optional `icon` a 1–32 char key into
the documented icon set (both keys above have `.page-icon[data-icon=…]` rules in
`src/styles/components/card.css`, so no fallback icon applies).

## Question (4 new instances)

| questionId | type       | required | type-specific fields                                                       | Attachments |
| ---------- | ---------- | -------- | -------------------------------------------------------------------------- | ----------- |
| `S1Q1`     | `radio`    | **true** | 5 options (living situation)                                               | 0           |
| `S1Q2`     | `dropdown` | false    | 5 options (age group)                                                      | 0           |
| `S2Q1`     | `radio`    | **true** | 6 options (highest completed education level)                              | 0           |
| `S2Q2`     | `rating`   | false    | `minValue: 1`, `maxValue: 5`, `leftLabel` "Poor", `rightLabel` "Excellent" | 0           |

Structural constraints (see [contracts/survey-json.md](contracts/survey-json.md)):

- `questionId`s unique within the survey; no question uses `textbox`, `textarea`, or
  attachment fields beyond `attachmentsRequired: 0` (FR-004, FR-008).
- Type distribution: 2× radio, 1× dropdown, 1× rating; the **last question of the survey**
  (`S2Q2`, the second question of the second step) is the rating (FR-005).
- Required distribution: exactly 2 required questions — the first question of each step:
  `S1Q1` and `S2Q1`; the dropdown and the rating are optional, and no question defines a
  min/max selection bound (FR-007).
- Selectable questions carry non-empty options with unique, non-empty `label`/`value` pairs
  (existing validator rule; FR-006).

## Answer (unchanged entity, constrained instances)

`Answer.value` remains `string | string[] | boolean | null`. For this survey:

| questionId | Value domain when answered                          | Unanswered     |
| ---------- | --------------------------------------------------- | -------------- |
| `S1Q1`     | String matching one of the question's option values | N/A — required |
| `S1Q2`     | String matching one of the question's option values | Absent/`null`  |
| `S2Q1`     | String matching one of the question's option values | N/A — required |
| `S2Q2`     | Numeric string `"1"`–`"5"`                          | Absent/`null`  |

No `ResponseAttachment` entries exist for this survey (all `attachmentsRequired: 0`).

## Validation Rules

Unchanged — enforced by the existing validators for these instances:

- **Schema** (`survey-config.validator.ts`): non-empty pages and questions, unique page and
  question IDs, non-empty options with unique values, rating `minValue` < `maxValue` with step
  divisibility, `estimatedMinutes` 1–120, page description 1–280 chars, icon 1–32 chars,
  `attachmentsRequired` 0–3.
- **Response** (`response.validator.ts`): required-empty check for `S1Q1` and `S2Q1` (one per
  step); dropdown string-in-options check for `S1Q2`; required-empty check for the rating only
  when it is marked required (it is optional in this survey), with the 1–5 range offered by
  the rating component itself.
- **Per-survey structure** (new contract spec `tito-survey.contract.spec.ts`): the FR-002–FR-010
  rules above — exactly 2 steps × 2 questions, closed types only, rating last with a 1–5
  labelled scale, unique IDs and complete option lists, the required set `['S1Q1', 'S2Q1']`,
  no attachments, and the survey chrome with shipped icons and a 1–3 minute estimate.
