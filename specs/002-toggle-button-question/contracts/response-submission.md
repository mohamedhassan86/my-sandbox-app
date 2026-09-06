# Contract: Response Submission — `toggle_button` Question Type

This amends [001-survey-management/contracts/response-submission.md](../../001-survey-management/contracts/response-submission.md)
by adding one new answer shape. All other rules in that contract remain unchanged.

## Request (amended)

- Toggle button answers are submitted as a native boolean:
  `{ "questionId": "enable_notifications", "value": true }`.
- A `toggle_button` answer MUST be `true`, `false`, or absent — never `null` as a
  literal submitted value, a string (`"true"`), a number (`1`/`0`), or an array.
- A `required: true` toggle question MUST have a boolean value present in the request
  (default or explicit); its absence fails page/submission validation the same way a
  missing required answer does for any other question type.

## Success / Failure response

Unchanged — see the base contract.
