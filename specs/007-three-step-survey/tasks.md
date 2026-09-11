# Tasks: Three-Step Closed-Question Survey

**Input**: Design documents from `/specs/007-three-step-survey/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: No new test tasks — this feature is configuration-only (no application
code changes), so the constitution's test obligation applies to the unchanged existing
suite. Validation is performed through the existing test suite, the production build,
and the runnable scenarios in `quickstart.md` referenced per task.

**Round 2 (regenerated 2026-09-11)**: This list reflects clarification round 2 —
**exactly one required question per step, each the step's first question
(`S1Q1` radio, `S2Q1` rating, `S3Q1` radio), all other questions optional, and no
minimum/maximum-selection rules anywhere**. The round-1 implementation shipped a
fixture with the old required mix (three required on step 1 + `minSelections: 1`);
round-1 work already completed is marked `[X]`, and the remaining tasks carry the
delta. The contracted fixture in `contracts/survey-json.md` (v2) is the single source
of truth for the fixture.

**Organization**: Tasks are grouped by user story so each story can be implemented and
validated as an independently useful increment. Story definitions follow
`spec.md` (US1 P1, US2 P1, US3 P2).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files/concerns, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All tasks include exact file paths or exact runnable commands

---

## Phase 1: Setup

**Purpose**: Ensure the workspace can build and serve; no new dependencies are
required (the feature reuses the existing Angular/PrimeNG/Vitest tooling).

- [X] T001 Ensure workspace dependencies are installed: run `pnpm install` at the repository root (against `package.json` / `pnpm-lock.yaml`) — completed in round 1 (pnpm 11.25.0 via corepack, `node_modules/` present and current)

**Checkpoint**: Tooling verified; round-1 baseline already recorded.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Record the round-2 delta baseline so the change is provable and
reversible.

- [X] T002 Run the pre-change regression gates at the repository root: `pnpm exec vitest run` and `pnpm exec ng build` (package.json scripts) — completed in round 1 (150/150 tests; `src/app/app.spec.ts` pre-existing JIT-loader load failure documented; build success with pre-existing CSS budget warnings). No code changes are expected in round 2, so this baseline remains the comparison point for T020
- [X] T003 Record the round-2 delta baseline at the repository root: confirm `public/survey-quick-pulse.json` (shipped, pre-change) has `required: true` on `S1Q1`/`S1Q2`/`S1Q3` and `minSelections: 1` on `S1Q2`, and that `specs/007-three-step-survey/contracts/survey-json.md` (v2 contract) requires exactly `S1Q1`/`S2Q1`/`S3Q1` with no selection-bounds fields — i.e. shipped fixture currently DEVIATES from the contract; capture `git status --short` and `git diff --stat` for reference

**Checkpoint**: Delta baseline recorded — the fixture update (Phase 3) has a defined, checkable target.

---

## Phase 3: User Story 1 - The published survey matches the updated contract (Priority: P1) 🎯 MVP

**Goal**: The shipped fixture at `/surveys/quick-pulse` carries exactly one required
question per step (its first: `S1Q1` radio, `S2Q1` rating, `S3Q1` radio), all other
questions optional, and no selection-bounds rules — byte-for-byte per the v2
contract, with zero application code changes and the manifest/URL unchanged.

**Independent Test**: `public/survey-quick-pulse.json` is byte-equivalent to the v2
contract JSON and passes the real schema validator with 0 issues; structural check
shows required == {S1Q1, S2Q1, S3Q1}; `git diff` shows the fixture as the only
production-file change.

### Implementation for User Story 1

- [X] T004 [US1] Manifest entry unchanged: `public/survey-manifest.json` still maps `"quick-pulse": "survey-quick-pulse.json"` alongside the two untouched existing keys (round-1 verified; round 2 makes no manifest changes)
- [X] T005 [US1] Update the fixture `public/survey-quick-pulse.json` to the v2 contract in `specs/007-three-step-survey/contracts/survey-json.md`: set `required: false` on `S1Q2` and `S1Q3`, `required: true` on `S2Q1` and `S3Q1`, and remove the `minSelections: 1` field from `S1Q2` — no other line of the file changes (verified by diff against the contract JSON)
- [X] T006 [US1] Validate the updated fixture: confirm it is byte-equivalent to the v2 contract JSON; run the real `validateSurveyConfig` (e.g. via `node --experimental-strip-types` against `src/app/core/validators/survey-config.validator.ts`) and expect 0 issues; structural check of `public/survey-quick-pulse.json`: 3 pages × 3 questions, closed types only, required exactly {`S1Q1`, `S2Q1`, `S3Q1`}, no `minSelections`/`maxSelections` fields, all `attachmentsRequired: 0`
- [X] T007 [US1] Validate the round-2 change footprint: run `git status --short` and `git diff --stat` at the repository root and confirm the production diff is exactly `public/survey-quick-pulse.json` (modified) with zero files under `src/` or `public/survey-manifest.json` (spec FR-001, SC-001)
- [X] T008 [P] [US1] Validate existing surveys are still unchanged: with the dev server running, confirm the served `http://localhost:4200/survey.json` and `http://localhost:4200/survey-8-step.json` are byte-identical to git HEAD and `/` plus `/surveys/extended-feedback` render as before (spec FR-011; `specs/007-three-step-survey/quickstart.md` §7)

**Checkpoint**: User Story 1 complete — the published survey matches the updated
contract. **This is the round-2 MVP.**

---

## Phase 4: User Story 2 - A respondent completes the 3-step survey end to end (Priority: P1)

**Goal**: The full respondent journey still works on the updated survey: answering
all nine closed questions, live progress, answer preservation, submission, and the
completion summary — with `S2Q1` (rating) now among the required answers.

**Independent Test**: With the updated fixture live, complete a full response using
only selection controls, submit, and confirm the completion summary shows 3/3
answered on all three step tiles; a new response starts clean.

### Implementation for User Story 2

- [X] T009 [US2] Exercise the full completion flow in `http://localhost:4200/surveys/quick-pulse`: answer all nine questions using only selection controls (radio `S1Q1`, checkbox `S1Q2`, dropdown `S1Q3`, rating `S2Q1`, satisfaction `S2Q2`, checkbox `S2Q3`, radio `S3Q1`, toggle `S3Q2`, dropdown `S3Q3`) and submit; confirm the completion summary shows 3/3 answered on every step tile and that starting a new response resets to an unanswered state (US2 scenario 3; `specs/007-three-step-survey/quickstart.md` §6)
- [X] T010 [US2] Validate answer preservation and live progress: navigate back and forth across the three steps and confirm previously given answers are preserved and displayed on return while step buttons, progress ring, and answered counts update live (US2 scenarios 1–2; `specs/007-three-step-survey/quickstart.md` §6)
- [X] T011 [US2] Validate closed-interface behavior: confirm no question renders a free-text field or file upload anywhere in the survey; confirm a checkbox question records every selected option; confirm radio/dropdown selections replace the previously recorded value with exactly one value held (US2 scenarios 4–6; spec FR-003, FR-007; `specs/007-three-step-survey/quickstart.md` §3)
- [X] T012 [US2] Validate the submitted response shape via devtools (or the local submission adapter): confirm per-question value domains match the updated `specs/007-three-step-survey/contracts/response-submission.md` — required answers `S1Q1`/`S2Q1`/`S3Q1` always present (string / numeric string `"1"`–`"10"` / string), optional answers `S1Q2`/`S2Q3` string arrays, `S2Q2`/`S3Q3` strings, `S3Q2` boolean, and an empty attachments list (spec FR-010)

**Checkpoint**: User Stories 1 AND 2 both work independently — the complete
respondent journey is re-verified on the updated survey.

---

## Phase 5: User Story 3 - Required closed answers are enforced once per step (Priority: P2)

**Goal**: Exactly one required question per step blocks navigation/submission with
visible, question-specific feedback (`S1Q1` on step 1, `S2Q1` on step 2, `S3Q1` on
step 3); optional questions — including checkboxes with no selection-bounds rule —
can be skipped or cleared without error.

**Independent Test**: With the updated fixture live, each step blocks with nothing
answered (naming its first question), and submitting with only `S1Q1` + `S2Q1` +
`S3Q1` answered succeeds with 1/3, 1/3, 1/3 completion tiles.

### Implementation for User Story 3

- [X] T013 [US3] Validate per-step required blocking in `http://localhost:4200/surveys/quick-pulse`: from a fresh load attempt to continue on step 1 with nothing answered (blocked; error identifies `S1Q1` radio); answer only `S1Q1`, then on step 2 with nothing answered attempt to continue (blocked; error identifies `S2Q1` rating); answer only `S2Q1`, then on step 3 with nothing answered attempt to submit (blocked; error identifies `S3Q1` radio) (US3 scenario 1; `specs/007-three-step-survey/quickstart.md` §4)
- [X] T014 [P] [US3] Validate optional checkbox is fully skippable: on any step, select then deselect all options of `S1Q2` (or `S2Q3`) and attempt to continue; confirm navigation succeeds and the question is treated as unanswered — no minimum-selection error appears (US3 scenario 3; FR-006; `specs/007-three-step-survey/quickstart.md` §5)
- [X] T015 [US3] Validate required-only submission: start a new response, answer exactly `S1Q1`, `S2Q1`, `S3Q1` and submit; confirm submission succeeds, the response contains only the three required answers (optional questions absent/`null`), and the completion summary shows 1/3, 1/3, 1/3 step tiles (US3 scenario 4; spec FR-009; `specs/007-three-step-survey/quickstart.md` §5)
- [X] T016 [P] [US3] Validate optional-dropdown clearing: on `S3Q3` select an option, then clear it; confirm the control returns to its empty state and the question counts as unanswered (no value recorded) (US3 scenario behavior; `specs/007-three-step-survey/quickstart.md` §5)
- [X] T017 [P] [US3] Validate submission-blocking on the final step: from a new response with `S3Q1` unanswered, reach step 3 and attempt to submit; confirm submission is blocked with visible validation feedback naming `S3Q1` and all previously entered answers are preserved (US3 scenario 5; `specs/007-three-step-survey/quickstart.md` §4)

**Checkpoint**: All three user stories independently functional on the updated
survey — publication, completion, and per-step enforcement all verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove the negative/edge paths on the updated fixture, re-run the
quality gates, sync the README, and commit the delta.

- [X] T018 [P] Validate configuration rejection paths: apply each mutation to `public/survey-quick-pulse.json` in turn — duplicate an option `value`, set one question's `options` to `[]`, add a fourth question to any page, add a `textbox` question, set `estimatedMinutes: 0` — reload `/surveys/quick-pulse` each time and confirm a user-visible configuration error with no partial rendering, then revert to the v2 contract fixture (spec edge cases; Constitution Principle I; `specs/007-three-step-survey/quickstart.md` §8)
- [X] T019 [P] Validate the unknown-survey error path: confirm `http://localhost:4200/surveys/does-not-exist` shows the existing unknown-survey error state unchanged by this feature (spec edge cases; `specs/007-three-step-survey/quickstart.md` §7)
- [X] T020 Run the post-change regression gates at the repository root: `pnpm exec vitest run` and `pnpm exec ng build` (package.json scripts) — both MUST pass and match the T002 round-1 baseline behavior (150/150 tests; build success; pre-existing `app.spec.ts` load issue unchanged) (spec SC-005; Constitution Principle IV)
- [X] T021 [P] Update the `quick-pulse` paragraph in `README.md`: replace the round-1 sentence "exactly three required questions: one radio, one checkbox, and one dropdown" with the per-step wording — exactly one required question per step (its first: a radio, a rating, and a radio) — keeping the rest of the paragraph unchanged
- [X] T022 Commit the round-2 delta on the working branch: stage `public/survey-quick-pulse.json`, `README.md`, and the updated `specs/007-three-step-survey/` artifacts; write a commit message describing the configuration change (one required question per step = first question; `minSelections` removed) and listing the verification commands used — PR #7 on the same branch picks the commit up automatically

**Checkpoint**: Round 2 complete — the survey matches the updated spec end to end,
gates green, documented, and committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Complete (round 1).
- **Foundational (Phase 2)**: T002 complete (round 1); T003 (delta baseline) blocks
  Phase 3.
- **User Story 1 (Phase 3)**: Depends on T003 — produces the updated live fixture
  that US2 and US3 both consume.
- **User Story 2 (Phase 4)**: Depends on US1 (T005–T007).
- **User Story 3 (Phase 5)**: Depends on US1 (T005–T007); independent of US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete (T018
  requires the final fixture state; T020 runs last among validations).

### User Story Dependencies

- **US1 (P1)**: Start after T003; no dependencies on other stories.
- **US2 (P1)**: Start after US1's fixture tasks (T005–T007); independently testable.
- **US3 (P2)**: Start after US1's fixture tasks (T005–T007); independently testable
  in parallel with US2.

### Within Each User Story

- Fixture update (T005) before its validation (T006), before footprint/regression
  checks (T007–T008).
- US2/US3 validation tasks are independent of each other once the updated fixture is
  live.
- T018 (edge mutations) MUST be reverted before T020 (final gates) run.
- T021 (README) can run in parallel with T018/T019 but MUST finish before T022
  (commit).

### Parallel Opportunities

- **T008** (existing-survey regression) can run alongside T007 (footprint) after
  T006 — different concerns, no shared state.
- **US2 and US3** can be validated in parallel by two reviewers after US1 completes
  (different respondent flows over the same live fixture).
- Within US3, **T014, T016, T017** are independent flows and can run in parallel
  (each starts from a fresh response).
- **T018, T019, T021** can run in parallel in the polish phase.

---

## Parallel Example: User Story 1

```bash
# After T005–T006 complete, these two can run concurrently:
Task: "Validate round-2 change footprint via git status/diff (T007)"
Task: "Validate existing surveys still byte-identical (T008)"
```

---

## Implementation Strategy

### Round-2 MVP (User Story 1 Only)

1. Complete Phase 2: T003 (delta baseline recorded).
2. Complete Phase 3: User Story 1 (T005–T008).
3. **STOP and VALIDATE**: `/surveys/quick-pulse` carries one required question per
   step per the updated contract, no code changed, existing surveys unaffected.
4. Commit (T022 can be deferred to the end) — the updated survey is the round-2 MVP.

### Incremental Delivery

1. T003 → delta baseline recorded.
2. Add User Story 1 (T005–T008) → validate → **round-2 MVP** (survey updated).
3. Add User Story 2 (T009–T012) → validate → demo full completion flow.
4. Add User Story 3 (T013–T017) → validate → demo per-step enforcement.
5. Polish (T018–T022) → edge cases, final gates, README, commit. Each increment leaves
   all previous stories working.

### Parallel Team Strategy

With two reviewers/implementers:

1. One person completes T003 + US1 (T005–T008).
2. Once US1 is checkpointed:
   - Person A: US2 validation flow (T009–T012).
   - Person B: US3 validation flow (T013–T017).
3. Both feed into Polish (T018–T022), where T018+T019+T021 run in parallel.

---

## Notes

- [P] tasks = different files/concerns, no dependencies on incomplete tasks.
- [USn] labels map each task to a spec user story for traceability.
- `[X]` tasks = completed in round 1 and unchanged by round 2 (T001, T002, T004);
  do not re-run them unless their stated condition no longer holds.
- This feature is **configuration-only**: the only production file that may change in
  round 2 is `public/survey-quick-pulse.json` — any task that finds itself editing
  `src/` or the manifest has drifted and must stop.
- The fixture content is fully specified in
  `specs/007-three-step-survey/contracts/survey-json.md` (v2, updated 2026-09-11);
  implement T005 by mirroring that JSON exactly (it has already passed the app's
  schema validator).
- Commit after each task or logical group; stop at any checkpoint to validate the
  story independently.
- Avoid: partial fixture rendering, code changes, deviating from the contracted
  manifest key `quick-pulse`, or leaving `minSelections`/`maxSelections` on any
  question.
