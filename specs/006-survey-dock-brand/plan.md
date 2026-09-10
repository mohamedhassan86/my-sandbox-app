# Implementation Plan: Survey Dock Brand (GCC Maroon · Gold · Cream)

**Branch**: `006-survey-dock-brand` (delivered on Arena working branch `arena/01a08a4f-my-sandbox-app`) | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-survey-dock-brand/spec.md` with the
visual reference `public/index.html` ("GCC Resident Insights — Survey Dock").

## Summary

Rebrand the JSON-driven survey viewer to the reference's maroon/gold/cream identity and
dock navigation layout without changing survey behavior. The work is a token delta on the
existing 004 design system (new gold/cream/red ramps, re-pointed canvas/selection/
tertiary/danger/focus roles, one new gold accent family, shell layout tokens), an
additive optional JSON extension for page chrome copy (`description`, `icon`,
`estimatedMinutes`), a restructured survey-view shell (dock sidebar with rail + drawer
modes, sticky topbar, progress card, survey-card header/footer, mobile pills, toast),
presentational completion tiles and rating readouts built by pure tested presenters, and
an extended automated contract check that merges the 004 and 006 contracts. Navigation
gating, answer preservation, validation timing, submission, and the 005 control/panel
geometry keep their contracts byte-for-byte.

## Technical Context

**Language/Version**: TypeScript 6.0 (Angular 22.1) for shell logic, presenters, and
contract checks; CSS custom properties for the brand itself

**Primary Dependencies**: Angular 22, PrimeNG 22 (re-themed by token inheritance through
the existing `--p-*` bridge — no bridge rewrite), Vitest 4 for unit + contract checks.
No new runtime dependency is added.

**Storage**: N/A (no persistence change; the reference's localStorage drafts are
explicitly out of scope — in-session preservation keeps its existing behavior)

**Testing**: Vitest unit tests for the new pure helpers (`isQuestionAnswered`,
`pageProgress`, `progressBand`, `buildCompletionTiles`, toast mappers, `ratingReadout`,
JSON-amendment validation); extended design-system contract check (merged docs coverage,
contrast delta, shell geometry); existing suites (core/survey/shared) must keep passing;
Angular production build

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged support
matrix); light theme only; fully usable offline (no CDN fonts, icons, or scripts)

**Project Type**: Angular single-page web application (existing `src/` app; brand +
chrome + navigation-layout feature)

**Performance Goals**: No new runtime target. Shell/dock transitions reuse motion tokens
(≤340 ms) and stay on `opacity`/`transform`; backdrop layers are static (no animation);
no additional network request of any kind.

**Constraints**: Survey JSON validity is backward compatible (all existing fixtures valid
unchanged); answer values, validation messages, navigation gating, and submission
payloads MUST be identical for the same inputs (FR-019); no literal color/spacing/shell
size outside the primitive layer (FR-018); WCAG 2.1 AA text contrast, 3:1 UI/focus/
selection, 44 px targets, non-color state cues, reduced-motion collapse (FR-015); no
render-blocking third-party request (FR-016); reflow 320 px → max width with no
horizontal scroll (FR-014).

**Scale/Scope**: ~8 stylesheets touched + 1 new shell stylesheet + icons extension;
token delta of ~40 new primitives/roles; 3 optional JSON fields with validator +
fixture updates; survey-view shell restructure + navigation/completion/rating
presentational inputs; ~6 pure helpers with unit tests; contract-check extension;
2 contract documents.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **JSON-Driven Domain Contract**: PASS. The JSON amendment is additive and optional
  (all existing documents valid unchanged); new fields are validated with the existing
  user-visible-error behavior; no survey change requires application-code change — the
  brand applies to every catalog survey with zero per-survey configuration.
- **Feature Isolation and Contracts First**: PASS. Token/role/shell contracts
  ([contracts/brand-delta.md](contracts/brand-delta.md),
  [contracts/shell-sizes.md](contracts/shell-sizes.md), plus the model in
  [data-model.md](data-model.md)) are defined in this plan phase, before implementation.
  Domain rules (`isQuestionAnswered`, tile/readout presenters) live in validators and
  pure modules, never in templates.
- **Validation and Submission Integrity**: PASS. Validation rules, timing, gating, and
  the submission boundary are untouched; only the _presentation_ of validation state
  (rose treatment, toast surfacing of already-computed failures) changes, and the
  submission payload is byte-identical.
- **Testable Quality Gates**: PASS. New pure helpers carry unit tests; the contract
  check is extended (merged docs, contrast delta, shell geometry); all existing tests
  must pass; formatting, type checking, and the production build gate the change.
- **Accessible, Responsive, and Maintainable UX**: PASS. This is the core of the feature:
  contrast pairs are machine-verified (research §Functional gold), focus stays visible
  (maroon), targets stay ≥44 px, states are never color-only, layouts are mobile-first,
  reduced motion collapses all new animation, and the maroon corporate language leads
  the brand. Standalone components and signals are used as today; no business logic
  enters the UI.

_Re-check after Phase 1 design_: no new violations. Two tensions are recorded, not
silently accepted (see Complexity Tracking): the additive JSON amendment against FR-017's
"shapes keep their shape" wording, and the shell stylesheet split against the component-
style budget.

## Project Structure

### Documentation (this feature)

```text
specs/006-survey-dock-brand/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── brand-delta.md       # ramps, re-pointed roles, new tokens, contrast delta, JSON amendment
│   └── shell-sizes.md       # dock/chrome geometry rules + measured values at 5 viewports
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── styles/
│   ├── tokens/
│   │   ├── primitives.css      # + gold/cream/red ramps, maroon-950, dock alphas
│   │   ├── semantic.css        # re-point canvas/selection/tertiary/danger/focus; + accent + dock roles
│   │   ├── typography.css      # + --ds-font-weight-extrabold (headings use --ds-font-text)
│   │   ├── space.css           # + dock/rail/drawer/ring/topbar/toast tokens
│   │   └── icons.css           # + star, shield-check, clipboard, chevrons, upload masks
│   ├── base/
│   │   ├── elements.css        # cream canvas + dot-pattern backdrop on body hooks
│   │   └── a11y.css            # unchanged (global reduced-motion already collapses all durations)
│   ├── components/
│   │   ├── motion.css          # + celebration ring/pulse keyframes (opacity/transform only)
│   │   ├── field.css           # selection/focus re-skin inherits tokens; option check-badge treatment
│   │   ├── progress.css        # gradient bar + ring primitives inherit tokens
│   │   ├── feedback.css        # rose error + toast treatments
│   │   └── card.css            # survey-card header gradient + footer treatments
│   ├── integrations/
│   │   └── primeng.css         # inherits rebrand via tokens; deliberate semantic-choice fixes only
│   └── compat.css              # question-block/card hooks re-skinned to the brand
├── app/
│   ├── core/
│   │   ├── models/survey.models.ts                 # + estimatedMinutes?, description?, icon? (optional)
│   │   ├── validators/survey-config.validator.ts   # + amendment validation (+ spec)
│   │   └── validators/response.validator.ts        # + isQuestionAnswered(), pageProgress() (+ spec)
│   ├── survey/
│   │   ├── survey.css                              # questions/actions re-skin (stays scoped)
│   │   ├── survey-shell.css                        # NEW: dock, rail, drawer, topbar, pills, toast, backdrop
│   │   ├── pages/survey-view/survey-view.ts        # shell restructure: dock/topbar/cards/toast, collapse signals
│   │   ├── services/survey-session.service.ts      # + answered/total computeds (no rule changes)
│   │   ├── components/survey-navigation/           # + progress input (counts + mini-bars + ring data)
│   │   ├── components/completion-summary/          # + tiles input + celebration styling
│   │   ├── components/rating-question/             # + gold selected state + readout line
│   │   └── presenters/completion-tiles.ts          # NEW: pure buildCompletionTiles() (+ spec)
│   └── shared/design-system/
│       ├── design-token.contract.ts                # + CONTRAST_PAIRS delta entries
│       └── design-token.contract.spec.ts           # merged 004+006 docs, contrast delta, shell geometry
└── public/
    ├── survey.json / survey-8-step.json            # fixtures gain descriptions/icons/estimates (optional fields)
    └── index.html                                  # reference prototype — read-only, NOT modified
```

**Structure Decision**: Extend the existing single Angular project in place. The brand
rides the established token layers (delta, not fork); shell styles split into the
existing view-scoped `survey.css` plus one new view-scoped `survey-shell.css` so each
file stays coherent and inside the component-style budget; domain rules land in
validators/presenters with unit tests; the contract check stays a single merged verdict.
`public/index.html` is the read-only reference and MUST NOT be edited by this feature.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                                                                                                                                      | Why Needed                                                                                                                                                                                                           | Simpler Alternative Rejected Because                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Additive optional JSON fields (`estimatedMinutes`, page `description`/`icon`) against FR-017's "survey definitions keep their existing shapes" | FR-005/FR-010 require per-page descriptions, page icons, and a survey time estimate, and the spec requires chrome copy to be JSON-driven, not hard-coded; the current model cannot supply any of them                | Hard-coding copy per page index violates the JSON-driven constitution principle; omitting the copy visibly breaks reference parity (FR-010). The extension is backward compatible: every previously valid document is still valid, and payloads are byte-identical |
| New view-scoped `survey-shell.css` alongside `survey.css` (two stylesheets for one view)                                                       | The dock/topbar/pills/toast/chrome styles would push the already-near-limit `survey.css` over the 16 kB `anyComponentStyle` error budget; splitting by concern keeps each file coherent and the guardrail meaningful | One growing file plus a pre-emptive budget raise burns the guardrail before it is proven necessary; moving shell styles global would leak view-scoped classes                                                                                                      |
