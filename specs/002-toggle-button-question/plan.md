# Implementation Plan: Toggle Button Question Type

**Branch**: `002-toggle-button-question` | **Date**: 2026-09-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-toggle-button-question/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a `toggle_button` boolean question type to the existing JSON-driven survey domain
model. The type is added alongside the existing `radio`, `checkbox`, `textbox`,
`textarea`, `rating`, and `satisfaction` types without changing their behavior. The
shared answer value domain is widened to accept a native `boolean` (per clarification),
schema validation gains rules for the new type's fields (`defaultValue`,
`options.onLabel`/`offLabel`), a standalone `ToggleButtonQuestionComponent` renders the
control using PrimeNG's `ToggleButton` (`p-togglebutton`) component — bound directly to
`onLabel`/`offLabel` and the boolean value — rather than a hand-built native control,
the response validator accepts only booleans for this type, and the
response-submission and completion-summary paths already operate generically on
`Answer[]` and require no type-specific branching beyond what schema/UI/validator
changes provide.

## Technical Context

**Language/Version**: TypeScript 6.0 with Angular 22.1

**Primary Dependencies**: Angular 22, RxJS 7.8, PrimeNG, PrimeFlex, Vitest; the toggle
control uses PrimeNG's `ToggleButton` component (`primeng/togglebutton`,
`p-togglebutton`) directly, rather than the plain-HTML Bootstrap-compatible form
conventions used by the other question renderers

**Storage**: In-memory response state; configured JSON source; submission service
boundary (unchanged from the existing survey feature)

**Testing**: Vitest unit tests for the schema validator, response validator, and the
new component; existing integration coverage in `question-renderer.spec.ts` and
`survey-page` tests extended for the new type; Angular production build

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged)

**Project Type**: Angular single-page web application (existing `src/` app; this
feature extends it, no new project)

**Performance Goals**: No new performance targets; must not regress existing survey
load/navigation targets (first page within 2 seconds; navigation within 500 ms)

**Constraints**: Widening the shared answer value type MUST remain backward compatible
with all existing question types; the JSON schema field for the question identifier
MUST stay `questionId` (existing convention) rather than the literal `id` field name
used in the illustrative request; unknown/invalid `toggle_button` definitions MUST be
rejected before any partial rendering, consistent with the JSON-Driven Domain Contract
principle

**Scale/Scope**: Single new question type added to the existing question type set; no
change to survey/page/response scale assumptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **JSON-Driven Domain Contract**: PASS. The new type is defined entirely through the
  typed domain model and schema validator; adding a `toggle_button` question to a
  survey's JSON requires no application code changes.
* **Feature Isolation and Contracts First**: PASS. The toggle control is an
  independent standalone component behind the same `Question`/`Answer` contracts used
  by existing question types; model and validator changes precede the component
  implementation.
* **Validation and Submission Integrity**: PASS. Required/boolean-type validation is
  enforced by `response.validator.ts` before page navigation and before submission,
  matching the existing validation boundary.
* **Testable Quality Gates**: PASS. Unit tests cover the schema validator, response
  validator, and new component; existing renderer/integration tests are extended.
* **Accessible, Responsive, and Maintainable UX**: PASS. PrimeNG's `ToggleButton`
  provides built-in keyboard operability (Space/Enter), focus styling, and ARIA
  switch semantics; the component still surfaces the question label/required marker
  and description text consistent with other question renderers.

## Project Structure

### Documentation (this feature)

```text
specs/002-toggle-button-question/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── survey.models.ts        # add ToggleButtonQuestion + QuestionType union entry
│   │   │   └── response.models.ts      # widen Answer.value to include boolean
│   │   ├── services/                   # unchanged; already generic over Answer[]
│   │   └── validators/
│   │       ├── survey-config.validator.ts   # add toggle_button schema rules
│   │       └── response.validator.ts        # add boolean-only rule for toggle_button
│   └── survey/
│       ├── components/
│       │   ├── toggle-button-question/       # standalone component wrapping PrimeNG ToggleButton
│       │   │   └── toggle-button-question.ts
│       │   └── question-renderer/
│       │       └── question-renderer.ts      # add @case ('toggle_button')
│       └── pages/
│           └── survey-page/survey-page.ts    # extend answer value typing/helpers
└── (public/survey*.json fixtures optionally extended with a toggle_button example)
```

**Structure Decision**: Extend the existing single Angular project (`src/app/core` for
domain models/validators, `src/app/survey/components` for rendering). No new project,
package, or top-level directory is introduced; this feature is additive within the
established `001-survey-management` structure.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | Adding one question type behind existing contracts satisfies the feature scope. |
