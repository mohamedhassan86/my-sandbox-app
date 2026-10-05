# Tasks: TITO Survey

**Input**: Design documents from `/specs/009-tito-survey/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`,
`quickstart.md`

**Tests**: Included. Spec FR-012 and SC-005 explicitly require an automated check of the
survey's structure, required-answer behavior, and rule self-checks, and Constitution Principle
IV requires unit tests for a feature's domain rules. All test tasks target one new file,
`src/app/survey/tito-survey.contract.spec.ts`; it is the only `src/` file this feature touches.
Tests are written (and observed failing) before the fixture exists.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment. Story definitions follow `spec.md`
(US1 P1, US2 P1, US3 P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/concerns, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks include exact file paths or exact runnable commands

---

## Phase 1: Setup

**Purpose**: Ensure the workspace can build, test, and serve; no new dependencies are required.

- [x] T001 Ensure workspace dependencies are installed: run `corepack pnpm install --frozen-lockfile` at the repository root — no new packages are added

**Checkpoint**: Tooling verified.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Record the pre-change baseline and confirm the new identifiers are free.

- [x] T002 Run the pre-change regression gates at the repository root and record the results: `corepack pnpm exec vitest run` (baseline: pre-existing `src/app/app.spec.ts` suite-load failure under the raw runner; all other suites green) and `corepack pnpm exec ng build` (baseline: succeeds with the pre-existing CSS budget warnings for `survey-navigation.css` and `survey-shell.css`)
- [x] T003 [P] Verify identifier availability against `public/survey-manifest.json` and the existing fixtures: manifest key `tito` is unused, `surveyId` `SV011` is unused (existing: `SV001`, `SV008`, `SV009`, `SV010`), and the icon keys `id-card` and `laptop-file` have `.page-icon[data-icon=…]` rules in `src/styles/components/card.css` (research R2, R3, R7)

**Checkpoint**: Baseline recorded and identifiers confirmed — the user stories below can begin.

---

## Phase 3: User Story 1 - A new TITO survey is published without code changes (Priority: P1) 🎯 MVP

**Goal**: `/surveys/tito` serves a validated two-step survey (2 closed questions per step, one
required question per step, rating last, no attachments), registered through one manifest
entry, with zero runtime code changes and the four existing surveys untouched.

**Independent Test**: The contract spec passes (catalog integrity + structure rules + rule
self-checks); the dev server renders `/surveys/tito` with exactly 2 steps × 2 closed controls;
`git diff` shows only the fixture, the manifest entry, and the new test file under `public/`
and `src/`; existing survey URLs render unchanged.

- **Affected contracts**: [contracts/survey-json.md](contracts/survey-json.md) (fixture +
  manifest entry); research R1, R2, R3, R9, R10.
- **Validation behavior**: existing `validateSurveyConfig` (schema) on every manifest entry;
  contract-spec structure rules for what the schema does not cover (FR-002–FR-010).
- **Tests**: catalog-integrity, structure-rule, and rule self-check tests in
  `src/app/survey/tito-survey.contract.spec.ts`.
- **Acceptance evidence**: spec green; `git status --short` / `git diff --stat` footprint;
  browser render of `/surveys/tito`; existing surveys unchanged.

### Tests for User Story 1 (write first; they MUST fail before T006/T007)

- [x] T004 [US1] Create `src/app/survey/tito-survey.contract.spec.ts` with the shared helpers (read `public/*.json` via `node:fs`/`node:path`, load the manifest and the `tito` fixture through the real catalog/config services with `fetch` stubbed to `public/`, and a pure `structureViolations(survey)` rule set returning human-readable violations) plus the **catalog-integrity** tests: every manifest entry loads and passes `validateSurveyConfig` with zero issues; every key has a distinct source file and every source a distinct `surveyId`; the existing keys still map to their fixtures; `tito` maps to `survey-tito.json` (FR-001, FR-011, FR-012) — run `corepack pnpm exec vitest run src/app/survey/tito-survey.contract.spec.ts` and confirm it **fails** (fixture and manifest entry not yet present)
- [x] T005 [US1] Extend `src/app/survey/tito-survey.contract.spec.ts` with the **structure-rule** tests for the `tito` fixture — exactly 2 pages × 2 questions; closed types only (no `textbox`/`textarea`); the last question is a 1–5 rating with both end labels; unique page/question IDs and complete option lists; required set equals the first question of each page (`S1Q1`, `S2Q1`); no `minSelections`/`maxSelections`; `attachmentsRequired` 0 with no file-type or size limits; survey and page chrome present with icon keys in the shipped set and `estimatedMinutes` ≤3 (FR-002–FR-009) — and the **rule self-checks** (a table of deliberate violations applied to cloned fixtures, one `it` per row so titles stay readable, covering every rule) asserting each deliberate violation makes `structureViolations` report a violation (SC-005) — run the spec and confirm it **fails** until the fixture exists

### Implementation for User Story 1

- [x] T006 [P] [US1] Add the fixture `public/survey-tito.json` exactly as specified in [contracts/survey-json.md](contracts/survey-json.md) (`SV011`, 2 pages × 2 closed questions, required first question per page, rating last, `attachmentsRequired: 0` throughout)
- [x] T007 [P] [US1] Add the `"tito": "survey-tito.json"` entry to `public/survey-manifest.json` without altering the four existing entries
- [x] T008 [US1] Run `corepack pnpm exec vitest run src/app/survey/tito-survey.contract.spec.ts` and confirm the catalog and structure suites are green, then run `corepack pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts` to confirm the shared catalog checks accept the new entry

**Checkpoint**: US1 complete — the survey is published and structurally proven.

---

## Phase 4: User Story 2 - Abdelrahman completes the 2-step survey end to end (Priority: P1)

**Goal**: All four answers can be given with selection controls only, the closing rating
accepts 1–5, and the submitted response matches
[contracts/response-submission.md](contracts/response-submission.md).

**Independent Test**: Session tests answer all four questions, build the response, and assert
the completion tiles; the quickstart browser walk-through (sections 3 and 5) confirms it
visually.

- **Affected contracts**: [contracts/response-submission.md](contracts/response-submission.md).
- **Validation behavior**: existing `validateSurveyResponse` and `SurveySessionService`.
- **Tests**: journey tests in `src/app/survey/tito-survey.contract.spec.ts`.
- **Acceptance evidence**: spec green; browser completion summary shows 2/2 on both steps.

- [x] T009 [US2] Add the respondent-journey tests to `src/app/survey/tito-survey.contract.spec.ts`: the fully answered response matches the documented payload; both step tiles read `2/2 answered`; answers survive back/forward navigation; radio and dropdown keep only the latest value; every rating value 1–5 is accepted (FR-005, FR-010; US2 scenarios 1–4)
- [x] T010 [US2] Update `README.md` with the TITO survey key, URL (`/surveys/tito`), and its two-step/two-question all-closed structure

**Checkpoint**: US2 complete — the end-to-end respondent experience is proven.

---

## Phase 5: User Story 3 - Required closed answers are enforced once per step (Priority: P2)

**Goal**: Exactly the first question of each step gates navigation and submission; optional
questions never block.

**Independent Test**: Validation and session tests leave questions unanswered and assert the
reported issue IDs and blocking behavior.

- **Affected contracts**: [contracts/response-submission.md](contracts/response-submission.md).
- **Validation behavior**: existing required-empty checks for `S1Q1` and `S2Q1`; dropdown
  value-in-options check for `S1Q2`.
- **Tests**: required-answer tests in `src/app/survey/tito-survey.contract.spec.ts`.
- **Acceptance evidence**: spec green; browser validation messages identify the right question.

- [x] T011 [US3] Add the required-answer tests to `src/app/survey/tito-survey.contract.spec.ts`: nothing answered reports exactly `['S1Q1', 'S2Q1']`; `next()` is blocked on step 1 until `S1Q1` is answered; `buildResponse()` is `null` until `S2Q1` is answered and preserves step-1 answers; a required-only submission succeeds; cleared optional answers never block; an unlisted dropdown value is rejected (FR-007; US3 scenarios 1–4; SC-004)

**Checkpoint**: US3 complete — required-answer enforcement is proven.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T012 Run the full gates from the repository root: `corepack pnpm exec vitest run` (expect the pre-existing `app.spec.ts` raw-runner failure only), `corepack pnpm test` (project runner, expect green), `corepack pnpm exec ng build` (expect success with the pre-existing CSS warnings), `corepack pnpm exec tsc -p tsconfig.spec.json --noEmit`, and `corepack pnpm exec prettier --check` on every touched file
- [x] T013 Run the [quickstart.md](quickstart.md) browser walk-through against `pnpm start`, including the `/surveys/tito` render, the required-answer gate, the rating, and the regression pass over the four existing survey URLs

---

## Dependencies & Execution Order

- **Setup (T001)** → **Foundational (T002, T003)** → user stories.
- **US1** (T004–T008) is the MVP and a prerequisite for US2/US3: the fixture and catalog entry
  must exist before journey or required-answer tests can load the survey.
- **US2** (T009–T010) and **US3** (T011) only depend on US1 and touch the same spec file, so
  they are applied sequentially to avoid edit conflicts.
- **Polish (T012–T013)** depends on all stories.

## Notes

- All [P] tasks touch different files and can run in parallel.
- The fixture is the single source of truth: the contract spec, README, and this task list
  describe it and must not diverge from `public/survey-tito.json`.
