# Implementation Plan: Two-Step Event Feedback Survey

**Branch**: `008-two-step-event-survey` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-two-step-event-survey/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Publish a new standalone survey, **"Event Feedback Survey"** (`surveyId` `SV010`), as a
validated JSON configuration asset at `public/survey-event-feedback.json` plus one
manifest entry (`"event-feedback": "survey-event-feedback.json"`) in
`public/survey-manifest.json`, reachable at `/surveys/event-feedback`. The survey
contains exactly two steps with exactly three questions each; all six questions use
closed types (1× radio, 1× checkbox, 1× dropdown, 1× rating, 1× satisfaction, 1×
toggle_button) with exactly two required questions — the first question of each step
(radio on step 1, rating on step 2) — no selection-bounds rules, and zero attachments.
Delivery reuses the existing catalog, renderer, validators, session, and submission
services unchanged: **no runtime application code is modified** and the three existing
surveys are untouched (clarified 2026-10-02: event-feedback subject, one required
question per step = the step's first question, varied closed-type mix with radio,
checkbox, and dropdown each present).

One test-only file is added, `src/app/survey/survey-fixtures.contract.spec.ts`. It turns
the spec's structural rules and the respondent journey into an automated quality gate
(spec FR-013, SC-006; Constitution Principle IV), because the existing schema validator
checks generic fixture shape and cannot, by design, enforce "exactly 2 steps × 3 closed
questions with one required question per step". The README gains the new survey URL and
the missing planning-artifact links.

## Technical Context

**Language/Version**: TypeScript ~6.0 / Angular ^22.1 codebase — this feature changes
**no runtime TypeScript**; the deliverables are a JSON configuration asset validated by
the existing typed domain model (`src/app/core/models/survey.models.ts`) and schema
validator (`src/app/core/validators/survey-config.validator.ts`), plus one Vitest spec.

**Primary Dependencies**: None new. Existing: Angular 22 (routing, standalone
components), PrimeNG ^22.1 / PrimeFlex (question rendering), Vitest ^4 + jsdom (test
runner), pnpm 11. The new spec uses only the Node built-ins already declared in
`src/types/node-builtins.d.ts` (`readFileSync`, `join`); `@types/node` is not added.

**Storage**: Static JSON assets served from `public/` (survey definition + manifest);
in-memory response state; existing local submission adapter (unchanged).

**Testing**: New `survey-fixtures.contract.spec.ts` (catalog integrity, structure rules
with rule self-checks, response validation, and a real `SurveySessionService` journey)
plus the existing suite as the regression gate. Gates: `pnpm test` (`ng test`, the
project runner), `pnpm exec vitest run` (raw runner; its pre-existing `app.spec.ts`
JIT-loader failure is unchanged), `pnpm exec ng build`, `prettier --check` on touched
code/JSON/README files, and `tsc -p tsconfig.spec.json --noEmit` for the new spec. Browser walk-through
scenarios live in [quickstart.md](quickstart.md).

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged).

**Project Type**: Angular single-page web application (existing `src/` app; this
feature adds public configuration and one test file).

**Performance Goals**: No new targets; a ~4 KB static JSON load must not regress the
existing survey load behavior; completion estimate displayed as 2 minutes (validated
range 1–120; spec SC-003 requires ≤3).

**Constraints**:

- No non-spec file under `src/` is added or modified (Constitution Principle I).
- The fixture MUST pass the existing schema validator (unique page/question IDs,
  unique option values, `attachmentsRequired` 0–3, icon keys 1–32 chars,
  `estimatedMinutes` 1–120, page description 1–280 chars).
- The manifest key `event-feedback` MUST NOT collide with `customer-feedback`,
  `extended-feedback`, or `quick-pulse`, and `SV010` MUST NOT collide with `SV001`,
  `SV008`, or `SV009`.
- The existing fixtures (`survey.json`, `survey-8-step.json`, `survey-quick-pulse.json`)
  stay byte-identical.

**Scale/Scope**: 1 new survey file + 1 manifest entry + 1 new spec file + README edits;
6 questions (2 pages × 3); static option lists of 3–5 entries; no new services, routes,
or components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **JSON-Driven Domain Contract (I)**: PASS. The feature is a validated JSON asset plus
  a manifest entry; adding the survey requires no application code changes, and the
  existing validator rejects any malformed fixture before rendering. The only `src/`
  addition is a test file, which the survey does not depend on at runtime.
* **Feature Isolation and Contracts First (II)**: PASS. No new question types,
  components, or services are introduced; the survey is consumed entirely through the
  existing `Survey`/`SurveyPage`/`Question`/`Answer` contracts, documented first in
  `contracts/` before the fixture is authored. Structure rules live in the contract
  spec, not in templates or components.
* **Validation and Submission Integrity (III)**: PASS. Required-answer validation for
  `S1Q1` and `S2Q1` is enforced before navigation and again before submission by the
  existing `response.validator.ts` and `SurveySessionService`, unchanged; the new spec
  asserts this against the shipped fixture.
* **Testable Quality Gates (IV)**: PASS. Unlike a purely declarative change, this plan
  adds tests for the feature's domain rules (structure, required distribution,
  response shapes, session journey), and the existing suite, formatting check, type
  check, and production build run as gates. **Coverage**: no maintained application
  code is added or changed, so the 80% target is unaffected and no exception rationale
  is needed. Integration scope note: fixture-level integration (JSON parsing →
  validation → session → completion summary) is covered by the new spec; rendering is
  covered by the existing component specs plus the quickstart browser walk-through.
* **Accessible, Responsive, and Maintainable UX (V)**: PASS. The survey renders
  through the existing accessible, responsive question components
  (radio/checkbox/dropdown/rating/satisfaction/toggle) with the established maroon
  design language; no new UI surfaces or logic are added.
* **Development Workflow**: PASS. Work proceeds specify → clarify (2026-10-02, three
  questions answered by the user) → plan → tasks → analyze → implement → verify. Each
  task in [tasks.md](tasks.md) names its affected contract, validation behavior, tests,
  and acceptance evidence. The final change description lists the configuration change
  (new fixture + manifest key) and the verification commands.

*Re-checked 2026-10-02 after Phase 1 design (data model, contracts, quickstart): all
principles still PASS; Complexity Tracking stays empty.*

## Project Structure

### Documentation (this feature)

```text
specs/008-two-step-event-survey/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── survey-json.md       # full fixture contract (shape + structural rules)
│   └── response-submission.md  # per-question answer shapes for this survey
├── checklists/
│   └── requirements.md      # spec quality checklist (/speckit-specify output)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
public/
├── survey-event-feedback.json  # NEW: SV010 fixture (2 pages × 3 closed questions)
└── survey-manifest.json        # AMENDED: add one entry "event-feedback" → fixture

src/
└── app/survey/
    └── survey-fixtures.contract.spec.ts  # NEW (test only): catalog + structure + journey checks
                                          # everything else under src/ is UNCHANGED

README.md                       # AMENDED: document /surveys/event-feedback; list 007 and 008
```

**Structure Decision**: Configuration-first delivery inside the existing single
Angular project. The new survey lives beside the existing fixtures in `public/`
(`survey.json`, `survey-8-step.json`, `survey-quick-pulse.json`) and is exposed through
the existing `/surveys/:surveyKey` route via the manifest — the documented extension
pattern from `001-survey-management`, so no new project, package, directory, or runtime
code path is introduced. The one added spec sits with the other survey-domain specs in
`src/app/survey/` because it exercises the session service and completion presenter
that live there (core validators are consumed, never modified).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | A configuration-only survey addition plus a single contract spec is the minimal solution that satisfies the full feature scope and the constitution's test obligation. |
