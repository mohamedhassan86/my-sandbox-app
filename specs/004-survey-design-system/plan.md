# Implementation Plan: Survey Design System

**Branch**: `004-survey-design-system` (delivered on Arena working branch `arena/01a089d5-my-sandbox-app`) | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-survey-design-system/spec.md`

## Summary

Introduce a token-driven CSS design system for the JSON-driven survey viewer: a raw
primitive palette, semantic color/typography/space/radius/elevation/motion roles, a base
layer (reset, elements, accessibility), composition utilities (container, stack, cluster,
grid), and component classes (card, button, field/choice/tile, progress, steps, alert,
validation). The survey is then re-skinned from the attachment without touching Angular
component structure: soft pink canvas (`#fbafbc`), white elevated panels, serif display
titles, muted-gray prompts, large neutral answer tiles with the reference's vivid blue
selection (`#1524d9`), multi-column option flows, and animated state changes that collapse
under `prefers-reduced-motion`. PrimeNG's dropdown and toggle are themed by bridging the
library's own styling variables (`--p-*`) to design tokens, so no theme package or new
dependency is needed. An automated contract check parses the token layer and fails when a
raw color/spacing value escapes the token layer, when a token is undocumented, or when a
text/background pair stops meeting WCAG AA.

## Technical Context

**Language/Version**: TypeScript 6.0 (Angular 22.1) for the contract checks; CSS custom
properties for the design system itself

**Primary Dependencies**: Angular 22, PrimeNG 22 (already present; themed via token
bridge), Vitest 4 for the token contract check. No new runtime dependency is added.

**Storage**: N/A (styling only; survey state and JSON handling unchanged)

**Testing**: Vitest unit tests for the design-system contract (token parsing, WCAG 2.1
contrast math, scale monotonicity, documentation coverage, reduced-motion coverage);
existing 16 spec files (91 tests) must keep passing; Angular production build

**Target Platform**: Modern desktop, tablet, and mobile browsers (unchanged support
matrix); light theme only

**Project Type**: Angular single-page web application (existing `src/` app; appearance-only
feature)

**Performance Goals**: No new runtime performance target. The design-system stylesheet is
a single cached CSS file; entrance animations must complete in under 400 ms and must use
only `opacity`/`transform` so they stay off the layout path. No additional network request
(no web fonts) is introduced.

**Constraints**: Existing Angular component templates, inputs/outputs, state, validation
timing, and submission behavior MUST NOT change (FR-017); no new dependency, theme package,
or third-party CSS framework import; system font stacks only; content must reflow from
320 px to the widest supported viewport with no horizontal scrolling; all animation must
have a reduced-motion counterpart.

**Scale/Scope**: One design-system stylesheet of roughly 1,200 lines split into token,
base, layout, and component layers; six existing survey stylesheets re-skinned; two
library controls themed; one automated contract spec; documentation contract covering all
tokens and classes.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **JSON-Driven Domain Contract**: PASS (not applicable by design). The feature touches
  styling only; no survey JSON, schema, or model behavior changes, so survey content stays
  independently deployable.
- **Feature Isolation and Contracts First**: PASS. The design system is an isolated style
  layer with an explicit documented contract
  ([contracts/design-tokens.md](contracts/design-tokens.md),
  [contracts/css-classes.md](contracts/css-classes.md)) defined before implementation.
  Components consume classes/tokens, not each other.
- **Validation and Submission Integrity**: PASS. Validation timing and messaging logic are
  untouched; only the presentation of already-computed validation issues changes (state
  styling and announced message treatment).
- **Testable Quality Gates**: PASS. A new automated contract check covers contrast,
  token discipline, scale rules, and documentation coverage; all existing tests must keep
  passing and the production build must succeed.
- **Accessible, Responsive, and Maintainable UX**: PASS. This is the core of the feature:
  WCAG AA contrast is enforced by an automated check, focus visibility and 44 px targets
  are requirements (FR-011, SC-005), state is never communicated by color alone
  (FR-008, FR-010), layouts are mobile-first (FR-012), and reduced motion is mandatory
  (FR-013). Existing maroon brand language is preserved as the primary role (FR-002).

One constitution tension is recorded rather than silently accepted: the constitution
requires the current supported Angular/PrimeNG/PrimeFlex baseline to be used, and this
feature themes PrimeNG through its documented design-token variables instead of adding the
`@primeuix/themes` preset package. This reuses the installed dependency surface and avoids
a new dependency; the deviation is recorded in [research.md](research.md) and in Complexity
Tracking below.

## Project Structure

### Documentation (this feature)

```text
specs/004-survey-design-system/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── design-tokens.md     # token contract: every token, value, and usage rule
│   └── css-classes.md       # class contract: variants, states, required markup hooks
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── styles.css                        # entry stylesheet: imports the layers, keeps the
│                                     # legacy class bridge for existing templates
├── styles/
│   ├── tokens/
│   │   ├── primitives.css            # raw palettes + raw scales (only place a literal lives)
│   │   ├── semantic.css              # semantic color roles -> primitives
│   │   ├── typography.css            # font stacks, fluid type scale, weights, measure
│   │   └── space.css                 # spacing, radius, elevation, motion, layout, z-index
│   ├── base/
│   │   ├── reset.css                 # modern reset + light-theme/color-scheme guard
│   │   ├── elements.css              # headings, text, links, lists, media defaults
│   │   └── a11y.css                  # focus ring, skip link, sr-only, reduced motion,
│   │                                 # forced-colors safety
│   ├── layout/
│   │   └── composition.css           # container, section, stack, cluster, grid utilities
│   ├── components/
│   │   ├── card.css                  # .ds-card variants/states/parts
│   │   ├── button.css                # .ds-btn variants/sizes/states
│   │   ├── field.css                 # field, input, textarea, choice, tile, file
│   │   ├── progress.css              # .ds-progress, .ds-steps, .ds-step
│   │   ├── feedback.css              # alerts, validation messages, badges, status text
│   │   └── motion.css                # entrance/state animation utilities
│   ├── integrations/
│   │   └── primeng.css               # --p-* token bridge + minimal structural overrides
│   └── compat.css                    # legacy class bridge used by existing templates
├── app/
│   ├── survey/survey.css             # re-skinned survey shell/layout/questions
│   ├── survey/components/survey-navigation/survey-navigation.css   # progress + steps
│   ├── survey/components/rating-question/rating-question.css       # tiles
│   ├── survey/components/satisfaction-question/satisfaction-question.css
│   ├── survey/components/completion-summary/completion-summary.css
│   ├── survey/components/file-upload/file-upload.css
│   └── shared/design-system/
│       ├── design-token.contract.ts      # token parsing + WCAG contrast helpers (test-only surface)
│       └── design-token.contract.spec.ts # automated contract check (contrast, discipline, docs)
└── index.html                        # document title, description, theme-color
```

**Structure Decision**: Extend the existing single Angular project. Design-system CSS lives
under `src/styles/` (layered files imported by the existing `src/styles.css` entry) so it
is an independent, documented surface rather than component-owned styling; component
stylesheets under `src/app/survey/**` are re-skinned to consume tokens and classes; the
only new TypeScript is a test-support contract module under `src/app/shared/design-system/`
that verifies the CSS contract. No component template, model, service, or validator
changes.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                                                                                | Why Needed                                                                                                                                                                            | Simpler Alternative Rejected Because                                                                                                                                                    |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theming PrimeNG through `--p-*` token variables instead of installing `@primeuix/themes` | Keeps the feature dependency-free and lets library controls inherit the same tokens as the rest of the design system, which FR-014 requires                                           | Adding the theme preset package introduces a new dependency and a second, competing source of design values (preset tokens vs. design tokens) that would drift from the contract        |
| Raising the `anyComponentStyle` budget in `angular.json` (4 kB warning / 8 kB error)     | The re-skinned shared survey stylesheet legitimately exceeds 4 kB; the budget is an Angular-CLI default that predates the design system and would otherwise fail the production build | Splitting the shared survey styles into per-component partials would duplicate rules and couple stylesheets to each other; deleting the budget entirely would remove a useful guardrail |
| Raising the `initial` bundle budget (500 kB warning / 1 MB error)                        | The initial bundle already exceeded 500 kB before this feature (PrimeNG `Select`, 003 quickstart); the design system adds cached CSS on top                                           | Trimming PrimeNG from the bundle is out of scope for an appearance-only feature and would change question behavior                                                                      |
