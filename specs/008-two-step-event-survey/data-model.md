# Data Model: Two-Step Event Feedback Survey

This feature introduces **new instances** of the existing domain model established in
[001-survey-management/data-model.md](../001-survey-management/data-model.md) (and
extended by 002–007). No entity, field, type, or validator is added, changed, or
removed — the tables below constrain the shape of the new `SV010` survey asset only.
Full fixture rules live in [contracts/survey-json.md](contracts/survey-json.md); answer
shapes live in [contracts/response-submission.md](contracts/response-submission.md).

## Survey (new instance)

| Field | Value | Rules |
|---|---|---|
| surveyId | `SV010` | Unique within the catalog (existing: `SV001`, `SV008`, `SV009`) |
| title | "Event Feedback Survey" | Non-empty (existing rule) |
| description | ≤280-char subject line | Non-empty when present (existing rule) |
| version | `1.0` | Non-empty (existing rule) |
| estimatedMinutes | `2` | Integer 1–120 (existing rule; spec SC-003 requires ≤3) |
| pages | 2 entries | Existing rule: ≥1; **this survey fixes exactly 2** (FR-002) |

## SurveyPage (2 new instances)

| pageId | title | icon (documented key) | questions | Constraint |
|---|---|---|---|---|
| `S1` | "Your Attendance" | `id-card` | 3 | Exactly 3 questions (FR-002) |
| `S2` | "Your Experience" | `star` | 3 | Exactly 3 questions (FR-002) |

All pages follow the existing `SurveyPage` rules: non-empty `pageId`/`title`, `pageId`s
unique within the survey, optional `description` 1–280 chars, optional `icon` a 1–32
char key into the documented icon set (both keys above have `.page-icon[data-icon=…]`
rules in `src/styles/components/card.css`, so no fallback icon applies).

## Question (6 new instances)

| questionId | type | required | type-specific fields | Attachments |
|---|---|---|---|---|
| `S1Q1` | `radio` | **true** | 4 options | 0 |
| `S1Q2` | `checkbox` | false | 5 options (no selection bounds) | 0 |
| `S1Q3` | `dropdown` | false | 5 options | 0 |
| `S2Q1` | `rating` | **true** | `minValue: 1`, `maxValue: 5`, `leftLabel`/`rightLabel` | 0 |
| `S2Q2` | `satisfaction` | false | 5 options | 0 |
| `S2Q3` | `toggle_button` | false | `defaultValue: false`, `options.onLabel`/`offLabel`, `description` | 0 |

Structural constraints (see [contracts/survey-json.md](contracts/survey-json.md)):

- `questionId`s unique within the survey; no question uses `textbox`, `textarea`, or
  attachment fields beyond `attachmentsRequired: 0` (FR-003, FR-005, FR-007).
- Type distribution: 1× radio, 1× checkbox, 1× dropdown, 1× rating, 1× satisfaction,
  1× toggle_button (FR-003/FR-004).
- Required distribution: exactly 2 required questions — the first question of each
  step: `S1Q1` (radio) and `S2Q1` (rating); all other questions optional, and no
  question defines a min/max selection bound (FR-006, clarified 2026-10-02).
- Selectable questions carry non-empty options with unique, non-empty `label`/`value`
  pairs (existing validator rule).

## Answer (unchanged entity, constrained instances)

`Answer.value` remains `string | string[] | boolean | null`. For this survey:

| questionId | Value domain when answered | Unanswered |
|---|---|---|
| `S1Q1` | String matching one of the question's option values | N/A — required |
| `S1Q2` | String array of selected option values (empty/absent if skipped) | Absent/`null` |
| `S1Q3` | String matching one of the question's option values | Absent/`null` |
| `S2Q1` | Numeric string `"1"`–`"5"` | N/A — required |
| `S2Q2` | String matching one of the 5 satisfaction option values | Absent/`null` |
| `S2Q3` | `true`/`false` once the respondent interacts with the toggle | Absent (an untouched toggle is not an answer; validator falls back to `defaultValue` `false`) |

No `ResponseAttachment` entries exist for this survey (all `attachmentsRequired: 0`).

## Validation Rules

Unchanged — enforced by the existing validators for these instances:

- **Schema** (`survey-config.validator.ts`): non-empty pages and questions, unique page
  and question IDs, non-empty options with unique values, rating `minValue` <
  `maxValue` with step divisibility, `estimatedMinutes` 1–120, page description 1–280
  chars, icon 1–32 chars, `attachmentsRequired` 0–3.
- **Response** (`response.validator.ts`): required-empty check for `S1Q1` and `S2Q1`
  (one per step); dropdown string-in-options check for `S1Q3`; toggle boolean check for
  `S2Q3`; no min/max-selection rules apply to any question.

Not enforced by the schema validator and therefore guarded by the new contract spec
(research R10): exactly 2 pages × 3 questions, the closed-type allow-list, the
radio/checkbox/dropdown minimum mix, the required-question distribution, and the
no-attachments / no-selection-bounds policy.

## State Transitions

Unchanged from [001-survey-management/data-model.md](../001-survey-management/data-model.md)
— the survey participates in the same `loading` → `ready` → `editing` →
`submitting` → `submitted`/`submission-error` lifecycle (plus the existing
`configuration-error` state for an invalid fixture).
