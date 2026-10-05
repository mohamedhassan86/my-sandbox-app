# Implementation Plan: TITO Survey

**Branch**: `009-tito-survey` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/009-tito-survey/spec.md`

## Summary

Publish a new standalone survey, **"TITO Survey"** (`surveyId` `SV011`), as a validated JSON
configuration asset at `public/survey-tito.json` plus one manifest entry
(`"tito": "survey-tito.json"`) in `public/survey-manifest.json`, reachable at
`/surveys/tito`. The survey contains exactly two steps with exactly two questions each; all
four questions use closed types (1× radio, 1× dropdown, 1× radio, 1× rating) with exactly two
required questions — the first question of each step — no selection bounds, zero attachments,
and the survey's last question is a 1–5 rating with labelled ends. Delivery reuses the
existing catalog, renderer, validators, session, and submission services unchanged: **no
runtime application code is modified** and the four existing surveys are untouched
(clarified 2026-10-05: TITO subject, personal info on step 1, education info on step 2, one
required question per step = the step's first question).

One test-only file is added, `src/app/survey/tito-survey.contract.spec.ts`. It turns the
spec's structural rules and the respondent journey into an automated quality gate (spec
FR-012, SC-005; Constitution Principle IV), because the existing schema validator checks
generic fixture shape and cannot, by design, enforce "exactly 2 steps × 2 closed questions
with the rating last". The README gains the new survey URL.

## Technical Context

**Language/Version**: TypeScript ~6.0 / Angular ^22.1 codebase — this feature changes **no
runtime TypeScript**; the deliverables are a JSON configuration asset validated by the
existing typed domain model (`src/app/core/models/survey.models.ts`) and schema validator
(`src/app/core/validators/survey-config.validator.ts`), plus one Vitest spec.

**Primary Dependencies**: None new. Existing: Angular 22 (routing, standalone components),
PrimeNG ^22.1 / PrimeFlex (question rendering), Vitest ^4 + jsdom (test runner), pnpm 11. The
new spec uses only the Node built-ins already declared in `src/types/node-builtins.d.ts`
(`readFileSync`, `join`); `@types/node` is not added.

**Storage**: Static JSON assets served from `public/` (survey definition + manifest);
in-memory response state; existing local submission adapter (unchanged).

**Testing**: New `tito-survey.contract.spec.ts` (catalog integrity, structure rules with rule
self-checks, response validation, and a real `SurveySessionService` journey) plus the existing
suite as the regression gate. Gates: `pnpm test` (`ng test`, the project runner),
`pnpm exec vitest run`, `pnpm exec ng build`, `prettier --check` on touched
code/JSON/README files, and `tsc -p tsconfig.spec.json --noEmit` for the new spec. Browser
walk-through scenarios live in [quickstart.md](quickstart.md).

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged).

**Project Type**: Angular single-page web application (existing `src/` app; this feature adds
public configuration and one test file).

**Performance Goals**: No new targets; a ~2 KB static JSON load must not regress the existing
load path.

**Constraints**: No runtime code changes; no new dependencies; no changes to existing survey
fixtures or manifest entries.

**Scale/Scope**: One survey, 2 steps, 4 closed questions, 1 new manifest entry, 1 new test
file, and documentation.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                                      | Assessment                                                                                                                                                                                              |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. JSON-Driven Domain Contract                 | PASS — the survey is a JSON asset plus one catalog entry; no application code changes; the existing load/validation failure path stays user-visible.                                                    |
| II. Feature Isolation and Contracts First      | PASS — question types and validation contracts already exist; the new spec is an independent contract check, and the fixture contract is documented in [contracts/](contracts/).                        |
| III. Validation and Submission Integrity       | PASS — required answers are enforced before navigation and submission by the existing session/validator; the fixture adds no attachment surface.                                                        |
| IV. Testable Quality Gates                     | PASS — one new unit/contract spec covers the domain rules (structure, required answers, journey) plus deliberate-violation self-checks; formatting, type-check, tests, and build are run before review. |
| V. Accessible, Responsive, and Maintainable UX | PASS — the survey reuses the existing accessible radio, dropdown, and rating components; no new UI code is introduced.                                                                                  |

No violations; Complexity Tracking is not required.

## Project Structure

### Documentation (this feature)

```text
specs/009-tito-survey/
├── checklists/requirements.md
├── contracts/
│   ├── response-submission.md
│   └── survey-json.md
├── data-model.md
├── plan.md
├── quickstart.md
├── research.md
├── spec.md
└── tasks.md
```

### Source Code (repository root)

```text
public/
├── survey-manifest.json          # + one entry: "tito": "survey-tito.json"
└── survey-tito.json              # new fixture (SV011)

src/app/survey/
└── tito-survey.contract.spec.ts  # new contract check (test-only)

README.md                         # document /surveys/tito
```

**Structure Decision**: Follow the established fixture pattern (007, 008): a validated JSON
asset in `public/`, one named manifest entry resolved by `SurveyCatalogService`, and a single
test file that encodes this survey's structural rules. No `src/` runtime file changes.

## Complexity Tracking

No constitution violations; no complexity to justify.
