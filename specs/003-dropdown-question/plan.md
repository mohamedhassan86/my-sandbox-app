# Implementation Plan: Dropdown Question Type

**Branch**: `003-dropdown-question` | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-dropdown-question/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Add a `dropdown` single-select question type to the existing JSON-driven survey domain
model. The type is added alongside the existing `radio`, `checkbox`, `textbox`,
`textarea`, `rating`, `satisfaction`, and `toggle_button` types without changing their
behavior. Dropdown questions reuse the shared `Option` (`{ label, value }`) contract and
the existing string answer value (no `Answer.value` widening needed); schema validation
reuses the selectable-options rules; a standalone `DropdownQuestionComponent` renders the
control using PrimeNG's `Select` (`p-select`) component with built-in filtering
(`[filter]`) and a clear affordance for optional questions (`[showClear]`), with no
placeholder text per clarification; and the response validator accepts only strings
exactly matching a predefined option value.

## Technical Context

**Language/Version**: TypeScript 6.0 with Angular 22.1

**Primary Dependencies**: Angular 22, RxJS 7.8, PrimeNG (`Select` from `primeng/select`,
`p-select`), PrimeFlex, Vitest; `FormsModule` for the `ngModel` binding (already used by
the toggle feature)

**Storage**: In-memory response state; configured JSON source; submission service
boundary (unchanged from the existing survey feature)

**Testing**: Vitest unit tests for the schema validator, response validator, and the new
component (pure static helpers, per the project's no-TestBed unit-test convention);
existing `question-renderer.spec.ts` mapping coverage extended for the new type; Angular
production build

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged)

**Project Type**: Angular single-page web application (existing `src/` app; this feature
extends it, no new project)

**Performance Goals**: No new performance targets; must not regress existing survey
load/navigation targets (first page within 2 seconds; navigation within 500 ms).
Filtering is client-side over the static option list.

**Constraints**: Reusing the shared `Option` contract and string answer value MUST NOT
alter the behavior of existing question types (notably `radio`, which keeps its current
validation strictness); unknown/invalid `dropdown` definitions MUST be rejected before
any partial rendering, consistent with the JSON-Driven Domain Contract principle; the
schema carries no `defaultValue` or `placeholder` fields (clarified 2026-09-10)

**Scale/Scope**: Single new question type added to the existing question type set; static
option lists of 100+ entries must remain usable (scrollable + filterable); no change to
survey/page/response scale assumptions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **JSON-Driven Domain Contract**: PASS. The new type is defined entirely through the
  typed domain model and schema validator; adding a `dropdown` question to a survey's
  JSON requires no application code changes.
* **Feature Isolation and Contracts First**: PASS. The dropdown control is an independent
  standalone component behind the same `Question`/`Answer` contracts used by existing
  question types; model and validator changes precede the component implementation.
* **Validation and Submission Integrity**: PASS. Required-selection and string-in-options
  validation is enforced by `response.validator.ts` before page navigation and before
  submission, matching the existing validation boundary.
* **Testable Quality Gates**: PASS. Unit tests cover the schema validator, response
  validator, and new component; existing renderer/integration tests are extended.
* **Accessible, Responsive, and Maintainable UX**: PASS. PrimeNG's `Select` provides
  built-in keyboard operability, focus styling, and ARIA listbox semantics; the component
  still surfaces the question label/required marker consistent with other question
  renderers, and renders blank (no placeholder) per clarification.

## Project Structure

### Documentation (this feature)

```text
specs/003-dropdown-question/
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
│   │   │   ├── survey.models.ts        # add DropdownQuestion + QuestionType union entry
│   │   │   └── response.models.ts      # unchanged; string answer value already supported
│   │   ├── services/                   # unchanged; already generic over Answer[]
│   │   └── validators/
│   │       ├── survey-config.validator.ts   # add dropdown to selectable-options rules
│   │       └── response.validator.ts        # add string-in-options check for dropdown
│   └── survey/
│       ├── components/
│       │   ├── dropdown-question/            # standalone component wrapping PrimeNG Select (p-select) with filter + conditional showClear
│       │   │   └── dropdown-question.ts
│       │   └── question-renderer/
│       │       └── question-renderer.ts      # add @case ('dropdown') + componentFor entry
│       └── pages/                          # unchanged; answerFor/isAnsweredValue already handle strings and null
└── (public/survey*.json fixtures optionally extended with a dropdown example)
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
