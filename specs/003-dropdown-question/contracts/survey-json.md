# Contract: Survey JSON — `dropdown` Question Type

This amends [001-survey-management/contracts/survey-json.md](../../001-survey-management/contracts/survey-json.md)
by adding one new question `type`. All other rules in that contract remain unchanged.

## Shape

```json
{
  "questionId": "country_of_residence",
  "type": "dropdown",
  "label": "Country of residence",
  "required": true,
  "options": [
    { "label": "United Arab Emirates", "value": "ae" },
    { "label": "Saudi Arabia", "value": "sa" },
    { "label": "Qatar", "value": "qa" }
  ],
  "attachmentsRequired": 0
}
```

## Rules

- `type` MUST be `"dropdown"` (added to the existing set of recognized types:
  `radio`, `checkbox`, `textbox`, `textarea`, `rating`, `satisfaction`, `toggle_button`).
- `questionId` and `label` follow the existing base question rules (unique, non-empty).
- `options` is required and MUST be a non-empty array of `{ label, value }` pairs:
  - Each `label` MUST be a non-empty string; each `value` MUST be a non-empty string.
  - `value` entries MUST be unique within the question.
  - Any attributes beyond `label`/`value` on an option entry are ignored by the dropdown.
- There are no `defaultValue` or `placeholder` fields; every dropdown starts unselected
  with a blank control. Unknown additive fields are ignored per the base contract's
  forward-compatibility rule.
- `required` follows the existing base rule (boolean, defaults to `false`).
- `attachmentsRequired` follows the existing base rule (integer 0–3, defaults to 0).
