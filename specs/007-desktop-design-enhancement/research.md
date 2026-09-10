# Phase 0 Research: Desktop Design Enhancement (Theme Preview Parity)

**Feature**: [007-desktop-design-enhancement](spec.md) | **Resolved**: all Technical
Context items — no NEEDS CLARIFICATION remains (both spec-level pre-planning
clarifications were answered in the spec's Clarifications session: LTR-only scope;
device-persistent dock mode).

## Decision: Desktop gating reuses the existing 64 rem mechanism and class hooks

- **Decision**: Every new element carries the existing `only-desktop` class (hidden by
  default, revealed inside the existing `@media (min-width: 64rem)` block), and every
  restyle of an existing desktop surface lives inside that same media query. No new
  breakpoint token, no JS breakpoint branching for rendering.
- **Rationale**: The shell already centralizes desktop/mobile switching in one media
  query with `.only-desktop`/`.only-mobile` DOM classes. Gating by construction
  (display rules) makes the mobile byte-identity requirement (FR-001, SC-002)
  verifiable by code inspection: if a diff touches only `only-desktop` content or the
  desktop media query, mobile cannot change.
- **Alternatives considered**: `@if (isDesktop())` template branching (changes
  hydrated DOM per viewport, complicates tests and the byte-identity guarantee — the
  signal is already used only for the sr-only/pill strip); a new breakpoint token
  (churn, no benefit — `64rem` is the documented literal per 006 contracts).

## Decision: Sparkle texture is a scoped override of the dock's backdrop layer

- **Decision**: Keep `--ds-alpha-gold-30` round-dot layer for the drawer forever. Add
  two repeating SVG data-URI tiles (`--ds-pattern-sparkle-lg`,
  `--ds-pattern-sparkle-sm`) in primitives.css and override `.dock::before`'s
  background inside the desktop media query only.
- **Rationale**: The drawer's `.dock::before` base rule is never edited, so the mobile
  texture stays byte-identical automatically; the desktop dock gains the reference
  tessellation. Static, aria-hidden, and decorative — no information, no motion.
- **Alternatives considered**: Replacing the dot pattern globally (violates FR-001 —
  the drawer would change); a second pseudo-element (no spare pseudo-element without
  restructuring children stacking; the media-override is additive and minimal).

## Decision: Circular monogram badge is a desktop-only sibling of the brand mark

- **Decision**: Add `.dock-badge` (desktop-only, `collapse-hide`): a gold-gradient
  ring + inner disc sized by existing tokens, containing a maroon text monogram from
  the pure helper `surveyInitial(title)` (first uppercase letter; documented
  clipboard-glyph fallback for titles without one). The existing square
  `.dock-brand-mark` is hidden at/above the breakpoint, unchanged below it and in the
  rail (badge hides, expand button stays).
- **Rationale**: The reference swaps glyph-for-letter and square-for-circle; a sibling
  element keeps the drawer/rail DOM and styles exact while making the desktop swap
  trivial and reviewable. The monogram is text — it scales with zoom and needs no
  asset.
- **Alternatives considered**: Media-query morph of the existing mark (border-radius +
  mask swap can't produce a text letter — DOM change required anyway); hard-coding a
  brand initial (violates FR-018 — derives from the survey title).

## Decision: One pure storage module owns the dock-mode preference

- **Decision**: New `dock-preference.ts` (no Angular) with `DockMode`, a fixed storage
  key, `readDockMode(storage, isDesktop)` and `writeDockMode(storage, isDesktop,
mode)`: both refuse below the breakpoint, both swallow storage errors and normalize
  corrupted/absent values to `expanded`. The survey-view hydrates `dockCollapsed`
  from `readDockMode` during field initialization (before first paint — no flash) and
  persists from the single `toggleRail()` path, which the new topbar toggle and the
  existing dock-header chevron share.
- **Rationale**: FR-009's acceptance (first-visit expanded, reload restore without
  flash, blocked storage degrades to session-only, never touched below the breakpoint)
  is fully unit-testable as pure functions with injected storage; hydrating
  pre-paint satisfies the no-flash criterion (SC-004).
- **Alternatives considered**: Reading storage in `ngOnInit` (one frame of expanded
  dock before collapse — fails SC-004's no-flash); cookie/server state (overkill,
  adds a round trip, violates "no new network"); an Angular service singleton for the
  preference (unneeded coupling — survey-view already owns the rail signal).

## Decision: All derived strings come from a pure presenters module

- **Decision**: New `desktop-chrome.ts` presenters: `surveyInitial(title)`,
  `liveCardMeta(survey)` → `{ sectionsLabel, minutesLabel: string | null, encrypted:
true }`, `stepCountsLabel(answered, total)` → `N questions • A/B done`,
  `platformYear(now)` → number, `topbarAction(isDesktop)` → `'rail' | 'drawer'`.
  Templates bind to these; nothing is computed inline.
- **Rationale**: Constitution II requires business/derivation rules in tested modules,
  not templates; mirrors the existing `completion-tiles.ts` precedent; gives US-1/US-3
  acceptance scenarios direct unit-test targets.
- **Alternatives considered**: Inline template expressions (untestable, mixed escape
  handling for `•`/`~`); extending the session service (presentation strings are not
  session state — keep the service untouched per FR-014).

## Decision: Live-card and step-row desktop text uses parallel gated spans

- **Decision**: Add desktop-only variant elements (`.live-sub-desktop`,
  `.step-counts-desktop`) next to the existing spans, and hide the original variants
  inside the desktop media query. Mobile keeps today's exact elements and strings;
  the `~M min` segment is conditionally omitted by the presenter when
  `estimatedMinutes` is absent (no stray separators).
- **Rationale**: Text content differs per breakpoint (FR-004, FR-006) —
  media-query restyling of one element cannot change its text, so parallel spans are
  the minimal, reviewable pattern; hiding a span with `display: none` satisfies
  FR-001 ("fully hidden, not just transparent").
- **Alternatives considered**: CSS `content` property text injection (breaks
  screen-reader reading order and i18n discipline); JS string swap on breakpoint
  change (reactivity risk, complexity for zero DOM benefit).

## Decision: Topbar toggle is the same button with a wider branch

- **Decision**: Drop `only-mobile` from the existing `.menu-btn`; at click time branch
  by the existing `isDesktop()` signal via `topbarAction()` — desktop calls
  `toggleRail()` (shared state with the dock chevron), mobile calls
  `toggleMobileNav()` unchanged. Add `aria-pressed` reflecting the rail state on
  desktop (removed on mobile — drawer state is conveyed by existing expanded states),
  keep the 44 px target and hover styles.
- **Rationale**: One button, two modes, state shared by construction; the reference
  simply shows the control on desktop. Existing mobile acceptance (006 quickstart §4)
  stays valid byte-for-byte.
- **Alternatives considered**: A second desktop-only button (duplicate controls,
  focus-order churn); repurposing the expand chevron (it already exists but does not
  match the reference's top-left placement).

## Decision: Survey-card header keeps one eyebrow row with desktop-only siblings

- **Decision**: Add `.step-pill` (gradient `STEP N OF M`) and keep the existing
  eyebrow text counts; at desktop the pill and caps counts render while the mobile
  eyebrow placeholders hide. The page icon gains a desktop-only bordered-tile sibling
  positioned at the header's inline-end; the inline icon hides at/above the
  breakpoint. Title/description typography untouched.
- **Rationale**: FR-010/FR-011 are placement/content changes; the
  parallel-span pattern keeps mobile exact and desktop reviewable.
- **Alternatives considered**: Restructuring the eyebrow flex order at desktop via
  CSS `order` (text change still required for the pill; moving the icon via `order`
  keeps it inline rather than corner-anchored — flex-end anchor is documented in the
  contract instead).

## Decision: Palette capsule and platform line are in-flow content siblings

- **Decision**: A single desktop-only `.shell-footer` inserted after the survey card
  inside the scrolling content column: centered capsule with three swatch dots tinted
  by documented tokens + one centered platform line with `platformYear()`.
- **Rationale**: In-flow placement scrolls with the page like the reference, never
  collides with the fixed toast, and needs no geometry tokens beyond existing spacing.
- **Alternatives considered**: Fixed footer (overlap/z-index conflicts with toast, and
  would need new shell geometry); placing it inside the survey card (couples chrome to
  submission-state swaps — the footer must persist in the completion state).

## Decision: One contract document, merged like 006

- **Decision**: All 007 acceptance surface lands in
  [contracts/desktop-chrome.md](contracts/desktop-chrome.md): token/asset additions,
  class-hook contract, copy-string contract, contrast-pair additions, and measured
  desktop geometry. `design-token.contract.spec.ts` gains one merge block mirroring
  the 006 lines.
- **Rationale**: Each feature keeps its own baseline (006 precedent); the check then
  fails if any new surface ships undocumented or breaks a pair.
- **Alternatives considered**: Amending 004/006 documents (breaks their baselines and
  blurs feature ownership); geometry in shell-sizes.md 006 doc (it is closed —
  documents 006 surfaces; 007 chrome belongs to 007).

## Decision: No new runtime dependency; assets extend existing conventions

- **Decision**: The sparkle tiles use the same data-URI color practice as the canvas
  dot pattern; `--ds-icon-lock` and `--ds-icon-steps` extend the black-geometry
  SVG-mask set tinted via `background-color`.
- **Rationale**: FR-017 (no network dependency, offline usable) and the 006 research
  conclusion (no icon font) are preserved.
- **Alternatives considered**: New PNG/WebP sprites (network request, scaling
  artifacts); emoji/glyphs from system fonts (inconsistent rendering, contrast risk).
