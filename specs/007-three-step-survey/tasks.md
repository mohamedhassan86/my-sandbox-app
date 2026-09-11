# Tasks: Three-Step Closed-Question Survey

**Input**: Design documents from `/specs/007-three-step-survey/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`,
`contracts/`, `quickstart.md`

**Tests**: No new test tasks — this feature is configuration-only (no application
code changes), so the constitution's test obligation applies to the unchanged existing
suite. Validation is performed through the existing test suite, the production build,
and the runnable scenarios in `quickstart.md` referenced per task.

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

- [ ] T001 Ensure workspace dependencies are installed: run `pnpm install` at the repository root (against `package.json` / `pnpm-lock.yaml`) if `node_modules/` is missing or stale

**Checkpoint**: `pnpm exec ng build` tooling is available; the working tree is clean before the feature changes begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Record a clean pre-change baseline so the "no code changes / existing
surveys unaffected" claims (spec FR-011, SC-001, SC-005) are provable.

- [ ] T002 Run the pre-change regression gates at the repository root: `pnpm exec vitest run` and `pnpm exec ng build` (package.json scripts) — both MUST pass before touching `public/`; note the results for comparison in T019

**Checkpoint**: Baseline green — user story work can now begin.

---

## Phase 3: User Story 1 - A new compact survey is added without code changes (Priority: P1) 🎯 MVP

**Goal**: Publish the "Product Pulse Survey" (`SV009`) as a validated configuration
asset plus one manifest entry, reachable at `/surveys/quick-pulse`, with zero
application code changes and the existing surveys untouched.

**Independent Test**: Open `http://localhost:4200/surveys/quick-pulse` and verify it
renders exactly three steps with three questions per step and no configuration errors;
`git status --short` shows only `public/` changes; `/` and
`/surveys/extended-feedback` still render unchanged.

### Implementation for User Story 1

- [ ] T003 [US1] Author the fixture `public/survey-quick-pulse.json` with the complete JSON from `specs/007-three-step-survey/contracts/survey-json.md`: `surveyId` `SV009`, title "Product Pulse Survey", `version` `1.0`, `estimatedMinutes: 3`, pages `S1`/`S2`/`S3` with titles "How You Use"/"Your Experience"/"Next Steps", icons `laptop-file`/`star`/`shield-check`, and exactly the nine closed questions `S1Q1`…`S3Q3` with `required: true` only on `S1Q1` (radio), `S1Q2` (checkbox, `minSelections: 1`), `S1Q3` (dropdown) and `attachmentsRequired: 0` everywhere
- [ ] T004 [US1] Add the single entry `"quick-pulse": "survey-quick-pulse.json"` to `public/survey-manifest.json`, keeping the existing `customer-feedback` and `extended-feedback` entries byte-for-byte unchanged and the new key distinct from both
- [ ] T005 [US1] Validate schema acceptance and rendering: start the dev server (`pnpm start`), open `http://localhost:4200/surveys/quick-pulse`, and confirm no configuration error, exactly 3 steps × 3 questions, the 3-minute estimate in the dock/topbar, and the laptop/star/shield step icons rendering (not the fallback clipboard) per `specs/007-three-step-survey/quickstart.md` §3
- [ ] T006 [US1] Validate the change footprint: run `git status --short` at the repository root and confirm the production diff is exactly `public/survey-quick-pulse.json` (new) plus `public/survey-manifest.json` (one entry) with zero files under `src/` modified (spec FR-001, SC-001; `specs/007-three-step-survey/quickstart.md` §1)
- [ ] T007 [P] [US1] Validate existing surveys are unchanged: with the dev server running, confirm `http://localhost:4200/` (default "Customer Feedback Survey") and `http://localhost:4200/surveys/extended-feedback` render identically to the T002 baseline (spec FR-011, US1 scenario 2; `specs/007-three-step-survey/quickstart.md` §7)

**Checkpoint**: User Story 1 fully functional and independently testable — the survey
is published, loads, and passes the no-code-change and no-regression checks. **This is
the MVP.**

---

## Phase 4: User Story 2 - A respondent completes the 3-step survey end to end (Priority: P1)

**Goal**: The full respondent journey works on the new survey: answering all nine
closed questions, live progress, answer preservation, submission, and the completion
summary.

**Independent Test**: With the US1 fixture live, complete a full response using only
selection controls, submit, and confirm the completion summary shows 3/3 answered on
all three step tiles; a new response starts clean.

### Implementation for User Story 2

- [ ] T008 [US2] Exercise the full completion flow in `http://localhost:4200/surveys/quick-pulse`: answer all nine questions using only selection controls (radio `S1Q1`, checkbox `S1Q2`, dropdown `S1Q3`, rating `S2Q1`, satisfaction `S2Q2`, checkbox `S2Q3`, radio `S3Q1`, toggle `S3Q2`, dropdown `S3Q3`) and submit; confirm the completion summary shows 3/3 answered on every step tile and that starting a new response resets to an unanswered state (US2 scenario 3; `specs/007-three-step-survey/quickstart.md` §6)
- [ ] T009 [US2] Validate answer preservation and live progress: navigate back and forth across the three steps and confirm previously given answers are preserved and displayed on return while step buttons, progress ring, and answered counts update live (US2 scenarios 1–2; `specs/007-three-step-survey/quickstart.md` §6)
- [ ] T010 [US2] Validate closed-interface behavior: confirm no question renders a free-text field or file upload anywhere in the survey; confirm a checkbox question records every selected option; confirm radio/dropdown selections replace the previously recorded value with exactly one value held (US2 scenarios 4–6; spec FR-003, FR-007; `specs/007-three-step-survey/quickstart.md` §3)
- [ ] T011 [US2] Validate the submitted response shape via devtools (or the local submission adapter): confirm per-question value domains match `specs/007-three-step-survey/contracts/response-submission.md` — string from the option set for `S1Q1`/`S1Q3`/`S2Q2`/`S3Q1`/`S3Q3`, string array for `S1Q2`/`S2Q3`, numeric string `"1"`–`"10"` for `S2Q1`, boolean for `S3Q2`, and an empty attachments list (spec FR-010)

**Checkpoint**: User Stories 1 AND 2 both work independently — the complete
respondent journey is verified.

---

## Phase 5: User Story 3 - Required closed answers are enforced (Priority: P2)

**Goal**: Required questions (`S1Q1`, `S1Q2`, `S1Q3`) block navigation and submission
with visible, question-specific feedback; optional questions can be skipped and are
recorded as absent/null.

**Independent Test**: With the US1 fixture live, attempt to leave step 1 with nothing
answered (blocked with three visible errors), then submit with only the three
required questions answered (succeeds with optional answers absent/null).

### Implementation for User Story 3

- [ ] T012 [US3] Validate required-blocking on step 1: from a fresh load of `http://localhost:4200/surveys/quick-pulse`, leave step 1 completely unanswered and attempt to continue; confirm navigation is blocked and visible validation messages identify `S1Q1` (radio), `S1Q2` (checkbox), and `S1Q3` (dropdown) (US3 scenario 1; `specs/007-three-step-survey/quickstart.md` §4)
- [ ] T013 [US3] Validate re-clearing enforcement: after answering `S1Q2`, deselect all of its options and attempt to leave the step; confirm the checkbox validation error (required + `minSelections: 1`) reappears (US3 scenario 2; `specs/007-three-step-survey/quickstart.md` §4)
- [ ] T014 [US3] Validate optional-skip submission: start a new response, answer only the three required questions (`S1Q1`, `S1Q2`, `S1Q3`), and submit; confirm submission succeeds, the response contains the three required answers with optional questions absent/`null`, and the completion summary shows 3/3, 0/3, 0/3 step tiles (US3 scenario 4; spec FR-009; `specs/007-three-step-survey/quickstart.md` §5)
- [ ] T015 [US3] Validate optional-dropdown clearing: on `S3Q3` select an option, then clear it; confirm the control returns to its empty state and the question counts as unanswered (no value recorded) (US3 scenario 2; `specs/007-three-step-survey/quickstart.md` §5)
- [ ] T016 [US3] Validate submission-blocking on the final step: from a new response with the required questions unanswered, reach step 3 and attempt to submit; confirm submission is blocked with visible validation feedback and all previously entered answers are preserved (US3 scenario 5; `specs/007-three-step-survey/quickstart.md` §4)

**Checkpoint**: All three user stories independently functional — the survey is
published, fully completable, and validation behaves per spec.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Prove the negative/edge paths, re-run the quality gates, and document the
feature per repository conventions.

- [ ] T017 [P] Validate configuration rejection paths: apply each mutation to `public/survey-quick-pulse.json` in turn — duplicate an option `value`, set one question's `options` to `[]`, add a fourth question to any page, add a `textbox` question, set `estimatedMinutes: 0` — reload `/surveys/quick-pulse` each time and confirm a user-visible configuration error with no partial rendering, then revert to the contract fixture (spec edge cases; Constitution Principle I; `specs/007-three-step-survey/quickstart.md` §8)
- [ ] T018 [P] Validate the unknown-survey error path: confirm `http://localhost:4200/surveys/does-not-exist` shows the existing unknown-survey error state unchanged by this feature (spec edge cases; `specs/007-three-step-survey/quickstart.md` §7)
- [ ] T019 Run the post-change regression gates at the repository root: `pnpm exec vitest run` and `pnpm exec ng build` (package.json scripts) — both MUST pass and match the T002 baseline behavior (spec SC-005; Constitution Principle IV)
- [ ] T020 [P] Document the new survey in `README.md` following the existing extended-survey paragraph: three steps, three closed questions per step (radio/checkbox/dropdown/rating/satisfaction/toggle), reachable at `http://localhost:4200/surveys/quick-pulse` via the `quick-pulse` manifest key
- [ ] T021 Commit the feature on the working branch: stage `public/survey-quick-pulse.json`, `public/survey-manifest.json`, `README.md`, and `specs/007-three-step-survey/`; write a commit message describing the configuration change (new survey asset + manifest entry, no code changes) and listing the verification commands used, per the constitution's pull-request guidance

**Checkpoint**: Feature complete — all quickstart scenarios pass, gates green,
documented, and committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup — blocks all user stories (baseline
  must be recorded before changes).
- **User Story 1 (Phase 3)**: Depends on Foundational — produces the live fixture that
  US2 and US3 both consume.
- **User Story 2 (Phase 4)**: Depends on US1 (fixture live).
- **User Story 3 (Phase 5)**: Depends on US1 (fixture live); independent of US2.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2; no dependencies on other stories.
- **US2 (P1)**: Start after US1's fixture tasks (T003–T005); independently testable.
- **US3 (P2)**: Start after US1's fixture tasks (T003–T005); independently testable
  in parallel with US2.

### Within Each User Story

- Fixture (T003) before manifest (T004) before validation (T005–T007).
- US2/US3 validation tasks are independent of each other once the fixture is live.
- T017 (edge mutations) MUST be reverted before T019 (final gates) run.

### Parallel Opportunities

- **T007** (existing-survey regression) can run alongside T005/T006 on the same dev
  server — different pages, no shared state.
- **US2 and US3** can be validated in parallel by two reviewers after US1 completes
  (different respondent flows over the same live fixture).
- **T017 and T018** can run in parallel (configuration mutations vs. unknown-survey
  URL), and **T020** (README) can proceed in parallel with T017/T018/T019.

---

## Parallel Example: User Story 1

```bash
# After T003–T005 complete, these two can run concurrently:
Task: "Validate change footprint via git status (T006)"
Task: "Validate existing surveys unchanged at / and /surveys/extended-feedback (T007)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002) — baseline green.
3. Complete Phase 3: User Story 1 (T003–T007).
4. **STOP and VALIDATE**: `/surveys/quick-pulse` loads with 3×3 closed questions, no
   code changed, existing surveys unaffected.
5. Demo/deploy if ready — the published survey is the MVP.

### Incremental Delivery

1. Setup + Foundational → baseline recorded.
2. Add User Story 1 → validate → **MVP** (survey published).
3. Add User Story 2 → validate → demo full completion flow.
4. Add User Story 3 → validate → demo enforcement behavior.
5. Polish → edge cases, final gates, README, commit. Each increment leaves all
   previous stories working.

### Parallel Team Strategy

With two reviewers/implementers:

1. One person completes Setup + Foundational + US1 (T001–T007).
2. Once US1 is checkpointed:
   - Person A: US2 validation flow (T008–T011).
   - Person B: US3 validation flow (T012–T016).
3. Both feed into Polish (T017–T021), where T017+T018+T020 run in parallel.

---

## Notes

- [P] tasks = different files/concerns, no dependencies on incomplete tasks.
- [USn] labels map each task to a spec user story for traceability.
- This feature is **configuration-only**: the only production files are
  `public/survey-quick-pulse.json` (new) and `public/survey-manifest.json` (one
  entry) — any task that finds itself editing `src/` has drifted and must stop.
- The fixture content is fully specified in
  `specs/007-three-step-survey/contracts/survey-json.md`; implement T003 by mirroring
  that JSON exactly (it has already passed the app's schema validator).
- Commit after each task or logical group; stop at any checkpoint to validate the
  story independently.
- Avoid: partial fixture rendering, code changes, deviating from the contracted
  manifest key `quick-pulse`.
