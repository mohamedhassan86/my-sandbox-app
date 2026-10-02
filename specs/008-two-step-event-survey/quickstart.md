# Quickstart: Two-Step Event Feedback Survey

Run-guide for validating the `event-feedback` survey end to end. Structure details live
in [contracts/survey-json.md](contracts/survey-json.md); answer shapes in
[contracts/response-submission.md](contracts/response-submission.md); instance
constraints in [data-model.md](data-model.md).

## Prerequisites

- Node/pnpm environment already set up for this workspace (`pnpm install` completed).
- Working tree with `public/survey-event-feedback.json` added, the `event-feedback`
  entry present in `public/survey-manifest.json`, and
  `src/app/survey/survey-fixtures.contract.spec.ts` added.

## 1. Verify the change footprint (no runtime code changes)

```powershell
git status --short
git diff --stat
```

- **Expect**: the production changes are `public/survey-event-feedback.json` (new) and
  `public/survey-manifest.json` (one added entry); the only `src/` change is the new
  test file `src/app/survey/survey-fixtures.contract.spec.ts`. No other file under
  `src/` changes (spec FR-001, SC-001). `README.md` and `specs/008-two-step-event-survey/`
  are documentation.
- **Expect**: `public/survey.json`, `public/survey-8-step.json`, and
  `public/survey-quick-pulse.json` are untouched (`git diff --stat -- public/survey.json
  public/survey-8-step.json public/survey-quick-pulse.json` prints nothing).
- **Expect**: the manifest contains exactly the four keys `customer-feedback`,
  `extended-feedback`, `quick-pulse`, `event-feedback`, each mapping to a distinct
  fixture file (`survey.json`, `survey-8-step.json`, `survey-quick-pulse.json`,
  `survey-event-feedback.json`) — an `event-feedback` key aliasing an existing fixture
  fails the contract spec (research R9).

## 2. Run the automated gates

```powershell
pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts
pnpm test
pnpm exec vitest run
pnpm exec ng build
pnpm exec prettier --check public/survey-event-feedback.json public/survey-manifest.json src/app/survey/survey-fixtures.contract.spec.ts README.md
pnpm exec tsc -p tsconfig.spec.json --noEmit
```

- **Expect**: the contract spec passes (catalog integrity, structure rules, rule
  self-checks, respondent journey — spec FR-013, SC-006).
- **Expect**: `pnpm test` (`ng test`, the project runner) is green, including
  `src/app/app.spec.ts`.
- **Expect**: raw `pnpm exec vitest run` is green except for the pre-existing
  `src/app/app.spec.ts` suite-load failure (JIT compiler not loaded under the raw
  runner) — unchanged from before this feature (README, 007 notes).
- **Expect**: the production build succeeds (same pre-existing CSS budget warnings as
  before), formatting is clean on the touched files, and the spec type-checks
  (spec SC-005).

## 3. Validate structure and closed types

```powershell
pnpm start
```

- Open `http://localhost:4200/surveys/event-feedback`.
- **Expect**: the survey loads with title "Event Feedback Survey", a 2-minute estimate
  in the dock/topbar, and **exactly two steps** — "Your Attendance" and "Your
  Experience" — with **exactly three questions on each step** (spec FR-002).
- **Expect**: step icons render as the id-card and star glyphs (not the fallback
  clipboard) — FR-008.
- **Expect**: every question is a closed control — radio group (`S1Q1`, marked
  required), checkbox group (`S1Q2`), dropdown (`S1Q3`), 1–5 rating scale (`S2Q1`,
  marked required, "Poor" … "Excellent" end labels), satisfaction tiles (`S2Q2`), and
  an off-by-default toggle (`S2Q3`). No free-text field or file upload appears
  anywhere (spec FR-003, FR-007; US2 scenario 4).
- Spot-check the raw fixture (`http://localhost:4200/survey-event-feedback.json`):
  2 pages × 3 questions, types `radio/checkbox/dropdown/rating/satisfaction/
  toggle_button` only, exactly 2 `"required": true` entries — the first question of
  each step (`S1Q1`, `S2Q1`) — no `minSelections`/`maxSelections` fields, all
  `attachmentsRequired: 0` (contracts/survey-json.md).

## 4. Validate required-answer enforcement (US3)

- Fresh load. On step 1, leave everything unanswered and attempt to continue.
- **Expect**: navigation is blocked; a visible error identifies `S1Q1` (radio) as the
  step's required question.
- Answer only `S1Q1` and continue (the optional checkbox and dropdown stay empty).
- **Expect**: navigation to step 2 succeeds with no validation errors.
- On step 2 with nothing answered, attempt to submit.
- **Expect**: submission is blocked; a visible error identifies `S2Q1` (rating) as
  required, and the step-1 answer is still preserved when navigating back.

## 5. Validate optional answers and clearing

- On step 1, select then deselect every option of the checkbox question (`S1Q2`) and
  attempt to continue.
- **Expect**: navigation succeeds — the checkbox is fully optional with no
  minimum-selection rule (FR-006).
- On step 1, clear `S1Q3` after selecting an option.
- **Expect**: the control returns to its empty state and the question counts as
  unanswered.
- Submit with **only** the two required questions (one per step) answered, leaving the
  toggle untouched.
- **Expect**: submission succeeds; the completion summary shows step tiles of **1/3
  answered, 1/3 answered**; unanswered optional questions are absent/`null` and the
  untouched toggle does not count as answered (FR-009; contracts/response-submission.md).

## 6. Validate full completion (US2)

- Start a new response and answer all six questions (including the toggle, which
  starts on "No, thank you").
- **Expect**: progress ring/step buttons track answered counts live; the rating readout
  reads e.g. "4 / 5 — Good"; after submit, the completion summary shows **3/3
  answered on both step tiles**; a new-response action resets the survey with no
  leftover answers.
- Navigate back and forth once mid-flow and confirm answers are preserved (US2
  scenario 2). Change the radio or dropdown value and confirm only the latest value is
  kept (US2 scenario 6).
- Repeat once at a phone-width viewport (≈390 px) and confirm every control is
  reachable and usable (spec edge case: small screens).

## 7. Validate regression of existing surveys (FR-011)

- Open `http://localhost:4200/` — the default four-page "Customer Feedback Survey"
  renders unchanged.
- Open `http://localhost:4200/surveys/extended-feedback` — the extended survey
  renders unchanged.
- Open `http://localhost:4200/surveys/quick-pulse` — the three-step quick-pulse survey
  renders unchanged.
- Open `http://localhost:4200/surveys/does-not-exist` — the existing unknown-survey
  error state is shown (unchanged behavior).

## 8. Validate rejection paths (edge cases)

Two different safety nets apply; edit `public/survey-event-feedback.json`, observe,
then revert.

**Schema errors — caught at load time, user-visible.** Make one of these edits and
reload `http://localhost:4200/surveys/event-feedback`:

- Duplicate an option `value` within one question.
- Set one question's `options` to `[]`.
- Change `estimatedMinutes` to `0`.

**Expect** for each: the survey does not render (no partial survey); the page shows
the standard "This survey is temporarily unavailable." state, and the existing surveys
remain loadable (Constitution Principle I).

**Structure-rule violations — caught by the contract spec, not at load time.** The
schema validator has no per-survey rule for step/question counts, question types, or
required distribution, so these edits still load and render:

- Add a third step, or a fourth question to either step.
- Replace a question with a `textbox`.
- Mark `S1Q2` as `"required": true` (a second required question on step 1).

**Expect** for each: `pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts`
fails with a message naming the violated rule (spec SC-006). Revert the edit and the
spec passes again.
