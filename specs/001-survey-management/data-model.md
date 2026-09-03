# Data Model: Dynamic Survey Management and Response Collection

## Survey

| Field | Type | Rules |
|---|---|---|
| surveyId | string | Required and unique within the configuration source |
| title | string | Required and non-empty |
| description | string | Optional |
| version | string | Required for configuration traceability |
| pages | SurveyPage[] | Required; at least one page; order is significant |

## SurveyPage

| Field | Type | Rules |
|---|---|---|
| pageId | string | Required and unique within the survey |
| title | string | Required and non-empty |
| questions | Question[] | Required; at least one question; order is significant |

## Question

| Field | Type | Rules |
|---|---|---|
| questionId | string | Required and unique within the survey |
| type | radio \| checkbox \| textbox \| textarea | Required; unknown values reject the survey |
| label | string | Required and non-empty |
| required | boolean | Defaults to false when omitted |
| options | Option[] | Required for radio and checkbox; forbidden or ignored for text types |
| minLength | number | Optional; non-negative and no greater than maxLength |
| maxLength | number | Optional; non-negative and no less than minLength |
| minSelections | number | Optional for checkbox; non-negative and no greater than maxSelections |
| maxSelections | number | Optional for checkbox; no greater than available options |
| attachmentsRequired | 0 \| 1 \| 2 \| 3 | Defaults to 0 |
| acceptedFileTypes | string[] | Optional allowlist of file types |
| maxFileSizeBytes | number | Optional positive limit per file |

## Option

| Field | Type | Rules |
|---|---|---|
| label | string | Required and displayed to the respondent |
| value | string | Required and submitted as the answer value |

## Attachment

| Field | Type | Rules |
|---|---|---|
| questionId | string | References the owning question |
| fileName | string | Required |
| mediaType | string | Must satisfy the question allowlist when configured |
| sizeBytes | number | Must not exceed the question limit when configured |
| file | browser file value | Required for an attached item; never serialized as plain metadata only |

## Response

| Field | Type | Rules |
|---|---|---|
| surveyId | string | References the submitted survey |
| surveyVersion | string | Captures the configuration version used |
| answers | Answer[] | One answer per configured question as applicable |
| attachments | Attachment[] | Associated with their question IDs |
| submittedAt | timestamp | Set only after successful submission |

## Answer

| Field | Type | Rules |
|---|---|---|
| questionId | string | References the answered question |
| value | string \| string[] \| null | String for radio/text; array for checkbox; null when unanswered |

## State Transitions

1. `loading` -> `ready` when the configuration is valid.
2. `loading` -> `configuration-error` when retrieval or validation fails.
3. `ready` -> `editing` when the respondent interacts with a question.
4. `editing` -> `editing` when valid page navigation preserves answers.
5. `editing` -> `validation-error` when page or submission rules fail.
6. `editing` -> `submitting` when all pages pass final validation.
7. `submitting` -> `submitted` when response and attachments are accepted.
8. `submitting` -> `submission-error` when processing fails; entered answers remain intact.
