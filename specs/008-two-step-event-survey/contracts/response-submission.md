# Contract: Response Submission — `event-feedback` Survey

This contract fixes the answer shapes for the six questions of the `SV010`
`event-feedback` survey. It amends nothing in the base
[001-survey-management/contracts/response-submission.md](../../001-survey-management/contracts/response-submission.md):
the same submission mechanism, request envelope, and success/failure responses apply.
Value domains follow the existing `Answer.value` type (`string | string[] | boolean |
null`) and the existing response validator.

## Request (amended for this survey)

`SurveyResponse` carries `surveyId: "SV010"`, `surveyVersion: "1.0"`, the answers
below, and an **empty** `attachments` array (every question has
`attachmentsRequired: 0`).

| questionId | type | Answer `value` when answered | Unanswered representation |
|---|---|---|---|
| `S1Q1` | radio | String: one of `in_person`, `online_live`, `online_on_demand`, `mixed` | N/A — required; absence fails validation |
| `S1Q2` | checkbox | String array drawn from `keynote`, `workshops`, `panels`, `networking`, `exhibition` (empty/absent if skipped) | Absent answer or `null` |
| `S1Q3` | dropdown | String: one of `email`, `social_media`, `word_of_mouth`, `website`, `other` | Absent answer or `null` |
| `S2Q1` | rating | Numeric string `"1"` through `"5"` | N/A — required; absence fails validation |
| `S2Q2` | satisfaction | String: one of `very-dissatisfied`, `dissatisfied`, `neutral`, `satisfied`, `very-satisfied` | Absent answer or `null` |
| `S2Q3` | toggle_button | `true` or `false` once the respondent interacts with the toggle | Absent answer (never touched); validator falls back to `defaultValue` (`false`) |

## Validation rules applied (existing, unchanged)

- Required: `S1Q1` and `S2Q1` (one per step) MUST have non-empty answers before page
  navigation away from their step and before submission (spec FR-006, FR-009, US3).
- Dropdown values MUST exactly match a predefined option value; unknown strings and
  non-string values are rejected with a question-specific message.
- Checkbox question `S1Q2` has no selection bounds; an empty or absent array is a
  valid optional answer.
- Toggle `S2Q3` MUST be a boolean when an answer is present; an absent answer resolves
  to `false` via the existing `defaultValue` fallback and is neither counted as answered
  in the completion summary nor included in the submitted answers.
- Rating `S2Q1` is accepted as the renderer's numeric string; no additional
  server-side rule exists beyond the shared answer value type.
- An optional question left unanswered is represented as an **absent** answer or
  `value: null` (spec FR-009; the completion summary counts it as unanswered).

## Representative payloads

Required answers only (minimum valid submission; completion tiles read
**1/3 answered** on both steps):

```json
{
  "surveyId": "SV010",
  "surveyVersion": "1.0",
  "answers": [
    { "questionId": "S1Q1", "value": "in_person" },
    { "questionId": "S2Q1", "value": "4" }
  ],
  "attachments": []
}
```

Fully answered (completion tiles read **3/3 answered** on both steps):

```json
{
  "surveyId": "SV010",
  "surveyVersion": "1.0",
  "answers": [
    { "questionId": "S1Q1", "value": "online_live" },
    { "questionId": "S1Q2", "value": ["keynote", "workshops"] },
    { "questionId": "S1Q3", "value": "word_of_mouth" },
    { "questionId": "S2Q1", "value": "5" },
    { "questionId": "S2Q2", "value": "very-satisfied" },
    { "questionId": "S2Q3", "value": true }
  ],
  "attachments": []
}
```

## Success / Failure response

Unchanged — see the base contract (local simulation adapter by default; production
transport via the response service boundary).
