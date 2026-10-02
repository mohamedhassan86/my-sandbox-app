# Contract: Survey JSON — `event-feedback` Fixture

This contract defines the complete configuration asset for the new survey. It is
consumed by the existing schema validator (`survey-config.validator.ts`) and the
existing survey catalog — **no runtime code changes are permitted** (Constitution
Principle I, spec FR-001). It amends nothing in the base
[001-survey-management/contracts/survey-json.md](../../001-survey-management/contracts/survey-json.md);
all base rules still apply.

## Manifest entry (amendment to `public/survey-manifest.json`)

```json
{
  "customer-feedback": "survey.json",
  "extended-feedback": "survey-8-step.json",
  "quick-pulse": "survey-quick-pulse.json",
  "event-feedback": "survey-event-feedback.json"
}
```

- The key `event-feedback` MUST be unique within the manifest and MUST NOT replace or
  alias `customer-feedback`, `extended-feedback`, or `quick-pulse` (spec edge case:
  duplicate/conflicting key rejected; see research R9).
- The key MUST map to the new fixture file `survey-event-feedback.json` in `public/`.
- The three existing entries MUST remain exactly as shown.

## Shape (complete fixture — `public/survey-event-feedback.json`)

```json
{
  "surveyId": "SV010",
  "title": "Event Feedback Survey",
  "description": "A quick two-step survey about how you took part in the event and how it went.",
  "version": "1.0",
  "estimatedMinutes": 2,
  "pages": [
    {
      "pageId": "S1",
      "title": "Your Attendance",
      "description": "Tell us how you took part in the event.",
      "icon": "id-card",
      "questions": [
        {
          "questionId": "S1Q1",
          "type": "radio",
          "label": "How did you attend the event?",
          "required": true,
          "attachmentsRequired": 0,
          "options": [
            { "label": "In person", "value": "in_person" },
            { "label": "Online, live", "value": "online_live" },
            { "label": "Online, on demand", "value": "online_on_demand" },
            { "label": "A mix of in person and online", "value": "mixed" }
          ]
        },
        {
          "questionId": "S1Q2",
          "type": "checkbox",
          "label": "Which parts of the event did you take part in?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Keynote", "value": "keynote" },
            { "label": "Workshops", "value": "workshops" },
            { "label": "Panel discussions", "value": "panels" },
            { "label": "Networking", "value": "networking" },
            { "label": "Exhibition", "value": "exhibition" }
          ]
        },
        {
          "questionId": "S1Q3",
          "type": "dropdown",
          "label": "How did you hear about the event?",
          "required": false,
          "attachmentsRequired": 0,
          "options": [
            { "label": "Email invitation", "value": "email" },
            { "label": "Social media", "value": "social_media" },
            { "label": "Colleague or friend", "value": "word_of_mouth" },
            { "label": "Event website", "value": "website" },
            { "label": "Other", "value": "other" }
          ]
        }
      ]
    },
    {
      "pageId": "S2",
      "title": "Your Experience",
      "description": "Rate the event and choose how we follow up.",
      "icon": "star",
      "questions": [
        {
          "questionId": "S2Q1",
          "type": "rating",
          "label": "How would you rate the event overall?",
          "required": true,
          "minValue": 1,
          "maxValue": 5,
          "leftLabel": "Poor",
          "rightLabel": "Excellent",
          "attachmentsRequired": 0
        },
        {
          "questionId": "S2Q2",
          "type": "satisfaction",
          "label": "How satisfied were you with the quality of the content?",
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
          "type": "toggle_button",
          "label": "Keep me informed about future events.",
          "description": "We'll only send you invitations to similar events.",
          "required": false,
          "defaultValue": false,
          "attachmentsRequired": 0,
          "options": { "onLabel": "Yes, keep me informed", "offLabel": "No, thank you" }
        }
      ]
    }
  ]
}
```

## Rules

- **Structure**: exactly 2 pages; exactly 3 questions per page (6 total) — FR-002.
  Page order is `S1` → `S2`.
- **Closed types only**: every question's `type` MUST be one of `radio`, `checkbox`,
  `dropdown`, `rating`, `satisfaction`, `toggle_button`; `textbox`/`textarea` MUST NOT
  appear — FR-003.
- **Type distribution**: at least one `radio`, one `checkbox`, one `dropdown`
  (exactly one of each in this fixture, plus one each of `rating`, `satisfaction`,
  `toggle_button`) — FR-004.
- **Required distribution**: exactly two required questions — the first question of
  each step: `S1Q1` (radio) and `S2Q1` (rating); all other questions
  `required: false` — FR-006 (clarified 2026-10-02).
- **Options**: every selectable question (`radio`, `checkbox`, `dropdown`,
  `satisfaction`) has a non-empty `options` array; each option has a non-empty `label`
  and `value`; `value`s are unique within the question — FR-005 (existing validator
  rule).
- **Selection bounds**: no question sets `minSelections` or `maxSelections` — FR-006.
- **Rating**: `S2Q1` uses `minValue: 1` < `maxValue: 5` (integer, divisible by the
  default step 1), giving the five-tile scale whose readout carries descriptors
  ("4 / 5 — Good").
- **Satisfaction**: `S2Q2` option `value`s MUST keep the standard
  `very-dissatisfied` … `very-satisfied` names so the renderer derives distinct emoji
  without per-option `icon` fields.
- **Toggle**: `S2Q3` uses boolean `defaultValue: false` and label object
  `options.onLabel`/`offLabel` (existing toggle rules); the default MUST stay `false`
  so an untouched toggle never records interest or consent (spec edge case).
- **No attachments**: every question has `attachmentsRequired: 0`; no
  `acceptedFileTypes` or `maxFileSizeBytes` fields — FR-007.
- **Chrome fields**: `surveyId` `SV010`, `title`, non-empty `description`, `version`,
  `estimatedMinutes: 2` (integer 1–120, ≤3 per SC-003); each page has a title, a
  ≤280-char description, and a valid documented icon key (`id-card`, `star`) — FR-008.
- **Uniqueness**: `pageId`s unique; `questionId`s unique within the survey — FR-005.
- **Forward compatibility**: unknown additive fields are ignored per the base
  contract; this fixture defines none.

## Machine-checked rules

The rules above that the schema validator does not enforce are asserted by
`src/app/survey/survey-fixtures.contract.spec.ts` (research R10): page and question
counts, the closed-type allow-list, the radio/checkbox/dropdown minimum mix, the
required distribution (first question of each page), absence of selection bounds and
attachment fields, chrome-field presence, known icon keys, and `estimatedMinutes` ≤3.
