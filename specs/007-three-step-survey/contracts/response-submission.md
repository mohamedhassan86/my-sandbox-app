# Contract: Response Submission — `quick-pulse` Survey

This contract fixes the answer shapes for the nine questions of the `SV009`
`quick-pulse` survey. It amends nothing in the base
[001-survey-management/contracts/response-submission.md](../../001-survey-management/contracts/response-submission.md):
the same submission mechanism, request envelope, and success/failure responses apply.
Value domains follow the existing `Answer.value` type (`string | string[] | boolean |
null`) and the existing response validator.

## Request (amended for this survey)

`SurveyResponse` carries `surveyId: "SV009"`, `surveyVersion: "1.0"`, the answers
below, and an **empty** `attachments` array (every question has
`attachmentsRequired: 0`).

| questionId | type | Answer `value` when answered | Unanswered representation |
|---|---|---|---|
| `S1Q1` | radio | String: one of `daily`, `several_weeks`, `weekly`, `monthly`, `rarely` | N/A — required; absence fails validation |
| `S1Q2` | checkbox | Non-empty string array drawn from `content`, `reports`, `collaboration`, `integrations`, `mobile` (`minSelections: 1`) | N/A — required; empty/absent fails validation |
| `S1Q3` | dropdown | String: one of `desktop`, `laptop`, `tablet`, `phone` | N/A — required; absence fails validation |
| `S2Q1` | rating | Numeric string `"1"` through `"10"` | Absent answer or `null` |
| `S2Q2` | satisfaction | String: one of `very-dissatisfied`, `dissatisfied`, `neutral`, `satisfied`, `very-satisfied` | Absent answer or `null` |
| `S2Q3` | checkbox | String array drawn from `faster_loads`, `better_search`, `more_reports`, `offline_mode`, `dark_theme` | Absent answer or `null` |
| `S3Q1` | radio | String: one of `definitely`, `probably`, `maybe`, `probably_not`, `definitely_not` | Absent answer or `null` |
| `S3Q2` | toggle_button | `true` or `false` | Validator falls back to `defaultValue` (`false`) |
| `S3Q3` | dropdown | String: one of `email`, `in_app`, `no_contact` | Absent answer or `null` |

## Validation rules applied (existing, unchanged)

- Required: `S1Q1`, `S1Q2`, `S1Q3` MUST have non-empty answers before page
  navigation away from step 1 and before submission (spec FR-009, US3).
- Dropdown values MUST exactly match a predefined option value; unknown strings and
  non-string values are rejected with a question-specific message.
- Checkbox `S1Q2` MUST contain at least `minSelections: 1` selected values;
  `S2Q3` has no bounds.
- Toggle `S3Q2` MUST be a boolean when an answer is present; absent answers resolve
  to `false` via the existing `defaultValue` fallback.
- Rating `S2Q1` is accepted as the renderer's numeric string; no additional
  server-side rule exists beyond the shared answer value type.
- An optional question left unanswered is represented as an **absent** answer or
  `value: null` (spec FR-009; completion summary counts it as unanswered).

## Success / Failure response

Unchanged — see the base contract (local simulation adapter by default; production
transport via the response service boundary).
