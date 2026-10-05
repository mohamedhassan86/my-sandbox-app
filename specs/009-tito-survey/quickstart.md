# Quickstart: TITO Survey

Run-guide for validating the `tito` survey end to end. Structure details live in
[contracts/survey-json.md](contracts/survey-json.md); answer shapes in
[contracts/response-submission.md](contracts/response-submission.md); instance constraints in
[data-model.md](data-model.md).

## Prerequisites

- Node/pnpm environment already set up for this workspace (`pnpm install` completed).
- Working tree with `public/survey-tito.json` added, the `tito` entry present in
  `public/survey-manifest.json`, and `src/app/survey/tito-survey.contract.spec.ts` added.

## 1. Verify the change footprint (no runtime code changes)

```powershell
git status --short
git diff --stat
```

- **Expect**: the production changes are `public/survey-tito.json` (new) and
  `public/survey-manifest.json` (one added entry); the only `src/` change is the new test file
  `src/app/survey/tito-survey.contract.spec.ts`. No other file under `src/` changes (FR-001).
  `README.md` and `specs/009-tito-survey/` are documentation.
- **Expect**: `public/survey.json`, `public/survey-8-step.json`, `public/survey-quick-pulse.json`,
  and `public/survey-event-feedback.json` are untouched.
- **Expect**: the manifest contains exactly the five keys `customer-feedback`,
  `extended-feedback`, `quick-pulse`, `event-feedback`, `tito`, each mapping to a distinct
  fixture file.

## 2. Run the automated gates

```powershell
pnpm exec vitest run src/app/survey/tito-survey.contract.spec.ts
pnpm test
pnpm exec vitest run
pnpm exec ng build
pnpm exec prettier --check public/survey-tito.json public/survey-manifest.json src/app/survey/tito-survey.contract.spec.ts README.md
pnpm exec tsc -p tsconfig.spec.json --noEmit
```

- **Expect**: the contract spec passes (catalog integrity, structure rules, rule self-checks,
  respondent journey — FR-012, SC-005).
- **Expect**: `pnpm test` (`ng test`, the project runner) is green.
- **Expect**: raw `pnpm exec vitest run` is green except for the pre-existing
  `src/app/app.spec.ts` suite-load failure (JIT compiler not loaded under the raw runner) —
  unchanged from before this feature.
- **Expect**: the production build succeeds (same pre-existing CSS budget warnings as before),
  formatting is clean on the touched files, and the spec type-checks.

## 3. Validate structure and closed types

```powershell
pnpm start
```

- Open `http://localhost:4200/surveys/tito`.
- **Expect**: the survey loads with title "TITO Survey", a 2-minute estimate in the
  dock/topbar, and **exactly two steps** — "Personal Info" and "Education Info" — with
  **exactly two questions on each step** (FR-002, FR-003).
- **Expect**: step icons render as the id-card and laptop-file glyphs (not the fallback
  clipboard) — FR-009.
- **Expect**: every question is a closed control — radio group (`S1Q1`, marked required),
  dropdown (`S1Q2`), radio group (`S2Q1`, marked required), and a 1–5 rating scale (`S2Q2`,
  "Poor" … "Excellent" end labels). No free-text field or file upload appears anywhere
  (FR-004, FR-008).
- Spot-check the raw fixture (`http://localhost:4200/survey-tito.json`): 2 pages × 2 questions,
  types `radio/dropdown/radio/rating` only, exactly 2 `"required": true` entries — the first
  question of each step (`S1Q1`, `S2Q1`) — no `minSelections`/`maxSelections` fields, all
  `attachmentsRequired: 0`, and the last question of the last page is the rating (FR-005).

## 4. Validate required-answer enforcement (US3)

- Fresh load. On step 1, leave everything unanswered and attempt to continue.
- **Expect**: navigation is blocked; a visible error identifies `S1Q1` (radio) as the step's
  required question.
- Answer only `S1Q1` and continue (the optional dropdown stays empty).
- **Expect**: navigation to step 2 succeeds with no validation errors.
- On step 2 with nothing answered, attempt to submit.
- **Expect**: submission is blocked; a visible error identifies `S2Q1` as required, and the
  step-1 answer is still preserved when navigating back.

## 5. Validate the closing rating and skipping optional answers

- On step 1, clear `S1Q2` after selecting an option.
- **Expect**: the control returns to its empty state and the question counts as unanswered.
- On step 2, press each rating value 1–5 and confirm the readout updates (e.g. "4 / 5 — Good").
- Submit with **only** the two required questions answered, leaving the rating untouched.
- **Expect**: submission succeeds; the completion summary shows **1/2 answered, 1/2 answered**;
  unanswered optional questions are absent/`null` (FR-007, SC-004).
- Start a new response and answer all four questions (including the rating).
- **Expect**: the completion summary shows **2/2 answered on both step tiles** and a
  new-response action resets the survey with no leftover answers.

## 6. Validate regression of existing surveys (FR-011)

- Open `http://localhost:4200/` — the default "Customer Feedback Survey" renders unchanged.
- Open `http://localhost:4200/surveys/extended-feedback` — the extended survey renders unchanged.
- Open `http://localhost:4200/surveys/quick-pulse` — the three-step quick-pulse survey renders
  unchanged.
- Open `http://localhost:4200/surveys/event-feedback` — the two-step event-feedback survey
  renders unchanged.
- Open `http://localhost:4200/surveys/does-not-exist` — the existing unknown-survey error state
  is shown (unchanged behavior).

## 7. Validate rejection paths (edge cases)

Two different safety nets apply; edit `public/survey-tito.json`, observe, then revert.

**Schema errors — caught at load time, user-visible.** Duplicate an option `value` within one
question, set one question's `options` to `[]`, or change `estimatedMinutes` to `0`, then
reload `http://localhost:4200/surveys/tito`.

- **Expect**: the survey does not render (no partial survey); the page shows the standard
  "This survey is temporarily unavailable." state, and the existing surveys remain loadable.

**Structure-rule violations — caught by the contract spec, not at load time.** Add a third
step, add a third question to a step, replace a question with a `textbox`, or move the rating
off the last question (e.g. swap `S2Q2` to a radio).

- **Expect**: `pnpm exec vitest run src/app/survey/tito-survey.contract.spec.ts` fails with a
  message naming the violated rule (FR-012, SC-005). Revert the edit and the spec passes again.
