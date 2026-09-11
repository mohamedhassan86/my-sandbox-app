# Quickstart: Three-Step Closed-Question Survey

Run-guide for validating the `quick-pulse` survey end to end. Structure details live
in [contracts/survey-json.md](contracts/survey-json.md); answer shapes in
[contracts/response-submission.md](contracts/response-submission.md); instance
constraints in [data-model.md](data-model.md).

## Prerequisites

- Node/pnpm environment already set up for this workspace (`pnpm install` completed).
- Working tree with `public/survey-quick-pulse.json` added and the `quick-pulse`
  entry present in `public/survey-manifest.json`.

## 1. Verify the change footprint (no code changes)

```powershell
git status --short
git diff --stat
```

- **Expect**: the only production changes are `public/survey-quick-pulse.json`
  (new) and `public/survey-manifest.json` (one added entry). Nothing under `src/`
  changes (spec FR-001, SC-001).
- **Expect**: the manifest contains exactly the three keys `customer-feedback`,
  `extended-feedback`, `quick-pulse`, each mapping to a distinct fixture file
  (`survey.json`, `survey-8-step.json`, `survey-quick-pulse.json`) — a `quick-pulse`
  key aliasing an existing fixture fails this check (research R7).

## 2. Run the automated regression gates

```powershell
pnpm exec vitest run
pnpm exec ng build
```

- **Expect**: the existing suite is green and the production build succeeds — the
  feature is configuration-only, so any failure indicates accidental code change
  (spec SC-005).

## 3. Validate structure and closed types

```powershell
pnpm start
```

- Open `http://localhost:4200/surveys/quick-pulse`.
- **Expect**: the survey loads with title "Product Pulse Survey", a 3-minute estimate
  in the dock/topbar, and **exactly three steps** — "How You Use", "Your Experience",
  "Next Steps" — with **exactly three questions on each step** (spec FR-002).
- **Expect**: step icons render as laptop/star/shield glyphs (not the fallback
  clipboard) — FR-008.
- **Expect**: every question is a closed control — radio group (`S1Q1`), checkbox
  group (`S1Q2`), dropdown (`S1Q3`), rating scale 1–10 (`S2Q1`), satisfaction tiles
  (`S2Q2`), checkbox group (`S2Q3`), radio group (`S3Q1`), toggle (`S3Q2`), dropdown
  (`S3Q3`). No free-text field or file upload appears anywhere (spec FR-003, FR-007;
  US2 scenario 4).
- Spot-check the raw fixture (`http://localhost:4200/survey-quick-pulse.json`): 3
  pages × 3 questions, types `radio/checkbox/dropdown/rating/satisfaction/toggle_button`
  only, exactly 3 `"required": true` entries (`S1Q1`, `S1Q2`, `S1Q3`), all
  `attachmentsRequired: 0` (contracts/survey-json.md).

## 4. Validate required-answer enforcement (US3)

- Fresh load. On step 1, leave everything unanswered and attempt to continue.
- **Expect**: navigation is blocked; visible errors identify `S1Q1` (radio), `S1Q2`
  (checkbox), and `S1Q3` (dropdown) as required.
- Select one checkbox option in `S1Q2`, answer `S1Q1` and `S1Q3`, and continue.
- **Expect**: navigation succeeds; on steps 2–3 all questions are optional.
- On step 1 (after returning), clear `S1Q2` entirely and attempt to leave again.
- **Expect**: the checkbox error reappears (required + `minSelections: 1`).

## 5. Validate optional answers and clearing

- On step 2, select a value in the optional dropdown-free flow: pick a rating, then
  clear `S3Q3` after selecting an option on step 3.
- **Expect**: clearing returns the control to its empty state and the question counts
  as unanswered (US3 scenario behavior for optional questions).
- Submit with **only** the three required questions answered.
- **Expect**: submission succeeds; the completion summary shows step tiles of
  **3/3, 0/3, 0/3 answered**; unanswered optional questions are absent/`null` in the
  response (FR-009; contracts/response-submission.md).

## 6. Validate full completion (US2)

- Start a new response and answer all nine questions (including the toggle, which
  defaults to "No, thank you").
- **Expect**: progress ring/step buttons track answered counts live; after submit,
  the completion summary shows **3/3 on every step tile**; a new-response action
  resets the survey with no leftover answers.
- Navigate back and forth once mid-flow and confirm answers are preserved
  (US2 scenario 2).

## 7. Validate regression of existing surveys (FR-011)

- Open `http://localhost:4200/` — the default four-page "Customer Feedback Survey"
  renders unchanged.
- Open `http://localhost:4200/surveys/extended-feedback` — the extended survey
  renders unchanged.
- Open `http://localhost:4200/surveys/does-not-exist` — the existing unknown-survey
  error state is shown (unchanged behavior).

## 8. Validate configuration rejection paths (edge cases)

Temporarily edit `public/survey-quick-pulse.json`, reload the survey URL, confirm the
user-visible configuration error (no partial rendering), then revert:

- Duplicate an option `value` within one question.
- Set one question's `options` to `[]`.
- Add a fourth question to any page (violates the exactly-3 structure).
- Add a `textbox` question (violates closed-types-only).
- Change `estimatedMinutes` to `0`.

**Expect** for each: the survey fails to load with a visible error naming the
problem, and the existing surveys remain loadable (spec edge cases; Constitution
Principle I).
