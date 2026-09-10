# Implementation Plan: Desktop Design Enhancement (Theme Preview Parity)

**Branch**: `007-desktop-design-enhancement` (delivered on Arena working branch
`arena/01a08ab7-my-sandbox-app`) | **Date**: 2026-09-10 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-desktop-design-enhancement/spec.md`
with the desktop visual target `public/theme-preview.png` and clarification decisions
recorded in the spec's Clarifications session (LTR-only; device-persistent dock mode).

## Summary

Close the desktop-only gap between the shipped 006 dock brand and
`public/theme-preview.png`, without touching any surface below the 64 rem breakpoint.
The work is: (1) a small token/asset delta (sparkle dock texture, lock + steps glyphs)
on the existing design system; (2) desktop-scoped chrome in the survey-view shell and
survey-navigation — circular gold monogram badge, live-card encrypted line, `Survey
steps` label, `N questions • A/B done` step rows, `Private & secure` panel, theme
caption — implemented as desktop-only elements/overrides so mobile DOM and CSS stay
byte-identical; (3) a topbar desktop menu toggle wired to the existing rail collapse,
with a device-persistent, desktop-gated preference behind a pure tested storage
module; (4) survey-card header pill (`STEP N OF M`, `R REQUIRED • O OPTIONAL`) and a
bordered page-icon tile; (5) a desktop-only palette capsule + platform line below the
survey card; and (6) one new contract document merged into the automated design-system
check. All derived strings (monogram initial, live-card segments, step counts, year)
come from pure presenters; answers, validation, gating, and payloads are untouched.

## Technical Context

**Language/Version**: TypeScript 6.0 (Angular 22.1) for the shell component,
navigation component, presenters, and persistence module; CSS custom properties for
the chrome itself

**Primary Dependencies**: Angular 22, PrimeNG 22 (untouched — chrome inherits from the
existing token bridge), Vitest 4 for unit + contract checks. No new runtime
dependency; new glyphs and pattern tiles ship as inline SVG data URIs per the existing
`--ds-icon-*` convention.

**Storage**: Device-local web storage for exactly one UI preference (dock mode,
expanded/collapsed), written/read only on desktop viewports; degrades to session-only
when storage is unavailable. No survey data is persisted; in-session answer
preservation keeps its existing behavior.

**Testing**: Vitest unit tests for the new pure helpers (monogram initial, live-card
meta segments, step-counts label, platform year, toggle action selector, dock-mode
storage read/write/fallback); component spec updates for survey-view and
survey-navigation (desktop-only element presence/gating, toggle pressed state);
extended design-system contract check merging the new 007 contract document; all
existing suites pass unmodified; Angular production build; manual viewport walkthrough
per quickstart.md (no visual-regression harness exists in this repo — SC-002
pixel-parity is verified by the documented manual checklist plus media-query confinement
review).

**Target Platform**: Modern desktop browsers at/above the 64 rem breakpoint for the new
chrome; everything below it renders the current build unchanged. LTR only (per
clarification). Light theme only. Fully usable offline (self-contained assets).

**Project Type**: Angular single-page web application (existing `src/` app;
presentation-only chrome feature with one device-local UI preference)

**Performance Goals**: No new runtime target and no new network request: pattern tiles
and glyphs are inline data URIs; the preference is read once synchronously during
component construction (no post-paint flip); no new animation is introduced (existing
entrance timing, collapsed by reduced motion).

**Constraints**: Mobile byte-identity below 64 rem (FR-001, spec US-2) — every new
element hidden below the breakpoint, every style change confined to the existing
`64rem` media query or to desktop-only elements; literal-free token discipline with
documentation coverage (FR-015); WCAG 2.1 AA text contrast + verified UI pairs, 44 px
targets, visible focus, non-color state cues, reduced-motion collapse (FR-016); no new
network dependency (FR-017); survey JSON contract unchanged (FR-018); behavior
invariance with the single sanctioned persistence exception (FR-014/FR-009).

**Scale/Scope**: ~8 stylesheets/templates touched + 2 new pure modules with tests +
2 component spec updates + 1 contract doc + 1 contract-spec extension; ~10 new token
entries and ~14 new class hooks; 6 small pure helpers; zero JSON contract changes;
zero changes below the 64 rem breakpoint.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. JSON-Driven Domain Contract**: PASS. No survey JSON field is added, changed, or
  required (FR-018); every catalog survey gets the chrome with zero per-survey
  configuration; invalid configuration keeps its exact existing error behavior.
- **II. Feature Isolation and Contracts First**: PASS. The token/asset/class/copy
  contract ([contracts/desktop-chrome.md](contracts/desktop-chrome.md)) and the view
  shapes ([data-model.md](data-model.md)) are defined in this plan phase, before
  implementation. All derived values (monogram, meta segments, counts, year, toggle
  action, stored mode fallback) live in pure tested modules under
  `survey/presenters/` and `survey/services/` — never in templates.
- **III. Validation and Submission Integrity**: PASS. Validation rules, timing,
  gating, and the submission boundary are untouched; the submission payload stays
  byte-identical for the same inputs. The only persisted value is a presentation
  preference that never participates in answer/validation state.
- **IV. Testable Quality Gates**: PASS. New pure helpers and the storage module carry
  unit tests; the contract check merges and verifies the new contract document
  (tokens exist + documented, class hooks covered, added contrast pairs pass); all
  existing tests must pass; formatting, type checking, and the production build gate
  the change.
- **V. Accessible, Responsive, and Maintainable UX**: PASS. Desktop/tablet/mobile
  layouts are preserved exactly (the enhancement adds to desktop without degrading any
  existing layout); contrast pairs are machine-verified; the new desktop toggle meets
  44 px with visible focus and an announced pressed state; decorative textures,
  swatches, and the monogram never carry meaning; reduced motion collapses all
  entrance timing. The LTR-only scope is an explicit, user-confirmed boundary that
  matches the app's existing behavior; new surfaces use flow-relative properties so
  RTL is not blocked later.

_Re-check after Phase 1 design_: no new violations. One tension is recorded, not
silently accepted (see Complexity Tracking): device-local persistence of a UI
preference against 006's no-persistence assumptions.

## Project Structure

### Documentation (this feature)

```text
specs/007-desktop-design-enhancement/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── desktop-chrome.md   # tokens/assets, class hooks, copy strings, contrast delta, geometry
└── (tasks.md)           # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── styles/tokens/
│   ├── primitives.css          # + sparkle texture tiles (SVG data URIs) + documented opacities
│   └── icons.css               # + --ds-icon-lock (live-card cue) + --ds-icon-steps (steps label)
├── app/survey/
│   ├── survey-shell.css        # desktop-scoped overrides: dock texture, badge, caption,
│   │                           # header pill/icon tile, palette capsule, platform line,
│   │                           # topbar toggle visibility
│   ├── components/survey-navigation/
│   │   ├── survey-navigation.ts    # + steps label, desktop step-counts variant, secure panel
│   │   ├── survey-navigation.css   # desktop-scoped step row + panel + caption styles
│   │   └── survey-navigation.spec.ts   # updated: desktop-only hooks present, mobile output unchanged
│   ├── presenters/
│   │   ├── desktop-chrome.ts       # NEW pure helpers: surveyInitial, liveCardMeta,
│   │   │                           # stepCountsLabel, platformYear, topbarAction
│   │   └── desktop-chrome.spec.ts  # NEW unit tests
│   ├── services/
│   │   ├── dock-preference.ts      # NEW pure storage module: read/write DockMode with
│   │   │                           # desktop gate + safe fallbacks (no Angular)
│   │   └── dock-preference.spec.ts # NEW unit tests (blocked storage, invalid values)
│   └── pages/survey-view/
│       ├── survey-view.ts          # template additions (badge, meta, toggle, footer)
│       │                           # + logic (persistence hydration, action branch)
│       └── survey-view.spec.ts     # updated: toggle behavior, desktop chrome, persistence calls
└── app/shared/design-system/
    └── design-token.contract.spec.ts  # + merge specs/007 contract document into checks
```

**Structure Decision**: Reuse the existing single-project Angular layout. New code is
confined to the survey feature: one presenters module (constitution II, mirrors
`completion-tiles.ts`), one storage service module, template/CSS additions in the two
existing shell components, and the token layers. Contract artifacts live with the
feature under `specs/007-desktop-design-enhancement/` exactly like 005/006; the
automated check merges them as an additive baseline.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                                                                                                                | Why Needed                                                                                                                               | Simpler Alternative Rejected Because                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Device-local persistence of one UI preference (diverges from 006's "no draft persistence / no demo tooling" assumptions) | Explicit user decision in the 2026-09-10 clarification: the dock mode must survive reloads (FR-009)                                      | Session-only state was recommended and rejected; a global "no storage ever" rule would contradict the confirmed requirement. Scoped to one key, desktop-only, presentation-only                          |
| Per-element parallel desktop/mobile spans (duplicate small DOM nodes gated by CSS classes)                               | Guarantees the mobile DOM/CSS output is byte-identical (SC-002) without runtime branching that differs per viewport during SSR/hydration | Single elements restyled via media query cannot swap inner text (live-card line, step counts); `@if (isDesktop())` branching changes hydration output and complicates the mobile byte-identity guarantee |
