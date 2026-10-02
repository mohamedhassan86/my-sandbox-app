# Tasks: Two-Step Event Feedback Survey

**Input**: Design documents from `/specs/008-two-step-event-survey/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: Included. Spec FR-013 and SC-006 explicitly require an automated check of the
survey's structure and required-answer behavior, and Constitution Principle IV requires
unit tests for a feature's domain rules. All test tasks target one new file,
`src/app/survey/survey-fixtures.contract.spec.ts`, built up story by story; it is the
only `src/` file this feature touches. Tests are written (and observed failing) before
the fixture exists.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment. Story definitions follow `spec.md`
(US1 P1, US2 P1, US3 P2). Each story phase lists the **affected contracts, validation
behavior, tests, and acceptance evidence** required by the constitution's Development
Workflow.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/concerns, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks include exact file paths or exact runnable commands

---

## Phase 1: Setup

**Purpose**: Ensure the workspace can build, test, and serve; no new dependencies are
required (the feature reuses the existing Angular/PrimeNG/Vitest tooling).

- [X] T001 Ensure workspace dependencies are installed: run `pnpm install --frozen-lockfile` at the repository root (against `package.json` / `pnpm-lock.yaml`; pnpm 11.25.0 via corepack) — no new packages are added

**Checkpoint**: Tooling verified.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Record the pre-change baseline and confirm the new identifiers are free, so
the change is provable and regressions are attributable.

- [X] T002 Run the pre-change regression gates at the repository root and record the results: `pnpm test` (`ng test`), `pnpm exec vitest run`, and `pnpm exec ng build` (package.json scripts) — baseline: `ng test` 20 files / 151 tests green; raw `vitest run` 150/150 tests with the pre-existing `src/app/app.spec.ts` suite-load failure (JIT compiler not loaded under the raw runner); `ng build` succeeds with 2 pre-existing CSS budget warnings (`survey-navigation.css`, `survey-shell.css`); also record that `pnpm exec tsc -p tsconfig.spec.json --noEmit` and `pnpm exec tsc -p tsconfig.app.json --noEmit` are clean and that `pnpm exec prettier --check public/survey-manifest.json README.md` passes (the files this feature will touch)
- [X] T003 [P] Verify identifier availability against `public/survey-manifest.json`, `public/survey.json`, `public/survey-8-step.json`, and `public/survey-quick-pulse.json`: manifest key `event-feedback` is unused, `surveyId` `SV010` is unused (existing: `SV001`, `SV008`, `SV009`), and the icon keys `id-card` and `star` have `.page-icon[data-icon=…]` rules in `src/styles/components/card.css` (research R2, R7)

**Checkpoint**: Baseline recorded and identifiers confirmed — the user stories below can
begin.

---

## Phase 3: User Story 1 - A new compact event-feedback survey is published without code changes (Priority: P1) 🎯 MVP

**Goal**: `/surveys/event-feedback` serves a validated two-step survey (3 closed
questions per step, one required question per step, no attachments), registered through
one manifest entry, with zero runtime code changes and the three existing surveys
untouched.

**Independent Test**: The new contract spec passes (catalog integrity + structure rules
+ rule self-checks); the dev server renders `/surveys/event-feedback` with exactly 2
steps × 3 closed controls; `git diff` shows only the fixture, the manifest entry, and
the new test file under `public/` and `src/`; existing survey URLs render unchanged.

- **Affected contracts**: [contracts/survey-json.md](contracts/survey-json.md) (fixture
  + manifest entry); research R1, R2, R9, R10.
- **Validation behavior**: existing `validateSurveyConfig` (schema) on every manifest
  entry; contract-spec structure rules for what the schema does not cover (FR-002–FR-008).
- **Tests**: catalog-integrity, structure-rule, and rule self-check tests in
  `src/app/survey/survey-fixtures.contract.spec.ts`.
- **Acceptance evidence**: spec green; `git status --short` / `git diff --stat`
  footprint; browser render of `/surveys/event-feedback`; existing surveys unchanged.

### Tests for User Story 1 (write first; they MUST fail before T006/T007)

- [X] T004 [US1] Create `src/app/survey/survey-fixtures.contract.spec.ts` with the shared helpers (read `public/*.json` via `node:fs`/`node:path` as in `src/app/shared/design-system/design-token.contract.spec.ts`, load the manifest and the `event-feedback` fixture, and a pure `structureViolations(survey)` rule set returning human-readable violations) plus the **catalog-integrity** tests: every manifest entry loads and passes `validateSurveyConfig` with zero issues; every key has a distinct source file and every source a distinct `surveyId`; the existing keys still map to `survey.json` / `survey-8-step.json` / `survey-quick-pulse.json`; `event-feedback` maps to `survey-event-feedback.json` (FR-001, FR-011, FR-013; US1 scenarios 2–4; research R9) — run `pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts` and confirm it **fails** (fixture and manifest entry not yet present)
- [X] T005 [US1] Extend `src/app/survey/survey-fixtures.contract.spec.ts` with the **structure-rule** tests for the `event-feedback` fixture — exactly 2 pages × 3 questions; closed types only (no `textbox`/`textarea`); at least one `radio`, `checkbox`, and `dropdown`; required set equals the first question of each page (`S1Q1` radio, `S2Q1` rating); no `minSelections`/`maxSelections`; `attachmentsRequired` 0 with no `acceptedFileTypes`/`maxFileSizeBytes`; unique page/question IDs and complete option lists; survey and page chrome present with icon keys in the shipped set and `estimatedMinutes` ≤3 (FR-002–FR-008) — and the **rule self-checks** (a table of deliberate violations applied to cloned fixtures, one `it` per row so titles stay readable, covering every rule: third page, fourth/removed question, `textbox`/`textarea` swap, removed radio/checkbox/dropdown, duplicate question ID or option value, empty options, second required question, required not first, `minSelections` added, attachment or file types added, unknown icon, missing step description, long estimate) asserting each deliberate violation makes `structureViolations` report a violation (SC-002, SC-006) — run the spec and confirm it **fails** until the fixture exists

### Implementation for User Story 1

- [X] T006 [P] [US1] Create the fixture `public/survey-event-feedback.json` by mirroring the JSON in `specs/008-two-step-event-survey/contracts/survey-json.md` exactly (`SV010`, 2 pages × 3 closed questions: `S1Q1` radio required, `S1Q2` checkbox, `S1Q3` dropdown, `S2Q1` rating required 1–5, `S2Q2` satisfaction, `S2Q3` toggle_button default off) (FR-001–FR-008, FR-012)
- [X] T007 [P] [US1] Add the manifest entry `"event-feedback": "survey-event-feedback.json"` to `public/survey-manifest.json`, leaving the three existing entries byte-for-byte unchanged (FR-001, FR-011)
- [X] T008 [US1] Run `pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts` (all T004/T005 tests now **pass**) and `pnpm exec prettier --check public/survey-event-feedback.json public/survey-manifest.json src/app/survey/survey-fixtures.contract.spec.ts`; fix any finding in the file that owns it (FR-013, SC-002, SC-006; US1 scenarios 1, 3, 4)
- [X] T009 [P] [US1] Validate the change footprint (quickstart §1): at the repository root run `git status --short` and `git diff --stat` and confirm the changes are exactly `public/survey-event-feedback.json` (new), `public/survey-manifest.json` (one added entry), and the new spec — no other file under `src/` — and `git diff --stat -- public/survey.json public/survey-8-step.json public/survey-quick-pulse.json` prints nothing (spec FR-001, FR-011, SC-001)
- [X] T010 [P] [US1] Validate rendering in a browser (quickstart §3 and §7): start `pnpm start` and open `/surveys/event-feedback` — title "Event Feedback Survey", 2-minute estimate, exactly 2 steps with 3 questions each, radio/checkbox/dropdown/rating/satisfaction/toggle controls, no free-text or file input; open `/`, `/surveys/extended-feedback`, `/surveys/quick-pulse`, and `/surveys/does-not-exist` and confirm unchanged behavior (spec US1 scenarios 1–2, FR-008, FR-011)

**Checkpoint**: User Story 1 complete — the survey is published and guarded by the
contract spec. **This is the MVP.**

---

## Phase 4: User Story 2 - A respondent completes the 2-step survey end to end (Priority: P1)

**Goal**: A respondent can answer all six closed questions step by step, navigate back
and forth with answers preserved, submit, and see the standard completion summary
showing both steps fully answered.

**Independent Test**: A real `SurveySessionService` journey over the shipped fixture
yields a valid response (`SV010`, empty attachments, documented value shapes) and 3/3
tiles; the browser walk-through of quickstart §6 completes and shows the same.

- **Affected contracts**: [contracts/response-submission.md](contracts/response-submission.md)
  (value shapes per type); existing `SurveyResponse`/`Answer` models.
- **Validation behavior**: existing `validateSurveyResponse` accepts fully answered
  responses; checkbox arrays, rating numeric strings, and toggle booleans are valid.
- **Tests**: respondent-journey tests in the contract spec (session + completion tiles).
- **Acceptance evidence**: spec green; quickstart §6 observations (progress, readout,
  completion tiles 3/3 ×2, reset on new response, phone-width usability).

### Tests for User Story 2 (write first)

- [X] T011 [US2] Extend `src/app/survey/survey-fixtures.contract.spec.ts` with the **respondent-journey** tests using `new SurveySessionService()`, `validateSurveyResponse`, and `buildCompletionTiles` over the shipped fixture: answering all six questions with the documented shapes (`S1Q1` string, `S1Q2` string[], `S1Q3` string, `S2Q1` numeric string, `S2Q2` string, `S2Q3` boolean) makes `buildResponse()` return a response with `surveyId` `SV010`, `surveyVersion` `1.0`, six answers, and `attachments` `[]`; tiles read "3/3 answered" for "Your Attendance" and "Your Experience" plus a Files tile; going `next()` then `previous()` preserves answers; re-answering a radio/dropdown replaces the earlier value; a checkbox keeps every selected value (spec FR-010; US2 scenarios 1–3, 5–6)

### Implementation for User Story 2

- [X] T012 [US2] Run `pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts` and confirm the US2 tests pass against the shipped fixture (no fixture change is expected; a failure points at a contract/fixture mismatch — fix the fixture, never the runtime code) (FR-010; US2 scenarios 1–3, 5–6)
- [X] T013 [US2] Validate end to end in a browser (quickstart §6): answer all six questions by selection only, check the rating readout ("4 / 5 — Good" style), progress ring/step buttons, back/forward preservation, submit, and the completion summary (**3/3 answered** on both tiles); start a new response and confirm no leftover answers; repeat at a ≈390 px viewport (spec US2 scenarios 1–7, FR-012, SC-003)

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Required closed answers are enforced once per step (Priority: P2)

**Goal**: Leaving step 1 or submitting is blocked, with visible feedback naming the
question, until that step's single required question (its first) is answered; optional
questions never block, and an untouched toggle is neither counted nor submitted.

**Independent Test**: Session tests show `next()` blocked until `S1Q1` is answered and
`buildResponse()` `null` until `S2Q1` is answered; a required-only response is accepted
with tiles "1/3 answered" on both steps; the browser walk-through of quickstart §4–§5
shows the visible errors and the successful required-only submission.

- **Affected contracts**: [contracts/response-submission.md](contracts/response-submission.md)
  (required rows, unanswered representations); [contracts/survey-json.md](contracts/survey-json.md)
  required-distribution rule.
- **Validation behavior**: existing `validatePageResponse`/`validateSurveyResponse`
  required-empty check for `S1Q1` and `S2Q1`; no selection bounds anywhere.
- **Tests**: required-enforcement tests in the contract spec.
- **Acceptance evidence**: spec green; quickstart §4–§5 observations (blocked
  navigation/submission with visible message, required-only submission success,
  cleared checkbox not blocking).

### Tests for User Story 3 (write first)

- [X] T014 [US3] Extend `src/app/survey/survey-fixtures.contract.spec.ts` with the **required-enforcement** tests: with nothing answered, `validateSurveyResponse` reports exactly two issues (`S1Q1` and `S2Q1`, one per page) and `next()` returns `false`; after answering only `S1Q1`, `next()` succeeds with optional questions empty; `buildResponse()` stays `null` until `S2Q1` is answered, then returns a response containing only the two required answers when the rest are untouched; the completion tiles then read "1/3 answered" for both steps (an untouched toggle is not counted); a cleared checkbox (`[]`) or dropdown (`null`) neither blocks `next()` nor counts as answered; an explicit toggle "No" (`false`) does count as answered; a dropdown value outside the option list is rejected (spec FR-006, FR-009; US3 scenarios 1–5; edge case: untouched toggle)

### Implementation for User Story 3

- [X] T015 [US3] Run `pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts` and confirm the US3 tests pass against the shipped fixture (a failure points at a fixture deviation from the required-distribution rule — fix the fixture, never the runtime code) (FR-006, FR-009; US3 scenarios 1–5)
- [X] T016 [US3] Validate enforcement in a browser (quickstart §4 and §5): leave step 1 empty and try to continue (blocked, visible error for `S1Q1`); answer only `S1Q1` and continue; on step 2 try to submit empty (blocked, visible error for `S2Q1`, step-1 answer preserved); select then clear every checkbox option and clear the dropdown (neither blocks); submit with only the two required answers and confirm the summary tiles read **1/3 answered, 1/3 answered** (spec US3 scenarios 1–5, SC-004)

**Checkpoint**: All user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, edge-case verification, and final gates.

- [X] T017 [P] Update `README.md`: add an `event-feedback` "Sample survey" paragraph after the quick-pulse paragraph (URL `/surveys/event-feedback`, `SV010`, 2 steps × 3 closed questions, required questions `S1Q1` and `S2Q1`, rating 1–5, manifest key and fixture file), and add `007-three-step-survey` and `008-two-step-event-survey` to the "Spec Kit planning artifacts live under" list (007 is currently missing)
- [X] T018 [P] Validate rejection paths (quickstart §8): temporarily apply schema-invalid edits to `public/survey-event-feedback.json` (duplicate option `value`, `options: []`, `estimatedMinutes: 0`) and confirm the standard "temporarily unavailable" state with no partial survey; temporarily apply structure edits (third page, fourth question, `textbox` swap, second required question) and confirm `pnpm exec vitest run src/app/survey/survey-fixtures.contract.spec.ts` fails naming the violated rule; revert every edit and confirm `git diff -- public/survey-event-feedback.json` is empty relative to the contracted JSON (spec edge cases, SC-006)
- [X] T019 Run the final gates at the repository root and compare with the T002 baseline: `pnpm test`, `pnpm exec vitest run`, `pnpm exec ng build`, `pnpm exec prettier --check public/survey-event-feedback.json public/survey-manifest.json src/app/survey/survey-fixtures.contract.spec.ts README.md`, and `pnpm exec tsc -p tsconfig.spec.json --noEmit` (plus `tsc -p tsconfig.app.json --noEmit`) — expect `ng test` green with the new tests added, raw `vitest run` failing only on the pre-existing `app.spec.ts` suite load, the build successful with the same two budget warnings, and no formatting or type errors (spec SC-005; Constitution Principle IV)
- [X] T020 Run the post-implementation converge check (`/speckit-converge`): confirm every FR/SC in `specs/008-two-step-event-survey/spec.md` is satisfied by the shipped files (`public/survey-event-feedback.json`, `public/survey-manifest.json`, `src/app/survey/survey-fixtures.contract.spec.ts`, `README.md`), fix any drift in the artifacts, and mark each completed task above `[X]`
- [X] T021 Commit the feature on the working branch `arena/01a0fd24-my-sandbox-app` with a message such as `Add event-feedback survey (2 steps x 3 closed questions)`; the change description lists the configuration change (new fixture + manifest key `event-feedback`) and the verification commands from T019

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — T002 needs installed dependencies;
  T003 is independent of T002.
- **User Stories (Phases 3–5)**: All depend on Foundational completion.
  - US1 (P1) is the MVP: it creates the helpers, the fixture, and the manifest entry.
  - US2 (P1) and US3 (P2) extend the same spec file and need the US1 fixture, so they
    follow US1; between themselves they are independent (different `describe` blocks),
    but they edit one file, so run them sequentially.
- **Polish (Phase 6)**: Depends on all user stories being complete (T019 needs the
  final fixture and spec; T017 and T018 can start as soon as US1 is checkpointed).

### Within Each User Story

- Test tasks come first and MUST be observed failing (US1) before the fixture exists.
- Fixture (T006) and manifest (T007) are different files — parallel — but both must
  exist before T008.
- Browser validations (T010, T013, T016) need a running dev server; keep one `pnpm
  start` process for all three.
- A story is complete only after its validation task passes.

### Parallel Opportunities

- T003 alongside T002.
- T006 and T007 together (different files).
- T009 and T010 together once T008 is green.
- T017 and T018 together in Polish.
- All tasks that edit `src/app/survey/survey-fixtures.contract.spec.ts` (T004, T005,
  T011, T014) are sequential by nature.

---

## Parallel Example: User Story 1

```text
# After T004 and T005 are written and observed failing:
Task: "Create the fixture public/survey-event-feedback.json (T006)"
Task: "Add the manifest entry to public/survey-manifest.json (T007)"

# After T008 is green:
Task: "Validate the change footprint with git status/diff (T009)"
Task: "Validate rendering at /surveys/event-feedback in a browser (T010)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1–2: T001–T003 (baseline recorded, identifiers confirmed).
2. Complete Phase 3: User Story 1 (T004–T010).
3. **STOP and VALIDATE**: `/surveys/event-feedback` loads with 2 steps × 3 closed
   questions, the contract spec is green, no runtime code changed, existing surveys
   unaffected.
4. Commit (T021 may be deferred to the end) — the published survey is the MVP.

### Incremental Delivery

1. T001–T003 → baseline recorded.
2. Add User Story 1 (T004–T010) → validate → **MVP** (survey published and guarded).
3. Add User Story 2 (T011–T013) → validate → full completion flow proven.
4. Add User Story 3 (T014–T016) → validate → per-step enforcement proven.
5. Polish (T017–T021) → README, rejection paths, final gates, converge, commit. Each
   increment leaves all previous stories working.

### Parallel Team Strategy

With two implementers:

1. One person completes Setup, Foundational, and US1 (T001–T010).
2. Once US1 is checkpointed:
   - Person A: US2 tests and browser flow (T011–T013).
   - Person B: US3 tests and browser flow (T014–T016), merging the spec file edits
     with Person A's (same file — coordinate or take turns).
3. Both feed into Polish (T017–T021), where T017 and T018 run in parallel.

---

## Notes

- [P] tasks = different files/concerns, no dependencies on incomplete tasks.
- [USn] labels map each task to a spec user story for traceability.
- The only runtime-adjacent change is the single new spec file; any task that finds
  itself editing a non-spec file under `src/` has drifted and must stop (Constitution
  Principle I).
- The fixture content is fully specified in
  `specs/008-two-step-event-survey/contracts/survey-json.md`; implement T006 by
  mirroring that JSON exactly.
- Formatting gate scope: code, JSON fixtures, and `README.md` are Prettier-checked.
  Spec Kit documents under `specs/` follow the repository's existing hand-wrapped
  Markdown convention (the existing 001–007 spec documents are not Prettier-formatted),
  so they are intentionally excluded.
- Commit after each task or logical group; stop at any checkpoint to validate the
  story independently.
- Avoid: partial fixture rendering, runtime code changes, deviating from the contracted
  manifest key `event-feedback`, free-text questions, or leaving selection-bounds
  (`minSelections`/`maxSelections`) on any question.
