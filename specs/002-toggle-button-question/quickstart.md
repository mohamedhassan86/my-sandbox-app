# Quickstart: Toggle Button Question Type

## Prerequisites

- Node/pnpm environment already set up for this workspace (`pnpm install` completed).
- Familiarity with [data-model.md](data-model.md) and [contracts/survey-json.md](contracts/survey-json.md).

## 1. Add a toggle question to a survey fixture

Add a `toggle_button` question to any page in [public/survey.json](../../public/survey.json)
(or a copy used for manual testing):

```json
{
  "questionId": "enable_notifications",
  "type": "toggle_button",
  "label": "Enable Notifications",
  "defaultValue": false,
  "required": false,
  "attachmentsRequired": 0,
  "options": { "onLabel": "Enabled", "offLabel": "Disabled" }
}
```

## 2. Run the app and validate rendering

```powershell
pnpm start
```

- Navigate to the page containing the question.
- Confirm the control renders as a toggle/switch showing "Disabled" by default.
- Toggle it and confirm the label switches to "Enabled" and back.

## 3. Validate schema rejection

Temporarily set `"defaultValue": "yes"` (a string) in the fixture and reload — confirm
the survey fails to load with a visible configuration error instead of rendering.
Revert the change afterward.

## 4. Validate response rejection

Using the browser devtools or a unit test, submit an answer of `"true"` (string) or
`1` (number) for the toggle question and confirm `validateSurveyResponse` reports an
issue for that `questionId` instead of accepting it.

## 5. Run automated tests

```powershell
pnpm test
```

Expected: new/updated specs pass for
[survey-config.validator.spec.ts](../../src/app/core/validators/survey-config.validator.spec.ts),
[response.validator.spec.ts](../../src/app/core/validators/response.validator.spec.ts),
the new `toggle-button-question` component spec, and
[question-renderer.spec.ts](../../src/app/survey/components/question-renderer/question-renderer.spec.ts).

## 6. Production build

```powershell
pnpm run build
```

Expected: build succeeds with no type errors from the widened `Answer.value` type.

## Recorded results (2026-09-06)

- `pnpm run test` (vitest, `ng test`): 15 test files, 71 tests passed, 0 failed — includes
  new coverage in `survey-config.validator.spec.ts`, `response.validator.spec.ts`,
  `toggle-button-question.spec.ts`, `question-renderer.spec.ts`,
  `survey-page.spec.ts`, and `response-submission.service.spec.ts`.
- `pnpm run build` (`ng build`): production build succeeded (258.86 kB initial bundle);
  only a pre-existing `survey.css` budget warning unrelated to this feature.
- Manual steps 1-4 (add fixture question, render, schema rejection, response rejection)
  are exercised by the automated tests above; `public/survey.json` page `P1` now
  includes the `enable_notifications` toggle question for manual/browser verification.

## Recorded results (2026-09-06, PrimeNG ToggleButton migration)

- `pnpm run test`: all test files pass (30 tests re-verified across the affected
  component, renderer, survey-page, survey-view, and routes specs; no regressions).
- `pnpm run build`: production build succeeded; initial bundle grew from 258.86 kB to
  380.35 kB after introducing PrimeNG's `ToggleButton` and Angular `FormsModule` (first
  real usage of a PrimeNG component in this project); only the pre-existing
  `survey.css` budget warning remains.


