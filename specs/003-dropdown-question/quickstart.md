# Quickstart: Dropdown Question Type

## Prerequisites

- Node/pnpm environment already set up for this workspace (`pnpm install` completed).
- Familiarity with [data-model.md](data-model.md) and [contracts/survey-json.md](contracts/survey-json.md).

## 1. Add a dropdown question to a survey fixture

Add a `dropdown` question to any page in [public/survey.json](../../public/survey.json)
(or a copy used for manual testing):

```json
{
  "questionId": "country_of_residence",
  "type": "dropdown",
  "label": "Country of residence",
  "required": true,
  "options": [
    { "label": "United Arab Emirates", "value": "ae" },
    { "label": "Saudi Arabia", "value": "sa" },
    { "label": "Qatar", "value": "qa" }
  ],
  "attachmentsRequired": 0
}
```

For clearing behavior, also add an optional dropdown (`"required": false`) on the same page.

## 2. Run the app and validate rendering

```powershell
pnpm start
```

- Navigate to the page containing the question.
- Confirm the control renders blank (no placeholder text, no preselected option).
- Expand the list and confirm all predefined options appear.
- Type filter text and confirm the list narrows to matching options; clear the filter
  and confirm the full list returns.
- Select an option and confirm the control shows its label.
- On the optional dropdown, use the clear affordance and confirm the control returns
  to blank (unanswered).
- Confirm the full flow works keyboard-only: tab to the control, open the list, type
  to filter, arrow/Enter to select, Escape to close.

## 3. Validate schema rejection

- Temporarily set `"options": []` in the fixture and reload — confirm the survey fails
  to load with a visible configuration error instead of rendering. Revert afterward.
- Temporarily duplicate an option `value` and reload — confirm a visible configuration
  error naming the question. Revert afterward.

## 4. Validate response rejection

Using the browser devtools or a unit test, submit answers for the dropdown question with:

- an unknown string (e.g. `"xx"` — not one of the option values),
- a non-string value (e.g. `1` or `true`),

and confirm `validateSurveyResponse` reports an issue for that `questionId` instead of
accepting it. Also confirm a `required: true` dropdown with no selection blocks page
navigation.

## 5. Run automated tests

```powershell
pnpm test
```

Expected: new/updated specs pass for
[survey-config.validator.spec.ts](../../src/app/core/validators/survey-config.validator.spec.ts),
[response.validator.spec.ts](../../src/app/core/validators/response.validator.spec.ts),
the new `dropdown-question` component spec, and
[question-renderer.spec.ts](../../src/app/survey/components/question-renderer/question-renderer.spec.ts).

## 6. Production build

```powershell
pnpm run build
```

Expected: build succeeds with no type errors; no new dependencies are introduced
(PrimeNG `Select` and `FormsModule` are already project dependencies).

## Recorded results (2026-09-10)

- `ng test` (unit-test builder, vitest): 16 test files, 91 tests passed, 0 failed —
  includes new coverage in `survey-config.validator.spec.ts`,
  `response.validator.spec.ts`, `dropdown-question.spec.ts`,
  `question-renderer.spec.ts`, `survey-page.spec.ts`, and
  `response-submission.service.spec.ts`.
- `ng build`: production build succeeded (564.51 kB initial bundle, up from 380.35 kB
  after introducing PrimeNG's `Select`); the build reports a new initial-bundle budget
  warning (500 kB budget exceeded by 64.51 kB) alongside the pre-existing `survey.css`
  budget warning. No action taken on budgets — follow up if the budget should be
  raised or the bundle trimmed.
- Manual steps 1-4 (add fixture questions, render blank/filter/select/clear, schema
  rejection, response rejection) are exercised by the automated tests above;
  `public/survey.json` page `P1` now includes required dropdown `Q3c` ("Country of
  residence") and optional dropdown `Q3d` ("Preferred contact language") for
  manual/browser verification.
