# Data Model: Dropdown Question Type

This amends the data model established in
[001-survey-management/data-model.md](../001-survey-management/data-model.md) (and extended by
[002-toggle-button-question/data-model.md](../002-toggle-button-question/data-model.md)). Only
new or changed entities/fields are shown; all other entities are unchanged.

## Question (amended)

| Field | Type | Rules |
|---|---|---|
| type | radio \| checkbox \| textbox \| textarea \| rating \| satisfaction \| toggle_button \| **dropdown** | Required; unknown values reject the survey |

## DropdownQuestion (new, extends QuestionBase)

| Field | Type | Rules |
|---|---|---|
| type | `'dropdown'` | Required discriminator |
| questionId | string | Required and unique within the survey (existing `QuestionBase` rule) |
| label | string | Required and non-empty (existing `QuestionBase` rule) |
| required | boolean | Defaults to `false` (existing `QuestionBase` rule) |
| options | `Option[]` | Required, at least one entry; each entry needs a non-empty `label` and a non-empty `value`; `value`s MUST be unique within the question |
| attachmentsRequired | 0 \| 1 \| 2 \| 3 | Existing `QuestionBase` rule (defaults to 0) |

No `defaultValue` or `placeholder` fields exist on this type (clarified 2026-09-10).

## Answer (unchanged)

| Field | Type | Rules |
|---|---|---|
| questionId | string | References the answered question |
| value | string \| string[] \| boolean \| null | **String** for dropdown (the selected option's `value`); `null`/absent when unanswered |

## Validation Rules Summary

- Schema validation (`survey-config.validator.ts`):
  - `dropdown` is added to the recognized question type set and to the selectable-options
    branch alongside `radio`/`checkbox`/`satisfaction` (same non-empty options, non-empty
    label/value, unique-value rules; same path-specific issues).
- Response validation (`response.validator.ts`):
  - A `dropdown` answer MUST be a string exactly matching one of its question's option
    values, or absent/empty when the question is not required.
  - Unknown strings and non-string values (numbers, booleans, arrays, objects) are rejected
    with a question-specific validation message.
  - `required: true` with no selected value fails page/submission validation via the
    existing required-empty check (no new empty concept; `null`/blank already count as empty).

## State Transitions

Unchanged from [001-survey-management/data-model.md](../001-survey-management/data-model.md)
— `dropdown` questions participate in the same `loading` → `ready` → `editing` →
`submitting` → `submitted`/`submission-error` lifecycle as every other question type.
