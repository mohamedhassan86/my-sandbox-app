# Data Model: Three-Step Closed-Question Survey

This feature introduces **new instances** of the existing domain model established in
[001-survey-management/data-model.md](../001-survey-management/data-model.md) (and
extended by 002–006). No entity, field, type, or validator is added, changed, or
removed — the tables below constrain the shape of the new `SV009` survey asset only.
Full fixture rules live in
[contracts/survey-json.md](contracts/survey-json.md); answer shapes live in
[contracts/response-submission.md](contracts/response-submission.md).

## Survey (new instance)

| Field | Value | Rules |
|---|---|---|
| surveyId | `SV009` | Unique within the catalog (existing: `SV001`, `SV008`) |
| title | "Product Pulse Survey" | Non-empty (existing rule) |
| description | ≤280-char subject line | Non-empty when present (existing rule) |
| version | `1.0` | Non-empty (existing rule) |
| estimatedMinutes | `3` | Integer 1–120 (existing rule; spec SC-003 requires ≤5) |
| pages | 3 entries | Existing rule: ≥1; **this survey fixes exactly 3** (FR-002) |

## SurveyPage (3 new instances)

| pageId | title | icon (documented key) | questions | Constraint |
|---|---|---|---|---|
| `S1` | "How You Use" | `laptop-file` | 3 | Exactly 3 questions (FR-002) |
| `S2` | "Your Experience" | `star` | 3 | Exactly 3 questions (FR-002) |
| `S3` | "Next Steps" | `shield-check` | 3 | Exactly 3 questions (FR-002) |

All pages follow the existing `SurveyPage` rules: non-empty `pageId`/`title`,
`pageId`s unique within the survey, optional `description` 1–280 chars, optional
`icon` a 1–32 char key into the documented icon set (all three keys above exist in
`src/styles/tokens/icons.css`, so no fallback icon applies).

## Question (9 new instances)

| questionId | type | required | type-specific fields | Attachments |
|---|---|---|---|---|
| `S1Q1` | `radio` | **true** | 5 options | 0 |
| `S1Q2` | `checkbox` | **true** | 5 options, `minSelections: 1` | 0 |
| `S1Q3` | `dropdown` | **true** | 4 options | 0 |
| `S2Q1` | `rating` | false | `minValue: 1`, `maxValue: 10`, `leftLabel`/`rightLabel` | 0 |
| `S2Q2` | `satisfaction` | false | 5 options | 0 |
| `S2Q3` | `checkbox` | false | 5 options | 0 |
| `S3Q1` | `radio` | false | 5 options | 0 |
| `S3Q2` | `toggle_button` | false | `defaultValue: false`, `options.onLabel`/`offLabel` | 0 |
| `S3Q3` | `dropdown` | false | 3 options | 0 |

Structural constraints (see [contracts/survey-json.md](contracts/survey-json.md)):

- `questionId`s unique within the survey; no question uses `textbox`, `textarea`, or
  attachment fields beyond `attachmentsRequired: 0` (FR-003, FR-005, FR-007).
- Type distribution: 2× radio, 2× checkbox, 2× dropdown, 1× rating, 1×
  satisfaction, 1× toggle_button (FR-003/FR-004).
- Required distribution: exactly 3 required questions — one radio (`S1Q1`), one
  checkbox (`S1Q2`), one dropdown (`S1Q3`); all other questions optional (FR-006,
  clarification Q4).
- Selectable questions carry non-empty options with unique, non-empty
  `label`/`value` pairs (existing validator rule).

## Answer (unchanged entity, constrained instances)

`Answer.value` remains `string | string[] | boolean | null`. For this survey:

| questionId | Value domain when answered | Unanswered |
|---|---|---|
| `S1Q1`, `S1Q3`, `S3Q1`, `S3Q3` | String matching one of the question's option values | N/A (required) except `S3Q1`/`S3Q3`: absent/`null` |
| `S1Q2` | Non-empty string array of selected option values (`minSelections: 1`) | N/A (required) |
| `S2Q3` | String array of selected option values (may be absent) | Absent/`null` |
| `S2Q1` | Numeric string `"1"`–`"10"` | Absent/`null` |
| `S2Q2` | String matching one of the 5 satisfaction option values | Absent/`null` |
| `S3Q2` | `true`/`false` | Validator falls back to `defaultValue` (`false`) |

No `ResponseAttachment` entries exist for this survey (all `attachmentsRequired: 0`).

## Validation Rules

Unchanged — enforced by the existing validators for these instances:

- **Schema** (`survey-config.validator.ts`): page/question counts and IDs, closed-type
  set, non-empty options with unique values, `minSelections`/`maxSelections` bounds,
  rating `minValue` < `maxValue` with step divisibility, `estimatedMinutes` 1–120,
  page description 1–280 chars, icon 1–32 chars, `attachmentsRequired` 0–3.
- **Response** (`response.validator.ts`): required-empty check for `S1Q1`–`S1Q3`;
  min-selection check for `S1Q2`; dropdown string-in-options checks for `S1Q3`/`S3Q3`;
  toggle boolean check for `S3Q2`.

## State Transitions

Unchanged from [001-survey-management/data-model.md](../001-survey-management/data-model.md)
— the survey participates in the same `loading` → `ready` → `editing` →
`submitting` → `submitted`/`submission-error` lifecycle (plus the existing
`configuration-error` state for an invalid fixture).
