# Implementation Plan: Three-Step Closed-Question Survey

**Branch**: `007-three-step-survey` | **Date**: 2026-09-11 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-three-step-survey/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Publish a new standalone survey, **"Product Pulse Survey"** (`surveyId` `SV009`), as a
validated JSON configuration asset at `public/survey-quick-pulse.json` plus one manifest
entry (`"quick-pulse": "survey-quick-pulse.json"`) in `public/survey-manifest.json`,
reachable at `/surveys/quick-pulse`. The survey contains exactly three steps with
exactly three questions each; all nine questions use closed types (2× radio, 2×
checkbox, 2× dropdown, 1× rating, 1× satisfaction, 1× toggle_button) with exactly
three required questions — the first question of each step (radio on step 1, rating
  on step 2, radio on step 3) — no selection-bounds rules, and zero attachments. The delivery is configuration-only: it reuses the
existing catalog, renderer, validators, session, and submission services unchanged, so
no application code is modified and the existing surveys are untouched (clarified
2026-09-11: all closed types allowed, product-experience-pulse subject, manifest key
`quick-pulse`, one required question per step = the step's first question, no
  selection-bounds rules).

## Technical Context

**Language/Version**: TypeScript 6.0 / Angular 22.1 codebase — this feature changes
**no TypeScript code**; the deliverables are JSON configuration assets validated by the
existing typed domain model (`src/app/core/models/survey.models.ts`) and schema
validator (`src/app/core/validators/survey-config.validator.ts`).

**Primary Dependencies**: None new. Existing: Angular 22 (routing, standalone
components), PrimeNG 22 / PrimeFlex (question rendering), Vitest 4 (regression suite),
pnpm.

**Storage**: Static JSON assets served from `public/` (survey definition + manifest);
in-memory response state; existing local submission adapter (unchanged).

**Testing**: Existing Vitest suite (`pnpm exec vitest run`) and production build
(`pnpm exec ng build`) as regression gates — no application code changes, so no new
unit tests are required; the quickstart document defines manual/config validation
scenarios for the new survey.

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged).

**Project Type**: Angular single-page web application (existing `src/` app; this
feature adds only public configuration).

**Performance Goals**: No new targets; a ~3 KB static JSON load must not regress the
existing survey load behavior; completion estimate displayed as 3 minutes (validated
range 1–120, spec SC-003 requires ≤5).

**Constraints**: Zero changes to `src/` (Constitution Principle I); the fixture MUST
pass the existing schema validator (unique page/question IDs, unique option values,
`attachmentsRequired` 0–3, icon keys 1–32 chars, `estimatedMinutes` 1–120, page
description 1–280 chars); the manifest key `quick-pulse` MUST NOT collide with the
existing keys `customer-feedback` or `extended-feedback`.

**Scale/Scope**: 1 new survey file + 1 manifest entry; 9 questions (3 pages × 3);
static option lists of 3–5 entries per question; no new services, routes, or
components.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **JSON-Driven Domain Contract**: PASS. The feature is a validated JSON asset plus a
  manifest entry; adding the survey requires no application code changes, and the
  existing validator rejects any malformed fixture before rendering.
* **Feature Isolation and Contracts First**: PASS. No new question types, components,
  or services are introduced; the feature is consumed entirely through the existing
  `Survey`/`SurveyPage`/`Question`/`Answer` contracts, documented first in
  `contracts/` before the fixture is authored.
* **Validation and Submission Integrity**: PASS. Required-answer validation for the
  fixture's questions (one per step) is enforced by the existing
  `survey-config.validator.ts` (schema) and `response.validator.ts` (navigation and
  submission) without modification.
* **Testable Quality Gates**: PASS. The existing unit-test suite and production build
  act as regression gates and MUST pass; the quickstart defines explicit validation
  scenarios (structure, required enforcement, optional skip, regression of existing
  surveys) with expected outcomes.
* **Accessible, Responsive, and Maintainable UX**: PASS. The survey renders through
  the existing accessible, responsive question components (radio/checkbox/dropdown/
  rating/satisfaction/toggle) with the established maroon design language; no new UI
  surfaces or logic are added.

*Re-checked 2026-09-11 after the per-step required clarifications (one required
question per step = its first question; no selection-bounds rules): all principles
still PASS.*

## Project Structure

### Documentation (this feature)

```text
specs/007-three-step-survey/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── survey-json.md       # full fixture contract (shape + structural rules)
│   └── response-submission.md  # per-question answer shapes for this survey
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
public/
├── survey-quick-pulse.json     # NEW: SV009 fixture (3 pages × 3 closed questions)
└── survey-manifest.json        # AMENDED: add one entry "quick-pulse" → fixture

src/                            # UNCHANGED — no application code modifications
└── (catalog, config service, validators, renderer, pages, styles)
```

**Structure Decision**: Configuration-only delivery inside the existing single
Angular project. The new survey lives beside the existing fixtures in `public/`
(`survey.json`, `survey-8-step.json`) and is exposed through the existing
`/surveys/:surveyKey` route via the manifest — the documented extension pattern from
`001-survey-management`, so no new project, package, directory, or code path is
introduced.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | A configuration-only survey addition is the minimal solution and satisfies the full feature scope. |
