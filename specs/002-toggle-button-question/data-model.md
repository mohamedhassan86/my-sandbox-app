# Data Model: Toggle Button Question Type

This amends the data model established in
[001-survey-management/data-model.md](../001-survey-management/data-model.md). Only
new or changed entities/fields are shown; all other entities are unchanged.

## Question (amended)

| Field | Type | Rules |
|---|---|---|
| type | radio \| checkbox \| textbox \| textarea \| rating \| satisfaction \| **toggle_button** | Required; unknown values reject the survey |

## ToggleButtonQuestion (new, extends QuestionBase)

| Field | Type | Rules |
|---|---|---|
| type | `'toggle_button'` | Required discriminator |
| questionId | string | Required and unique within the survey (existing `QuestionBase` rule) |
| label | string | Required and non-empty (existing `QuestionBase` rule) |
| description | string | Optional help text |
| defaultValue | boolean | Optional; when present MUST be a boolean literal (`true`/`false`); non-boolean values reject the survey |
| required | boolean | Defaults to `false` (existing `QuestionBase` rule) |
| options.onLabel | string | Optional; defaults to `"On"` when omitted |
| options.offLabel | string | Optional; defaults to `"Off"` when omitted |

## Answer (amended)

| Field | Type | Rules |
|---|---|---|
| questionId | string | References the answered question |
| value | string \| string[] \| **boolean** \| null | String for radio/text; array for checkbox; **boolean for toggle_button**; null when unanswered |

## Validation Rules Summary

- Schema validation (`survey-config.validator.ts`):
  - `toggle_button` is added to the recognized question type set.
  - `defaultValue`, when present, MUST be a boolean; otherwise the question definition
    is rejected with a path-specific issue.
  - `options.onLabel` / `options.offLabel`, when present, MUST be non-empty strings.
- Response validation (`response.validator.ts`):
  - A `toggle_button` answer MUST be `true`, `false`, or absent (`null`/`undefined`).
  - `null`, strings, numbers, and arrays are rejected as the answer type for a
    `toggle_button` question with a question-specific validation message.
  - `required: true` MUST have a boolean value present (default or explicit) — see
    research.md "Required + default value interaction" decision.

## State Transitions

Unchanged from [001-survey-management/data-model.md](../001-survey-management/data-model.md)
— `toggle_button` questions participate in the same `loading` → `ready` → `editing` →
`submitting` → `submitted`/`submission-error` lifecycle as every other question type.
