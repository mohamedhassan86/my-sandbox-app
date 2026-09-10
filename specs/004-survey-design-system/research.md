# Phase 0 Research: Survey Design System

## Decision: Token architecture (two tiers)

- **Decision**: Ship a two-tier token system: `tokens/primitives.css` holds the only literal
  values in the codebase (raw palettes and raw scales), and `tokens/semantic.css` maps
  semantic roles onto those primitives. Components reference semantic roles only.
- **Rationale**: The feature's core promise is that one value change propagates everywhere.
  Two tiers make that mechanically checkable: an automated contract check can assert that
  no literal color appears outside the primitives file while still allowing the palette
  itself to be authored normally.
- **Alternatives considered**: One flat tier of tokens (simpler, but a palette change means
  editing every role, and nothing distinguishes "brand pink" from "canvas pink"); a
  utility-class-only framework such as PrimeFlex utilities for everything (already a
  dependency, but it expresses layout only and offers no semantic color/state roles, so the
  survey would still need bespoke CSS).

## Decision: Color roles derived from the attachment

- **Decision**: Sample the attachment and encode it exactly: tertiary canvas `#fbafbc`,
  selection blue `#1524d9`, neutral tile `#e5e5e5`, ink `#202020`, muted text `#6e6e6e`,
  `#c7c7c7` borders, white panel. Maroon (`#800000`) remains the primary role per the
  2026-09-10 clarification, alongside documented secondary (selection blue) and tertiary
  (canvas pink) roles.
- **Rationale**: "Premium" in this feature means "matches the reference". Sampling the PNG
  during specification removed guesswork and made the palette testable (contrast math runs
  against the real values).
- **Alternatives considered**: Approximating the palette by eye (rejected: produces values
  that fail contrast checks unpredictably); reusing the existing one-off hex values
  scattered through `styles.css` and component files (rejected: that is exactly the
  inconsistency the feature exists to remove).

## Decision: Accessibility is enforced by an automated contract check, not by review

- **Decision**: Add `src/app/shared/design-system/design-token.contract.ts` plus a Vitest
  spec that parses the CSS token files and asserts: every `var(--ds-*)` reference resolves
  to a defined token; every text-on-surface role pair meets WCAG 2.1 AA (4.5:1, or 3:1 for
  large text/UI boundaries); the spacing scale is monotonic on a 4 px base; the type scale
  is monotonically increasing and body sizes stay at or above 16 px at mobile width; a
  reduced-motion block exists and collapses durations; and every shipped token is
  documented in `contracts/design-tokens.md`.
- **Rationale**: The constitution requires testable quality gates, and "accessible
  typography/color" is otherwise an opinion. Contrast math is pure and deterministic, so it
  belongs in the unit-test layer where it fails a build instead of a review.
- **Alternatives considered**: A visual regression tool (needs a browser and baseline
  images, not available in this environment); an axe/Lighthouse accessibility pass (catches
  rendered DOM issues, not token discipline, and cannot run here); manual review checklist
  only (does not satisfy SC-001/SC-002).

## Decision: Motion is tokenized and globally reducible

- **Decision**: Durations and easings are tokens (`--ds-duration-fast/base/slow`,
  `--ds-ease-standard/emphasized/exit`); animations use only `opacity` and `transform`;
  a single global `@media (prefers-reduced-motion: reduce)` block collapses every
  design-system duration and disables transform movement.
- **Rationale**: FR-013 requires the reduced-motion counterpart to be structural rather
  than something each component author remembers. Collapsing durations (instead of
  removing transitions) keeps state changes instant but still final-state-correct.
- **Alternatives considered**: Per-component reduced-motion blocks (drift-prone); no
  animations at all (fails the perceived-quality goal in the attachment).

## Decision: PrimeNG theming via a `--p-*` token bridge

- **Decision**: PrimeNG 22 renders its own component CSS whose values are placeholders
  resolved to `var(--p-<component>-<token>)`. With no theme preset installed, those
  variables are undefined and the dropdown/toggle render unstyled. The design system maps
  `--p-select-*` and `--p-togglebutton-*` (plus shared focus/form-field tokens) onto
  design-system tokens in `integrations/primeng.css`, and adds a small number of scoped
  structural overrides where the library's shape (radius, typography, overlay shadow)
  must match the design system.
- **Rationale**: FR-014 requires library controls to use design tokens, and the
  constitution prefers reusing existing dependencies over adding new ones. A token bridge
  themes the library through its own supported extension point instead of fighting its
  generated CSS with `!important`, and it keeps a single source of design values.
- **Alternatives considered**: Installing `@primeuix/themes` and configuring a preset
  (adds a dependency and a second token system that would drift from the design tokens);
  leaving the library unstyled (fails the premium/consistency goal); re-implementing the
  controls natively (changes component structure, violating FR-017 as clarified).

## Decision: System font stacks, no downloaded webfont

- **Decision**: The display role uses a serif system stack
  (`Georgia, 'Iowan Old Style', 'Times New Roman', serif`) and the text role uses a UI sans
  system stack. No web font is fetched.
- **Rationale**: The reference uses a serif display face; Georgia is the closest
  universally available transitional serif and preserves the reference's character. Adding
  a webfont would introduce a network dependency, a render-blocking request, and a failure
  mode (offline/blocked CDN) for a styling-only feature.
- **Alternatives considered**: Google Fonts (network dependency, layout shift, offline
  failure); self-hosting a font file (a new binary asset with licensing implications and a
  bundle-size cost that the existing budget already exceeds).

## Decision: Mobile-first, small-screen-first authoring

- **Decision**: Base rules describe the single-column mobile experience; enhancements are
  added in `min-width` media queries, using breakpoint tokens as documentation of the
  contract (`--ds-bp-sm: 30rem`, `--ds-bp-md: 48rem`, `--ds-bp-lg: 64rem`,
  `--ds-bp-xl: 80rem`). Key selectors use intrinsic sizing
  (`repeat(auto-fit, minmax(…, 1fr))`) so tiles and option grids reflow without
  breakpoint-specific rules.
- **Rationale**: FR-012 and SC-003 require 320 px to desktop with no horizontal scroll;
  intrinsic layouts satisfy that with fewer rules than breakpoint-by-breakpoint overrides
  and match the attachment's fluid option flow.
- **Alternatives considered**: Desktop-first with `max-width` overrides (rejected: the
  existing component stylesheets already do this and produce the narrow-viewport issues the
  feature is meant to fix).

## Decision: Validation state styling driven by existing markup

- **Decision**: Validation/answered state styling is attached to the classes and elements
  the current templates already render (`.question-block`, `.answered`,
  `app-validation-message`, `aria-checked`, `[aria-invalid]`), using `:has()` where a state
  must be inferred from a child (for example a card whose child rendered a validation
  message). Where `:has()` is unsupported, the card tint degrades but the message, icon, and
  field border remain, satisfying the edge-case requirement.
- **Rationale**: FR-017 forbids restructuring components, so the design system must style
  the markup that exists. `:has()` is supported by every browser in the project's support
  matrix and degrades safely.
- **Alternatives considered**: Adding state classes to templates (rejected by the
  clarification: appearance-only changes); styling only the message (rejected: FR-009/FR-010
  require the field and card to reflect the invalid state too).

## Decision: Repository-level fixes required by the toolchain

- **Decision**: Two small repository changes accompany the feature:
  `pnpm-workspace.yaml` gains explicit `allowBuilds: true` entries (the file previously used
  the placeholder text that pnpm 11 writes when it refuses to run dependency build scripts,
  which made `pnpm install` and therefore `ng` fail), and the unused scaffold stylesheet
  `src/app/app.css` (left over from `ng new`, no longer referenced by any component, and the
  only place outside the token layer containing literal brand hex values) is emptied down to
  a comment.
- **Rationale**: Both changes are prerequisites for the feature's own verification
  commands to run at all, and the second is required for the token-discipline check to be
  meaningful rather than exception-riddled.
- **Alternatives considered**: Leaving `pnpm-workspace.yaml` alone (verification commands
  fail outright); keeping the dead scaffold CSS (the contract check would need a permanent
  exception for values nothing renders).

## Decision: Development server accepts hosted preview hosts

- **Decision**: `angular.json` gains `architect.serve.options` with `host: 0.0.0.0`,
  `port: 4200`, and `allowedHosts: ['.e2b.app', 'localhost', '127.0.0.1']`.
- **Rationale**: The dev server refused to answer requests for the hosted preview host
  (HTTP 403 "Blocked request"), which made the feature impossible to review in the browser
  preview. The setting is development-only and scoped to the preview domain plus localhost.
- **Alternatives considered**: Passing `--allowed-hosts` on every command (not persisted, so
  the preview would break for anyone starting the server normally); `allowedHosts: true`
  (all hosts — an unnecessary and explicitly discouraged broadening).

## Decision: Budget adjustments are part of the change

- **Decision**: Raise the `anyComponentStyle` budget to 8 kB warning / 16 kB error and the
  `initial` budget to 700 kB warning / 1.2 MB error, recording the change in the plan's
  Complexity Tracking table and in the quickstart results.
- **Rationale**: The shared survey stylesheet already triggered the 4 kB warning before this
  feature (003 quickstart), and the design-system CSS legitimately grows it. Silently
  leaving a failing/warning build would make the feature's own verification ambiguous.
- **Alternatives considered**: Splitting shared survey styles across component partials
  (duplicates rules, couples stylesheets); removing budgets (loses the guardrail).
