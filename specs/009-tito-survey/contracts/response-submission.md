# Contract: Response Submission — `tito` Survey

This contract fixes the response shapes for the TITO survey. It amends nothing in the base
[001-survey-management/contracts/response-submission.md](../../001-survey-management/contracts/response-submission.md)
or the 008 event-feedback contract; all base rules still apply and the existing
`validateSurveyResponse`, `SurveySessionService`, and `ResponseSubmissionService` are used
unchanged.

## Validation rules applied (existing, unchanged)

- `S1Q1` (radio, required): rejected when empty; the value must be one of the question's
  option values.
- `S1Q2` (dropdown, optional): when present, the value must be one of the question's option
  values; a cleared value (`null`) counts as unanswered and does not block navigation.
- `S2Q1` (radio, required): rejected when empty; the value must be one of the question's
  option values.
- `S2Q2` (rating, optional): accepted as the numeric string `"1"`–`"5"`; an untouched rating
  is not an answer and does not block submission.
- No attachments exist, so the submission carries an empty `attachments` array.

## Representative payloads

**Minimum valid submission** (required answers only — SC-004):

```json
{
  "surveyId": "SV011",
  "surveyVersion": "1.0",
  "answers": [
    { "questionId": "S1Q1", "value": "with_family" },
    { "questionId": "S2Q1", "value": "bachelor" }
  ],
  "attachments": []
}
```

**Fully answered submission** (all four questions):

```json
{
  "surveyId": "SV011",
  "surveyVersion": "1.0",
  "answers": [
    { "questionId": "S1Q1", "value": "with_family" },
    { "questionId": "S1Q2", "value": "25_34" },
    { "questionId": "S2Q1", "value": "bachelor" },
    { "questionId": "S2Q2", "value": "4" }
  ],
  "attachments": []
}
```

**Completion summary tiles**:

- Minimum submission: `Personal Info 1/2 answered`, `Education Info 1/2 answered`,
  `Files 0 files attached`.
- Fully answered: `Personal Info 2/2 answered`, `Education Info 2/2 answered`,
  `Files 0 files attached`.

## Rejection cases

| Input                                                       | Expected behavior                                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| No answers                                                  | `validateSurveyResponse` reports exactly `S1Q1` and `S2Q1` as missing; `next()` on step 1 is blocked |
| `S1Q2` with a value not in its option list (e.g. `"99_99"`) | Reported as an issue for `S1Q2`                                                                      |
| Step 1 answered, step 2 required unanswered                 | `buildResponse()` returns `null` and reports `S2Q1`; step 1 answers are preserved                    |
| Optional answers cleared (`null` / absent)                  | Navigation and submission succeed; they are not counted as answered                                  |

## Success / Failure response

Unchanged from the base contract: the local submission adapter returns
`{ status: 'submitted', submissionId }`; failures return `{ status: 'failed', message }`.
No attachment handling is exercised by this survey.
