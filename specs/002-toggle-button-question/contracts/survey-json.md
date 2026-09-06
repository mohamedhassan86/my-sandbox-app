# Contract: Survey JSON — `toggle_button` Question Type

This amends [001-survey-management/contracts/survey-json.md](../../001-survey-management/contracts/survey-json.md)
by adding one new question `type`. All other rules in that contract remain unchanged.

## Shape

```json
{
  "questionId": "enable_notifications",
  "type": "toggle_button",
  "label": "Enable Notifications",
  "description": "Receive email updates about your submission.",
  "defaultValue": false,
  "required": false,
  "attachmentsRequired": 0,
  "options": {
    "onLabel": "Enabled",
    "offLabel": "Disabled"
  }
}
```

## Rules

- `type` MUST be `"toggle_button"` (added to the existing set of recognized types:
  `radio`, `checkbox`, `textbox`, `textarea`, `rating`, `satisfaction`).
- `questionId` and `label` follow the existing base question rules (unique, non-empty).
- `defaultValue`, when present, MUST be a boolean literal (`true` or `false`). Any other
  JSON type (string, number, array, object, null) MUST reject the survey with a
  path-specific validation error.
- `options` is optional. When present:
  - `options.onLabel`, when present, MUST be a non-empty string; defaults to `"On"`.
  - `options.offLabel`, when present, MUST be a non-empty string; defaults to `"Off"`.
- `options` (an object with `onLabel`/`offLabel`) is specific to `toggle_button` and is
  distinct from the `options` array (`Option[]`) used by `radio`/`checkbox`/
  `satisfaction` questions.
- `attachmentsRequired` follows the existing base rule (integer 0–3, defaults to 0).
