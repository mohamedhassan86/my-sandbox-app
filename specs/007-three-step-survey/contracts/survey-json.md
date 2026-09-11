# Contract: Survey JSON — `quick-pulse` Fixture

This contract defines the complete configuration asset for the new survey. It is
consumed by the existing schema validator (`survey-config.validator.ts`) and the
existing survey catalog — **no code changes are permitted** (Constitution Principle I,
spec FR-001). It amends nothing in the base
[001-survey-management/contracts/survey-json.md](../../001-survey-management/contracts/survey-json.md);
all base rules still apply.

## Manifest entry (amendment to `public/survey-manifest.json`)

```json
{
  "customer-feedback": "survey.json",
  "extended-feedback": "survey-8-step.json",
  "quick-pulse": "survey-quick-pulse.json"
}
```

- The key `quick-pulse` MUST be unique within the manifest and MUST NOT replace or
  alias `customer-feedback` or `extended-feedback` (spec edge case: duplicate/
  conflicting key rejected; see research R7).
- The key MUST map to the new fixture file `survey-quick-pulse.json` in `public/`.

## Shape (complete fixture — `public/survey-quick-pulse.json`)

```json
{
  "surveyId": "SV009",
  "title": "Product Pulse Survey",
  "description": "A quick three-step pulse on how you use our product and how it is going.",
  "version": "1.0",
  "estimatedMinutes": 3,
  "pages": [
    {
      "pageId": "S1",
      "title": "How You Use",
      "description": "Tell us how you use the product.",
      "icon": "laptop-file",
      "questions": [
        {
          "questionId": "S1Q1",
          "type": "radio",
          "label": "How often do you use the product?",
          "required": true,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Every day", "value": "daily" },
            { "label": "Several times a week", "value": "several_weeks" },
            { "label": "Once a week", "value": "weekly" },
            { "label": "Once a month", "value": "monthly" },
            { "label": "Rarely", "value": "rarely" }
          ]
        },
        {
          "questionId": "S1Q2",
          "type": "checkbox",
          "label": "Which areas do you use most?",
          "required": true,
          "minSelections": 1,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Content", "value": "content" },
            { "label": "Reports", "value": "reports" },
            { "label": "Collaboration", "value": "collaboration" },
            { "label": "Integrations", "value": "integrations" },
            { "label": "Mobile", "value": "mobile" }
          ]
        },
        {
          "questionId": "S1Q3",
          "type": "dropdown",
          "label": "What device do you mainly use?",
          "required": true,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Desktop", "value": "desktop" },
            { "label": "Laptop", "value": "laptop" },
            { "label": "Tablet", "value": "tablet" },
            { "label": "Phone", "value": "phone" }
          ]
        }
      ]
    },
    {
      "pageId": "S2",
      "title": "Your Experience",
      "description": "How has your experience been?",
      "icon": "star",
      "questions": [
        {
          "questionId": "S2Q1",
          "type": "rating",
          "label": "Rate your overall experience.",
          "required": false,
          "minValue": 1,
          "maxValue": 10,
          "leftLabel": "Poor",
          "rightLabel": "Excellent",
          "attachmentsRequired": 0
        },
        {
          "questionId": "S2Q2",
          "type": "satisfaction",
          "label": "How satisfied are you overall?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Very dissatisfied", "value": "very-dissatisfied" },
            { "label": "Dissatisfied", "value": "dissatisfied" },
            { "label": "Neutral", "value": "neutral" },
            { "label": "Satisfied", "value": "satisfied" },
            { "label": "Very satisfied", "value": "very-satisfied" }
          ]
        },
        {
          "questionId": "S2Q3",
          "type": "checkbox",
          "label": "Which improvements would help you most?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Faster load times", "value": "faster_loads" },
            { "label": "Better search", "value": "better_search" },
            { "label": "More report formats", "value": "more_reports" },
            { "label": "Offline mode", "value": "offline_mode" },
            { "label": "Dark theme", "value": "dark_theme" }
          ]
        }
      ]
    },
    {
      "pageId": "S3",
      "title": "Next Steps",
      "description": "Help us keep things going.",
      "icon": "shield-check",
      "questions": [
        {
          "questionId": "S3Q1",
          "type": "radio",
          "label": "How likely are you to recommend us?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Definitely", "value": "definitely" },
            { "label": "Probably", "value": "probably" },
            { "label": "Maybe", "value": "maybe" },
            { "label": "Probably not", "value": "probably_not" },
            { "label": "Definitely not", "value": "definitely_not" }
          ]
        },
        {
          "questionId": "S3Q2",
          "type": "toggle_button",
          "label": "Keep me posted about product updates.",
          "description": "We'll only send updates you ask about.",
          "required": false,
          "defaultValue": false,
          "attachmentsRequired": 0,
          "options": { "onLabel": "Yes, keep me posted", "offLabel": "No, thank you" }
        },
        {
          "questionId": "S3Q3",
          "type": "dropdown",
          "label": "Best way to follow up with you?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Email", "value": "email" },
            { "label": "In-app message", "value": "in_app" },
            { "label": "No contact", "value": "no_contact" }
          ]
        }
      ]
    }
  ]
}
```

## Rules

- **Structure**: exactly 3 pages; exactly 3 questions per page (9 total) — FR-002.
  Page order is `S1` → `S2` → `S3`.
- **Closed types only**: every question's `type` MUST be one of `radio`, `checkbox`,
  `dropdown`, `rating`, `satisfaction`, `toggle_button`; `textbox`/`textarea` MUST NOT
  appear — FR-003.
- **Type distribution**: at least one `radio`, one `checkbox`, one `dropdown`
  (actually 2/2/2 in this fixture) — FR-004.
- **Required distribution**: exactly three required questions — `S1Q1` (radio),
  `S1Q2` (checkbox), `S1Q3` (dropdown); all other questions `required: false` —
  FR-006 (clarification Q4).
- **Options**: every selectable question has a non-empty `options` array; each option
  has a non-empty `label` and `value`; `value`s are unique within the question —
  FR-005 (existing validator rule).
- **Selection bounds**: `S1Q2` sets `minSelections: 1`; no question sets
  `maxSelections`; `minSelections` ≤ option count.
- **Rating**: `S2Q1` uses `minValue: 1` < `maxValue: 10` (integer, divisible by the
  default step 1).
- **Toggle**: `S3Q2` uses boolean `defaultValue: false` and label object
  `options.onLabel`/`offLabel` (existing toggle rules).
- **No attachments**: every question has `attachmentsRequired: 0`; no
  `acceptedFileTypes` or `maxFileSizeBytes` fields — FR-007.
- **Chrome fields**: `surveyId` `SV009`, `title`, non-empty `description` (≤280 chars
  per page), `version`, `estimatedMinutes: 3` (integer 1–120); each page has a title,
  a ≤280-char description, and a valid documented icon key — FR-008.
- **Uniqueness**: `pageId`s unique; `questionId`s unique within the survey — FR-005.
- **Forward compatibility**: unknown additive fields are ignored per the base
  contract; this fixture defines none.
