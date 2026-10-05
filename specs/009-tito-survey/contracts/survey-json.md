# Contract: Survey JSON — `tito` Fixture

This contract defines the complete configuration asset for the new survey. It is consumed by
the existing schema validator (`survey-config.validator.ts`) and the existing survey catalog —
**no runtime code changes are permitted** (Constitution Principle I, spec FR-001). It amends
nothing in the base
[001-survey-management/contracts/survey-json.md](../../001-survey-management/contracts/survey-json.md);
all base rules still apply.

## Manifest entry (amendment to `public/survey-manifest.json`)

```json
{
  "customer-feedback": "survey.json",
  "extended-feedback": "survey-8-step.json",
  "quick-pulse": "survey-quick-pulse.json",
  "event-feedback": "survey-event-feedback.json",
  "tito": "survey-tito.json"
}
```

- The key `tito` MUST be unique within the manifest and MUST NOT replace or alias any existing
  key (spec edge case: duplicate/conflicting key rejected; research R9).
- The key MUST map to the new fixture file `survey-tito.json` in `public/`.
- The four existing entries MUST remain exactly as shown (FR-011).

## Shape (complete fixture — `public/survey-tito.json`)

```json
{
  "surveyId": "SV011",
  "title": "TITO Survey",
  "description": "A quick two-step survey for Abdelrahman covering personal and education info.",
  "version": "1.0",
  "estimatedMinutes": 2,
  "pages": [
    {
      "pageId": "S1",
      "title": "Personal Info",
      "description": "Two quick questions to get to know Abdelrahman.",
      "icon": "id-card",
      "questions": [
        {
          "questionId": "S1Q1",
          "type": "radio",
          "label": "What is your current living situation?",
          "required": true,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Living with family", "value": "with_family" },
            { "label": "University dorm", "value": "university_dorm" },
            { "label": "Rented apartment", "value": "rented_apartment" },
            { "label": "Own home", "value": "own_home" },
            { "label": "Other", "value": "other" }
          ]
        },
        {
          "questionId": "S1Q2",
          "type": "dropdown",
          "label": "What is your age group?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Under 18", "value": "under_18" },
            { "label": "18 to 24", "value": "18_24" },
            { "label": "25 to 34", "value": "25_34" },
            { "label": "35 to 44", "value": "35_44" },
            { "label": "45 or older", "value": "45_plus" }
          ]
        }
      ]
    },
    {
      "pageId": "S2",
      "title": "Education Info",
      "description": "Two quick questions about Abdelrahman's studies.",
      "icon": "laptop-file",
      "questions": [
        {
          "questionId": "S2Q1",
          "type": "radio",
          "label": "What is your highest completed level of education?",
          "required": true,
          "attachmentsRequired": 0,
          "options": [
            { "label": "High school or below", "value": "high_school" },
            { "label": "Diploma", "value": "diploma" },
            { "label": "Bachelor's degree", "value": "bachelor" },
            { "label": "Master's degree", "value": "master" },
            { "label": "Doctorate", "value": "doctorate" },
            { "label": "Other", "value": "other" }
          ]
        },
        {
          "questionId": "S2Q2",
          "type": "rating",
          "label": "How would you rate your overall education experience so far?",
          "required": false,
          "minValue": 1,
          "maxValue": 5,
          "leftLabel": "Poor",
          "rightLabel": "Excellent",
          "attachmentsRequired": 0
        }
      ]
    }
  ]
}
```

## Structural rules (enforced by `tito-survey.contract.spec.ts`)

| Rule   | Requirement                                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| FR-001 | Registered under the `tito` key → `survey-tito.json`, no runtime code change, existing entries untouched                                   |
| FR-002 | Exactly 2 pages                                                                                                                            |
| FR-003 | Exactly 2 questions on each page                                                                                                           |
| FR-004 | Closed question types only (`radio`, `checkbox`, `dropdown`, `rating`, `satisfaction`, `toggle_button`); no `textbox`/`textarea`           |
| FR-005 | The last question of the survey is a `rating` with `minValue: 1`, `maxValue: 5`, and non-empty `leftLabel`/`rightLabel`                    |
| FR-006 | Unique page and question IDs; non-empty options with unique `value`s on every selectable question                                          |
| FR-007 | The required set is exactly the first question of each page (`['S1Q1', 'S2Q1']`); no `minSelections`/`maxSelections`                       |
| FR-008 | Every question has `attachmentsRequired: 0`, no `acceptedFileTypes`, no `maxFileSizeBytes`                                                 |
| FR-009 | Title "TITO Survey", non-empty description and version, `estimatedMinutes` 1–3, each page has a title, description, and a shipped icon key |
| FR-010 | Step 1 is personal info, step 2 is education info (labels as shown above)                                                                  |

## Note on value representation

Option `value`s stay ASCII snake_case (`under_18` is the only one that must avoid a leading
digit for readability); labels may contain spaces, apostrophes, and en-dash-free ranges as
shown. The rating answer value is the numeric string `"1"`–`"5"`.
