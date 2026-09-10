# Contract: Response Submission — `dropdown` Question Type

This amends [001-survey-management/contracts/response-submission.md](../../001-survey-management/contracts/response-submission.md)
by adding one new answer shape. All other rules in that contract remain unchanged.

## Request (amended)

- Dropdown answers are submitted as the selected option's string value:
  `{ "questionId": "country_of_residence", "value": "ae" }`.
- A `dropdown` answer value MUST be a string exactly matching one of the question's
  predefined option values — never an unknown string, a number, a boolean, an array,
  or an object.
- An unanswered optional dropdown is represented as an absent answer or `value: null`;
  a `required: true` dropdown MUST have a selected value present in the request, and
  its absence fails page/submission validation the same way a missing required answer
  does for any other question type.

## Success / Failure response

Unchanged — see the base contract.
