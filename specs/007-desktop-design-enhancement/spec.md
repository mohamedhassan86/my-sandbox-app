# Feature Specification: Desktop Design Enhancement (Theme Preview Parity)

**Feature Branch**: `007-desktop-design-enhancement`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "desktop design need some enhancment to be \"public/theme-preview.png\", add spec for desktop design enhancment without any mobile screen changes"

## Clarifications

### Session 2026-09-10

- Q: Should the enhanced desktop chrome support RTL (e.g. Arabic) layouts now? → A: LTR only, matching the application's current LTR-only contract; new surfaces use flow-relative layout properties so RTL is not blocked later.
- Q: Should the desktop dock's collapsed/expanded state persist across reloads? → A: Yes — remember the respondent's chosen mode on this device (first-time visitors start expanded); storage failures degrade to session-only.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dock identity refinements on desktop (Priority: P1)

A respondent on a desktop viewport sees the dock upgraded to the reference's richer
identity chrome: the reference sparkle/star tessellation instead of the round dot
texture, a circular metallic-gold badge with a maroon monogram initial of the survey
title, a live-survey card whose sub line reads `N sections • ~M min • Encrypted`, a
gold `Survey steps` section label above the step list, step rows that read
`N questions • A/B done` with the reference state cues, a bordered `Private & secure`
panel, and a `Maroon • Gold • Cream Theme` caption at the dock's bottom edge. The
collapsed icon rail and the mobile drawer keep today's appearance exactly.

**Why this priority**: The dock is the signature region of the desktop experience and
carries the largest visible gap against `public/theme-preview.png`. Every other
desktop refinement is secondary chrome around it.

**Independent Test**: Can be fully tested by opening any catalog survey at 1440 px and
1024 px, comparing the expanded dock against the reference region by region, then
collapsing to the icon rail and confirming the rail is unchanged, and resizing below
1024 px to confirm the drawer shows today's dock content untouched.

**Acceptance Scenarios**:

1. **Given** a desktop viewport (≥ 64 rem), **When** a survey renders, **Then** the
   expanded dock shows the sparkle tessellation texture (no round-dot texture), the
   circular gold monogram badge, the gold `Survey steps` label, step rows reading
   `N questions • A/B done`, the bordered `Private & secure` panel, and the
   `Maroon • Gold • Cream Theme` caption.
2. **Given** the dock live-survey card on desktop, **When** the survey defines
   `estimatedMinutes`, **Then** the card sub line reads `N section(s) • ~M min •
Encrypted` with a lock glyph; when `estimatedMinutes` is absent the `~M min`
   segment is omitted without leaving stray separators.
3. **Given** the expanded desktop dock, **When** viewed step rows are active,
   completed, or gated, **Then** each state is distinguishable without color alone
   (gold-gradient number tile plus gold border for active, green check tile for
   completed, ring cue and disabled affordance for gated), and counts, mini bars, and
   the footer ring/bar still agree with the real answered state.
4. **Given** the dock collapsed to the icon rail on desktop, **When** it renders,
   **Then** none of the new expanded-dock chrome (badge circle, label, panel, caption)
   is shown and the rail matches today's compact form.
5. **Given** a viewport below 64 rem, **When** the navigation drawer opens, **Then**
   the dock texture, live-card content, step rows, and security note render exactly as
   before this feature.

---

### User Story 2 - Mobile experience stays pixel-identical (Priority: P1)

Anyone reviewing the shipped survey below the 64 rem dock breakpoint — phone and small
tablet widths — sees exactly today's design: same drawer, step pills, progress card,
question cards, actions, toasts, and completion summary, pixel-for-pixel and
behavior-for-behavior. Nothing in this feature may regress, shift, or restyle any
mobile surface.

**Why this priority**: It is the explicit constraint of the request ("without any
mobile screen changes"). Sharing markup between the dock (desktop) and the drawer
(mobile) makes accidental mobile drift the single biggest risk of this work.

**Independent Test**: Can be fully tested by capturing the survey at 320 px, 375 px,
and 768 px before and after the change and confirming zero visual differences, and by
running the existing mobile interaction flows (drawer open/close, step gating,
answering, submit) with identical results.

**Acceptance Scenarios**:

1. **Given** any viewport below 64 rem, **When** every survey screen renders (steps,
   questions, validation errors, completion summary), **Then** no added, removed,
   repositioned, or restyled element is visible relative to the pre-change build.
2. **Given** the mobile drawer, **When** opened and closed (menu button, backdrop,
   Escape), **Then** its content, geometry, and motion are unchanged.

---

### User Story 3 - Desktop topbar menu toggle (Priority: P2)

A respondent on desktop gets the reference's top-left maroon menu toggle in the
topbar, which collapses the dock to the icon rail and expands it again — mirroring the
dock header's chevron control — so the chrome control placement matches the reference.
On mobile the same button keeps its exact current drawer behavior and appearance.

**Why this priority**: It restores a control visible in the reference's topbar and
makes the rail collapse discoverable from the main column, but the survey remains
fully usable without it (the dock header control already exists).

**Independent Test**: Can be fully tested at 1440 px by activating the toggle by
pointer and keyboard to collapse and expand the dock, confirming the main column
shifts accordingly, the pressed state is announced, and below the breakpoint the
button still opens and closes the drawer exactly as before.

**Acceptance Scenarios**:

1. **Given** a desktop viewport with the expanded dock, **When** the respondent
   activates the topbar menu toggle, **Then** the dock narrows to the icon rail and
   the main column reflows; activating it again restores the expanded dock; and the
   chosen mode is remembered across page reloads on the same device.
2. **Given** the desktop topbar toggle, **When** it is focused by keyboard and
   activated with Enter or Space, **Then** it performs the same collapse/expand, shows
   a visible focus indicator, meets the 44 px minimum target, and its pressed/expanded
   state is exposed to assistive technology.
3. **Given** a viewport below 64 rem, **When** the toggle is used, **Then** the drawer
   behavior and the button's appearance are byte-identical to today, and no
   collapse preference is read, written, or applied.
4. **Given** a desktop respondent whose last chosen mode was collapsed, **When** the
   page reloads, **Then** the dock renders collapsed from the start with no visible
   expand-then-collapse flash; **and given** device storage that is unavailable or
   blocked, **when** the toggle is used in that session, **Then** it still works for
   that session and no error surfaces.

---

### User Story 4 - Survey card header badges on desktop (Priority: P2)

A respondent on desktop sees the survey card header wearing the reference treatment: a
maroon-gradient `STEP N OF M` pill, an `X REQUIRED • Y OPTIONAL` caps count line, and
the page icon presented as a bordered maroon tile anchored at the header's top-right,
with the page title and description typography unchanged. On mobile the existing
header renders untouched.

**Why this priority**: The header is the most-read chrome in the main column and the
clearest remaining mismatch with the reference, but the survey is answerable without
it and every string shown already exists today.

**Independent Test**: Can be fully tested by paging through a multi-page survey on
desktop and confirming the pill counts and required/optional tallies update per page,
the icon tile uses the page's icon key (default icon for unknown keys), and below the
breakpoint the header keeps today's exact treatment.

**Acceptance Scenarios**:

1. **Given** a desktop viewport on page N of a survey with R required and O optional
   questions, **When** the survey card header renders, **Then** it shows a
   maroon-gradient `STEP N OF M` pill, an `R REQUIRED • O OPTIONAL` caps line, and the
   bordered page-icon tile at the top-right.
2. **Given** a page whose `icon` key is unknown or absent, **When** the desktop header
   renders, **Then** the tile shows the documented default page icon (never an error).
3. **Given** a viewport below 64 rem, **When** any page header renders, **Then** the
   eyebrow row, icon placement, and typography are unchanged.

---

### User Story 5 - Desktop palette caption and platform footer (Priority: P3)

A respondent on desktop sees the reference's closing chrome below the survey card: a
centered soft capsule reading `Palette —` with the three brand-role chips (`Maroon
primary`, `Metallic gold secondary`, `Warm cream tertiary`, each with its role
swatch), and beneath it a centered platform line `© {current year} Regional Survey
Platform • Secured & Encrypted • Dock Navigation Edition`. Neither element appears on
mobile.

**Why this priority**: It completes the reference's desktop frame but carries no
information the respondent needs; it is the safest, most deferrable slice.

**Independent Test**: Can be fully tested by rendering any survey at 1440 px and
confirming the capsule and line appear below the survey card in both the answering and
completion states, and resizing below the breakpoint to confirm neither renders.

**Acceptance Scenarios**:

1. **Given** a desktop viewport, **When** a survey page (answering or completion
   state) renders, **Then** the palette capsule and the platform line are centered
   below the survey card, with swatches marked decorative and text meeting contrast
   rules.
2. **Given** a viewport below 64 rem, **When** the same page renders, **Then** neither
   the capsule nor the platform line is present.

### Edge Cases

- What happens at exactly 1024 px (64 rem at default root size)? The desktop chrome
  appears at and above the breakpoint and is fully absent below it, with no overlap or
  flicker when the viewport crosses the boundary (including live window resizing).
- What happens in the collapsed icon rail? All new expanded-dock chrome (badge,
  `Survey steps` label, secure panel, theme caption) is hidden; the rail's existing
  compact readout is untouched.
- What happens when `estimatedMinutes` is absent? The live-card sub line omits the
  `~M min` segment cleanly (`N sections • Encrypted`).
- What happens with very long survey titles? The monogram stays a single centered
  initial, the badge never grows, and existing title truncation rules still hold.
- What happens with a single-page survey? `STEP 1 OF 1` renders, `0 REQUIRED`-style
  tallies follow the real counts, and the footer chrome still fits without wrapping
  the card above the fold.
- What happens when device storage is unavailable, blocked, or cleared? The desktop
  collapse preference degrades to session-only with the expanded dock as the default;
  no error surfaces; first-time visitors always start expanded.
- What happens at 200% browser zoom on desktop? The dock, header tile, caption, and
  footer reflow without clipped text, overlapping targets, or horizontal scrolling.
- What happens with reduced motion or forced colors? No new motion is introduced
  (texture is static, caption/footer appear with existing entrance timing collapsed);
  texture, swatches, and the monogram never convey meaning, so content stays complete
  when they are suppressed.
- What happens when a survey definition is invalid? The existing user-visible error
  stays exactly as today; no new desktop chrome renders around a failed load.
- What happens after submission? The palette caption and platform line remain visible
  in the completion state on desktop; the dock counts/ring settle at 100% exactly per
  existing logic.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Every treatment in this feature MUST render only on viewports at or
  above the dock breakpoint (64 rem). Below the breakpoint, markup must present as
  today: any newly added element MUST be fully hidden (not just transparent), and no
  existing mobile element, geometry, content string, or behavior may change.
- **FR-002**: The dock background texture MUST switch from the round-dot pattern to
  the reference sparkle/star tessellation at or above the breakpoint, at comparable
  decorative opacity, marked aria-hidden, with the existing dot pattern unchanged
  below the breakpoint (the mobile drawer keeps today's texture).
- **FR-003**: The expanded desktop dock's brand badge MUST be a circular
  metallic-gold treatment (ring plus inner disc) holding a maroon monogram initial
  derived from the survey title; the collapsed rail keeps its current compact
  presentation, and the mobile drawer's brand row is untouched.
- **FR-004**: On desktop, the live-survey card sub line MUST read `N section(s) •
~M min • Encrypted` with a lock glyph, omitting the `~M min` segment when
  `estimatedMinutes` is absent; answered-count feedback already exposed elsewhere
  (topbar pill, progress card, dock ring) MUST remain; below the breakpoint the
  card's current content is unchanged.
- **FR-005**: The expanded desktop dock MUST show a gold `Survey steps` section label
  with a list glyph between the live-survey card and the step list; it MUST NOT appear
  in the rail or below the breakpoint.
- **FR-006**: On desktop, each step row MUST read `N questions • A/B done` and follow
  the reference state treatment (gold-gradient number tile and gold-bordered row for
  active, green check tile for completed, ring cue with disabled affordance for
  gated), with states distinguishable without color alone; below the breakpoint the
  current `A/B done` format and cues are unchanged.
- **FR-007**: The expanded desktop dock MUST show a bordered `Private & secure` panel
  (gold-bordered shield tile, title, and the existing security copy `Your responses
are encrypted & securely stored.`) in place of the plain one-line note; the mobile
  drawer MUST keep the existing one-line note exactly, and the rail shows neither
  (as today).
- **FR-008**: The expanded desktop dock MUST show a centered `Maroon • Gold • Cream
Theme` caption at its bottom edge; it MUST NOT appear in the rail or below the
  breakpoint.
- **FR-009**: The topbar menu toggle MUST be visible on desktop and MUST collapse and
  expand the dock rail (sharing state with the dock header control), meet the 44 px
  minimum target, show a visible focus indicator, and expose its pressed state to
  assistive technology; the desktop expanded/collapsed preference MUST persist across
  page reloads on the same device (first-time users start expanded; unavailable or
  blocked storage degrades gracefully to session-only behavior with no error), and
  MUST NOT be read, written, or applied below the breakpoint; below the breakpoint the
  toggle MUST keep its exact current drawer behavior and appearance.
- **FR-010**: On desktop, the survey card header MUST present the step badge as a
  white-on-maroon-gradient `STEP N OF M` caps pill followed by an `R REQUIRED • O
OPTIONAL` caps count line, both updating on page change; below the breakpoint the
  existing eyebrow treatment is unchanged.
- **FR-011**: On desktop, the page icon MUST render as a bordered maroon tile anchored
  at the survey card header's top-right, using the page's `icon` key with the
  documented default-icon fallback for unknown keys; below the breakpoint the current
  inline icon treatment is unchanged.
- **FR-012**: On desktop, the shell MUST render below the survey card (a) a centered
  soft capsule reading `Palette —` followed by swatch-annotated chips `Maroon
primary`, `Metallic gold secondary`, `Warm cream tertiary`, and (b) a centered
  platform line `© {current year} Regional Survey Platform • Secured & Encrypted •
Dock Navigation Edition`, with the year computed at render time; swatches MUST be
  decorative and neither element may render below the breakpoint.
- **FR-013**: Prototype demo tooling remains excluded and MUST NOT be added: the
  Payload button/viewer, the dock JSON and Reset buttons, the `Draft saved`
  pill, the `Save draft` action, draft persistence, and the live elapsed-time
  counter. The main action row (Previous / Next / Submit), the progress card, and
  the completion summary are out of scope and MUST NOT change on any viewport.
- **FR-014**: Behavior MUST NOT change: survey JSON contract, answer values,
  validation messages and timing, navigation gating, in-session answer preservation
  (including across dock/rail/drawer changes), submission handling and payload, and
  completion flow all keep their existing contracts byte-for-byte. The single
  sanctioned exception is the desktop dock collapse preference of FR-009, which
  persists across reloads and must never touch answer, validation, or payload state.
- **FR-015**: Every new color, alpha, gradient, size, radius, and duration MUST
  resolve to a named token; the token and class contract documents MUST be extended
  (new sparkle texture, badge ring/disc, secure panel, step pill gradient, icon tile,
  caption, and footer surfaces) and the automated checks (literal-free values,
  contrast, documentation coverage, ordered scales) MUST be extended to them and
  passing.
- **FR-016**: Accessibility MUST hold on every new surface: WCAG 2.1 AA contrast for
  all added text (only existing verified roles plus any new verified pairs), state
  never conveyed by texture or swatch alone, decorative textures, swatches, and the
  monogram marked appropriately, keyboard-operable desktop toggle with visible focus,
  reduced-motion collapse for any entrance timing, and forced-colors safety (content
  complete when decorative layers are suppressed).
- **FR-017**: The enhancements MUST NOT add any network or third-party dependency:
  the sparkle tiles and any new glyphs MUST ship as self-contained assets (mask/data
  URIs), and the survey MUST remain fully usable offline.
- **FR-018**: The feature MUST apply to every catalog survey without per-survey code
  or configuration: all rendered copy and glyphs derive from existing survey fields
  (`title`, `version`, `pages`, `estimatedMinutes`, `icon`) or the static documented
  strings listed in FR-007, FR-008, and FR-012.
- **FR-019**: Desktop chrome MUST render left-to-right, consistent with the
  application's current LTR-only contract; RTL layout changes, mirroring acceptance,
  and Arabic copy are out of scope for this feature. New surfaces MUST use
  flow-relative layout properties so a future RTL mode is not blocked.

### Key Entities _(include if feature involves data)_

- **Desktop chrome**: The set of at-or-above-breakpoint-only surfaces introduced here
  (topbar toggle, header pill/tile, palette capsule, platform line) plus their shared
  gating rule against the dock breakpoint.
- **Dock identity block**: The expanded-dock header region — badge/monogram, live
  card, `Survey steps` label — and its desktop textures.
- **Step entry (desktop treatment)**: One survey page as shown in the desktop dock —
  number/check tile, title, `N questions • A/B done` line, mini bar, state cue.
- **Secure panel**: The bordered `Private & secure` region of the expanded desktop
  dock — shield tile, title, security copy.
- **Theme caption & platform line**: The reference's closing desktop copy — palette
  capsule with role swatches and the copyright platform line.
- **Dock presentation preference**: A device-local, desktop-only flag
  (expanded/collapsed) for the dock; defaults to expanded for first-time visitors and
  degrades to session-only when storage is unavailable; never consulted below the
  breakpoint.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A side-by-side review of the shipped desktop UI against
  `public/theme-preview.png` at 1440 px and 1024 px reports zero mismatches on every
  in-scope element: sparkle dock texture, circular gold monogram badge, live-card
  `sections • ~min • Encrypted` line, `Survey steps` label, `N questions • A/B done`
  step rows with reference state cues, `Private & secure` panel, `Maroon • Gold •
Cream Theme` caption, desktop topbar menu toggle, `STEP N OF M` pill with
  `R REQUIRED • O OPTIONAL`, bordered page-icon tile, palette capsule, and platform
  line.
- **SC-002**: At every width below the 64 rem breakpoint (including 320 px, 375 px,
  and 768 px), rendered pages are pixel-identical to the pre-change build (zero
  visual-regression differences) and all mobile interactions (drawer, pills, gating,
  answering, submit, completion) behave identically.
- **SC-003**: Across the desktop sweep from 1024 px to 1920 px and at 200% zoom,
  no horizontal page scrolling, clipped text, overlapping targets, or stranded
  control appears in any new or existing surface.
- **SC-004**: 100% of existing automated tests pass, the production build succeeds,
  and answer values, validation messages, navigation gating, and the submission
  payload are byte-for-byte identical to before the change for the same inputs; a
  reloaded desktop session restores the respondent's last dock mode with no visible
  expand-then-collapse flash.
- **SC-005**: The automated design-system checks pass for every new surface
  (literal-free token values, contrast per pair incl. any new pairs, documentation
  coverage), and every added text treatment passes WCAG 2.1 AA against its surface.
- **SC-006**: The desktop topbar toggle is fully keyboard operable with a visible
  focus indicator and an announced state change, every new/updated hit target
  measures at least 44 by 44 device-independent pixels, and with reduced motion
  enabled no new animation is perceptible while all added content remains available.

## Assumptions

- `public/theme-preview.png` is the authoritative desktop visual target for this
  feature; it is a capture of the same reference prototype (`public/index.html`) the
  current brand shipped from, so treatments consistent with that prototype but not
  visible in the capture (question-card internals, progress card, topbar pills) are
  intentionally out of scope.
- Demo tooling stays excluded by the user's decision: Payload viewer, dock JSON/Reset
  buttons, `Draft saved` pill, `Save draft` action/draft persistence, and the elapsed
  timer from the reference are not part of this enhancement.
- Copy provenance was left to reasonable default (user: "ignore it"): no survey JSON
  fields are added or required. New copy is static documented product copy
  (`Private & secure`, `Maroon • Gold • Cream Theme`, palette chip names, the
  platform line) or derives from existing survey fields (monogram initial from the
  title, counts from pages/questions, year computed at render). Reference-specific
  brand names (`GCC Insights`, `Resident Survey • 2026`) MUST NOT ship.
- The main action row keeps its current labels (`Previous`/`Next`/`Submit`) on all
  viewports; the reference's `Save draft` / `Continue` wiring is demo tooling.
- "Mobile" means every viewport below the existing 64 rem dock breakpoint; the
  breakpoint value itself does not change.
- The collapsed icon rail is desktop chrome but already matches its intended compact
  form; this feature adds nothing to it.
