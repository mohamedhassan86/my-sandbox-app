# Quickstart: Dynamic Survey Management and Response Collection

## Prerequisites

- Node.js 22.23.2 or a later supported Node.js 22 release
- pnpm 11
- A working copy of the project with dependencies installed

## Install and run

```powershell
pnpm install
pnpm start
```

Open the local URL printed by the development server. Use a valid survey fixture based
on [survey-json.md](contracts/survey-json.md).

## Validation scenarios

### Valid survey rendering

1. Load a survey with one page and radio, checkbox, textbox, and textarea questions.
2. Verify title, description, page title, labels, options, and required indicators.
3. Verify questions appear in the same order as the configuration.

Expected result: the first page is usable and no configuration error is shown.

### Four-page survey navigation

1. Load the default `public/survey.json` fixture (four pages).
2. Verify the progress bar shows 25% on page 1, 50% on page 2, etc.
3. Click a completed page step to navigate directly back to it.
4. Verify answers are preserved when returning to earlier pages.
5. Verify forward navigation is blocked when the current page has incomplete required fields.

Expected result: all four pages are accessible in order, direct page selection works for
completed pages, and invalid forward navigation is blocked.

### Navigation and answer preservation

1. Load a survey with at least two pages.
2. Enter valid answers on the first page and select Next.
3. Enter an answer on the second page and select Previous.
4. Return to the second page.

Expected result: answers remain available and Next is blocked when the current page has
an incomplete required field.

### Validation boundaries

1. Test missing required radio and text answers.
2. Test checkbox counts below the minimum and above the maximum.
3. Test text values below the minimum and above the maximum length.
4. Test missing, excessive, wrong-type, and oversized attachments.

Expected result: every invalid state has visible feedback and cannot advance or submit.

### Submission

1. Complete every page with valid answers and required attachments.
2. Select Submit.
3. Verify the response includes the survey ID, configuration version, answers, and
   question-associated attachments.
4. Simulate a submission failure.

Expected result: success appears only after acceptance; failures preserve entered data and
show an actionable message.

For local UI review, the default submission adapter simulates an accepted response. This
allows the completion summary to be reached without a backend. The real endpoint remains
available when simulation is disabled in the submission service.

### Completion summary

1. Complete all required pages and submit a valid response.
2. Verify the editable survey is replaced by a completion summary.
3. Verify the summary shows `100% complete` and a clear success message.
4. Simulate a failed submission and verify the survey remains editable with answers intact.

Expected result: successful submission ends in an accessible high-level completion state;
failed submission preserves the respondent's work.

### Reference-driven UX

1. Open `public/theme-preview.png` as the visual reference.
2. Open the default four-page survey at desktop and mobile widths.
3. Verify the centered white panel, soft pink page background, generous spacing, rounded
   controls, dark typography, and vivid blue selected states.
4. On the experience page, verify the five satisfaction choices and their labels.
5. On the same page, verify the 1-10 rating tiles, endpoint labels, keyboard focus, and
   selected state.
6. Navigate away and back, confirming both answers remain selected.

Expected result: the survey follows the reference composition without reducing keyboard
access, visible validation, responsive layout, or answer preservation.

## Automated checks

```powershell
pnpm exec vitest run
pnpm exec ng build
```

Expected result: unit and integration tests pass, and the production build completes
without errors.

### Latest results (2026-09-05)

- **Tests**: 46 passed, 0 failed (12 test files)
- **Build**: Production bundle generated successfully (248.69 kB initial, 65.61 kB estimated transfer)
- **Sample survey**: Four-page demo with progress bar, clickable page steps, and question numbering
- **Completion summary**: Implemented with submitted-state percentage and success message
- **Browser smoke checks**: Pending desktop and mobile visual comparison against `public/theme-preview.png`
- **Build warning**: `src/app/survey/survey.css` is 24 bytes over the 4 kB warning budget

## Related artifacts

- Domain entities and state transitions: [data-model.md](data-model.md)
- Configuration contract: [contracts/survey-json.md](contracts/survey-json.md)
- Submission contract: [contracts/response-submission.md](contracts/response-submission.md)
