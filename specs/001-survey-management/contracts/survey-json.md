# Contract: Survey JSON

## Purpose

Defines the configuration consumed by the survey viewer.

## Shape

```json
{
  "surveyId": "SV001",
  "title": "Customer Feedback Survey",
  "description": "Please complete the survey.",
  "version": "1.0",
  "pages": [
    {
      "pageId": "P1",
      "title": "General Information",
      "questions": [
        {
          "questionId": "Q1",
          "type": "radio",
          "label": "Are you satisfied?",
          "required": true,
          "options": [
            { "label": "Yes", "value": "yes" },
            { "label": "No", "value": "no" }
          ],
          "attachmentsRequired": 0
        }
      ]
    }
  ]
}
```

## Rules

- `pages` MUST contain at least one page, and each page MUST contain at least one
  question.
- Question IDs and page IDs MUST be unique within the survey.
- `type` MUST be one of `radio`, `checkbox`, `textbox`, or `textarea`.
- Radio and checkbox questions MUST provide options with unique values.
- Attachment counts MUST be integers from 0 through 3.
- Numeric bounds MUST be non-negative and internally consistent.
- The viewer MUST reject unknown fields only when they make the configuration ambiguous;
  additive metadata may be ignored for forward compatibility.
