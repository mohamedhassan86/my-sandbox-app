# Implementation Plan: Dynamic Survey Management and Response Collection

**Branch**: `001-survey-management` | **Date**: 2026-09-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-survey-management/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Build a responsive survey viewer that loads validated JSON definitions, renders ordered
pages and supported question types, preserves answers during navigation, validates all
requirements, and submits responses with attachments. The implementation will use the
existing Angular application, standalone feature components, typed domain models,
services for configuration and submission, and PrimeNG controls styled with the
approved maroon visual language. The UX implementation must also use
`public/theme-preview.png` as the visual reference for the respondent experience. After
successful submission, the flow ends with a concise completion summary showing the
respondent's completion percentage and a clear success message.
The final page uses the same navigation action for submission: the Next button changes
to Submit response on the last page, and no separate submit button is shown. The
completion summary keeps a minimum height comparable to the tallest multi-input page.
After successful submission, the survey steps header remains displayed for context, but
all step buttons are disabled and cannot navigate or change the completed response.

Survey variants must be selected through named, allowlisted routes rather than exposing
fixture filenames in query parameters. The default survey is available at `/`, while
the independent extended fixture is exposed through `/surveys/extended-feedback`.

### UX Reference: `public/theme-preview.png`

The reference establishes a focused survey panel on a soft pink page backdrop. The
experience should use a centered white surface with generous spacing, large dark
display typography, rounded controls, and clear vertical grouping between questions.
Interactive states should use a vivid blue selection color for rating tiles, radio
controls, and satisfaction choices, with neutral gray controls for unselected states.
The survey should support three reference patterns where the configured question type
allows them: 1-10 rating tiles with endpoint labels, compact radio/checkbox choices,
and icon or emoji-based satisfaction options with text labels. The existing product
maroon remains the documented brand color for shared errors, navigation, and supporting
accents; the blue selection state is reserved for active respondent choices.

### Form and Layout Decision

Use a small local set of Bootstrap-compatible form and layout conventions for every
question type: `container`, `row`, `col-12`, `form-group`, `form-label`, `form-control`,
`form-check`, and `form-check-input`. These conventions are implemented in the existing
global stylesheet and component templates; Bootstrap itself is not added as a second
component framework because PrimeNG and PrimeFlex are already project dependencies.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 6.0 with Angular 22.1

**Primary Dependencies**: Angular 22, RxJS 7.8, PrimeNG, PrimeFlex, Vitest; Bootstrap-compatible form and layout conventions implemented in the local design tokens

**Storage**: In-memory response state; configured JSON source; submission service boundary

**Testing**: Vitest unit and integration tests; Angular production build; accessibility
checks; responsive visual smoke checks against `public/theme-preview.png`

**Target Platform**: Modern desktop, tablet, and mobile browsers

**Project Type**: Angular single-page web application

**Survey Routing**: Named Angular routes mapped to an allowlisted survey catalog; route
keys never become arbitrary file paths.

**Performance Goals**: First page within 2 seconds; loaded-page navigation within 500 ms

**Constraints**: JSON must be rejected before partial rendering; all pages revalidated on
  submit; files restricted by count, type, and size; no secrets in client assets

**Scale/Scope**: One survey session; target definitions up to 100 pages and 500 questions

**Implementation Status**: Reference-driven question types, shared UX tokens, responsive
panel styling, Bootstrap-compatible form markup, and documentation are implemented.
Remaining work includes browser-level responsive, keyboard, and visual smoke validation.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **JSON-Driven Domain Contract**: PASS. Models, validation, and configuration contracts
  are defined before UI implementation.
* **Feature Isolation and Contracts First**: PASS. Question renderers, validators, and
  submission handling are separated behind explicit contracts.
* **Validation and Submission Integrity**: PASS. Page and final-submit validation are
  required, including attachment rules and failure-state preservation.
* **Testable Quality Gates**: PASS. Unit, integration, accessibility, and production
  build checks are included in the plan.
* **Accessible, Responsive, and Maintainable UX**: PASS. Responsive layouts, keyboard
  access, labels, feedback, and contrast are acceptance requirements.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   ├── services/
│   │   └── validators/
│   ├── shared/
│   │   └── components/
│   └── survey/
│       ├── components/
│       ├── pages/
│       └── services/
├── assets/
│   └── survey.json
└── styles.css

tests/
├── integration/
└── unit/
```

**Structure Decision**: Use the existing Angular `src/` application as a single web
project. Place reusable domain models, configuration, validation, and submission
services under `src/app/core`; place survey page and question rendering under
`src/app/survey`; keep static sample configuration under `public/` or `src/assets/`.
Tests remain colocated with components and services, with integration coverage under
the survey feature test surface.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | The single Angular project and explicit service contracts satisfy the feature scope. |
