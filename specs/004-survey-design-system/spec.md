# Feature Specification: Survey Design System

**Feature Branch**: `004-survey-design-system`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "Implement a modern, responsive survey Design System with a premium UI/UX, including accessible typography, color tokens, spacing system, cards, progress indicators, animated transitions, validation states, mobile-first layouts. Use the attachment as reference." Clarification (2026-09-10): maroon remains the primary brand color with documented secondary and tertiary color options; the deliverable is the token layer plus base styles, utility classes, and component classes (existing Angular components keep their current structure); a light theme only.

## Clarifications

### Session 2026-09-10

- Q: Which color should lead the product — the maroon brand color already documented in the project, or the vivid blue used for selected answers in the reference attachment? → A: Maroon stays the primary brand color and MUST be available as a role; the reference blue becomes the secondary color role and is used for selected answers and focus, and the reference pink becomes the tertiary color role used for the page canvas. All three roles MUST be usable independently.
- Q: How far should the design system reach into the application? → A: Deliver the token layer (color, typography, spacing, radius, elevation, motion) plus base styles, utility/composition classes, and component classes. Existing Angular component structure (templates, inputs, outputs, state) MUST NOT be restructured; the design system changes how the application looks, not how it behaves.
- Q: Should a dark theme be included? → A: No. A single light theme is in scope; tokens MUST be organized so a dark theme can be added later without renaming.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Foundations and brand roles (Priority: P1)

A product or feature team building any survey screen uses one documented set of design
tokens — color roles, typography scale, spacing scale, radii, elevation, and motion — so
that every screen looks like it belongs to the same product without re-inventing values.
The three color roles are independently usable: the maroon primary brand role, the
secondary role used for selected answers and focus, and the tertiary role used for the
page canvas.

**Why this priority**: Every other part of the design system (cards, progress indicators,
validation states, animation) consumes these decisions. Without a single token source,
later work re-creates inconsistent one-off values, which is exactly the problem the
feature exists to solve.

**Independent Test**: Can be fully tested by inspecting the token layer and rendering the
survey: the surface beneath the survey panel uses the tertiary canvas role, headings use
the display type role, prompts/body text use the text type role, and every color,
spacing, radius, elevation, and duration value used by the survey resolves to a named
token instead of a literal value.

**Acceptance Scenarios**:

1. **Given** the token layer is loaded, **When** any part of the application needs a
   color, **Then** it references a named semantic role (canvas, surface, text, border,
   accent/primary, secondary selection, tertiary canvas, success, warning, danger,
   focus) rather than a raw value.
2. **Given** the maroon primary, secondary, and tertiary roles, **When** each is applied
   to the survey, **Then** the primary brand role drives brand chrome, the secondary role
   marks selected answers and focus, and the tertiary role paints the page canvas —
   each role remains usable on its own.
3. **Given** a designer changes a single primitive value (for example the canvas pink),
   **When** the application is rebuilt, **Then** every element derived from that value
   updates without any component change.
4. **Given** the type scale, **When** the survey is rendered at desktop, tablet, and
   mobile widths, **Then** headings, question prompts, body text, and helper text keep
   their hierarchy and remain legible without horizontal scrolling.

---

### User Story 2 - Question cards and answer controls (Priority: P1)

A respondent answering a survey sees each question presented in a clear card on a calm
canvas: a readable prompt, generous spacing, large comfortable answer targets, an obvious
selected state, and immediate, visible feedback when an answer is missing.

**Why this priority**: This is the core of every survey response. Answering is where the
product's value is created, and the reference attachment is primarily a specification of
this experience.

**Independent Test**: Can be fully tested by rendering a survey page and interacting with
every question type: each question appears in its own card, the prompt is legible, each
control has a visible hover, focus, and selected state, tiles meet the minimum touch
target size, and a validation message appears with visible error styling when a required
question is left unanswered while navigating.

**Acceptance Scenarios**:

1. **Given** a survey page with several question types, **When** the page renders, **Then**
   each question is presented in its own card with a consistent prompt treatment and
   spacing between cards.
2. **Given** a rating or satisfaction question, **When** the respondent hovers, focuses,
   or selects a tile, **Then** the tile shows a distinct hover, focus-visible, and
   selected state, and the selected state is not communicated by color alone.
3. **Given** a single-select or multi-select question, **When** the page renders at
   desktop width, **Then** options flow in multiple columns; at mobile width the options
   stack into one column without clipping or horizontal scroll.
4. **Given** a required question left unanswered, **When** the respondent attempts to
   continue, **Then** the question card shows an error state (message, icon and error
   border/tint) that is announced to assistive technology, and the input is flagged
   invalid.
5. **Given** a question that has been answered, **When** the respondent reviews the page,
   **Then** the card shows a non-color-only "answered" cue (icon or text) in addition to
   any color change.

---

### User Story 3 - Progress indicators and navigation (Priority: P2)

A respondent always knows where they are and how much is left. Progress and step
navigation are visible, readable, and usable with touch, mouse, and keyboard.

**Why this priority**: Completion rate depends on respondents trusting that the survey is
finite and that they can move around. It is lower priority than the answer controls only
because the survey remains usable without it.

**Independent Test**: Can be fully tested by stepping through a multi-page survey and
confirming that the progress indicator advances, current/completed/upcoming steps are
distinguishable without color alone, and the same information is available on a narrow
mobile viewport.

**Acceptance Scenarios**:

1. **Given** a multi-page survey, **When** the respondent moves between pages, **Then**
   the progress indicator advances with a smooth transition and exposes its value to
   assistive technology.
2. **Given** the step indicator, **When** the respondent views it, **Then** the current
   step is marked as the current step, completed steps carry a non-color cue, and steps
   that cannot be reached yet are visibly disabled.
3. **Given** a mobile viewport, **When** the step list is collapsed, **Then** the progress
   indicator, current page, and remaining pages are still communicated.
4. **Given** a successfully submitted response, **When** the completion summary renders,
   **Then** completion is shown as 100% complete with a clear success state.

---

### User Story 4 - Motion and micro-interactions (Priority: P2)

The interface feels responsive and premium: panels and questions arrive with a short
entrance transition, controls respond to pointer and keyboard interaction, and progress
moves smoothly — while respondents who ask their system to reduce motion get an
effectively static experience.

**Why this priority**: Motion is a large part of the perceived quality described in the
attachment, but it must never come at the cost of accessibility, so it ships with a
mandatory reduced-motion counterpart rather than being optional polish.

**Independent Test**: Can be fully tested by enabling the operating system's
"reduce motion" preference, reloading the survey, and confirming that no entrance,
selection, or progress animation is perceptible while all states remain understandable.

**Acceptance Scenarios**:

1. **Given** a page or question renders, **When** it enters the viewport/state, **Then** it
   animates in with a short, non-blocking transition that finishes in under a second.
2. **Given** the operating system requests reduced motion, **When** any animation would
   run, **Then** durations collapse to an effectively instantaneous value and no movement
   or scaling occurs.
3. **Given** a respondent presses, selects, or clears a control, **When** the state
   changes, **Then** the change is confirmed by a short transition rather than an abrupt
   jump.

---

### User Story 5 - Themed third-party controls (Priority: P3)

Controls provided by the component library (the searchable dropdown and the on/off
toggle) look like the rest of the design system instead of default library styling.

**Why this priority**: These controls are already part of the survey, so consistency
matters, but they cover only two question types and the survey remains usable if they are
styled later.

**Independent Test**: Can be fully tested by opening the dropdown (closed, open, filtered,
cleared) and toggling the switch, and confirming that every visible part — field, overlay,
options, filter, clear affordance, and switch — uses design-system colors, radii,
typography, and focus treatment.

**Acceptance Scenarios**:

1. **Given** a dropdown question, **When** the control is rendered, opened, filtered, and
   cleared, **Then** the field, overlay, option list, filter input, and empty state use
   design-system tokens.
2. **Given** an on/off toggle question, **When** it is rendered in both states, **Then**
   the switch uses the design-system selection color for the on state and remains
   keyboard operable with a visible focus ring.

---

### Edge Cases

- What happens when the operating system requests reduced motion? All entrance, selection,
  progress, and overlay transitions MUST collapse to an effectively instantaneous
  duration; no information may depend on animation.
- What happens when the browser does not support the newest CSS selectors used for
  validation state? The validation message itself MUST remain visible and readable; only
  the optional error tinting of the surrounding card may be lost.
- What happens when text is zoomed to 200% or the viewport is very narrow (320 px)? Cards,
  tiles, and the step rail MUST reflow to a single column without clipping, overlapping,
  or horizontal page scrolling.
- What happens when a respondent uses only a keyboard? Every control MUST show a visible
  focus indicator that meets non-text contrast requirements and reaches the minimum
  target size.
- What happens when the user's operating system forces high contrast or a light/dark
  preference? The light theme MUST remain the rendered theme; a system-forced color
  scheme MUST NOT produce unreadable text or invisible controls.
- What happens when a question has no answer yet, is optional, or is cleared? No error
  state may be shown for an untouched optional question, and clearing an optional answer
  MUST return the control to its resting state.
- What happens when a survey renders with no pages or a single page? Progress and step
  indicators MUST degrade gracefully (0% or 100%) without dividing by zero or rendering an
  empty rail.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The design system MUST define color tokens in two tiers: raw primitive
  palettes and semantic roles (canvas, surface, surface-muted, text primary/secondary/
  muted, border, accent/primary, accent-strong, secondary selection, tertiary canvas,
  success, warning, danger, focus) so that components never reference raw values.
- **FR-002**: The design system MUST expose three independently usable brand color roles:
  a maroon primary role, a secondary role used for selected answers and focus, and a
  tertiary role used for the page canvas, and MUST document where each role is used.
- **FR-003**: Every text/background combination shipped by the design system MUST meet
  WCAG 2.1 AA contrast (at least 4.5:1 for normal text, 3:1 for large text and UI
  boundaries), and this MUST be verifiable by an automated check rather than by review
  alone.
- **FR-004**: The design system MUST define a typographic scale with a display/serif role
  for survey titles, a text role for prompts and body copy, a supporting role for help and
  status text, and a numeric role for ratings; sizes MUST be expressed fluidly so the
  scale adapts between mobile and desktop without breakpoint-specific overrides.
- **FR-005**: The design system MUST define a spacing scale on a single base unit, plus
  radii, elevation, and motion tokens (durations and easings), and every layout rule in
  the survey MUST consume those tokens rather than literal values.
- **FR-006**: The design system MUST provide a card component class with variants
  (panel, question, raised), padding steps, and states (interactive, answered, invalid,
  complete) so that the survey panel, navigation panel, and question cards are built from
  one primitive.
- **FR-007**: The design system MUST provide a progress indicator that exposes its value
  to assistive technology, animates changes, and supports both a full (labelled) and a
  compact (mobile rail) presentation.
- **FR-008**: The design system MUST provide a step indicator in which the current,
  completed, and upcoming states are distinguishable without relying on color alone, and
  in which unavailable steps are rendered as disabled controls.
- **FR-009**: The design system MUST provide validation state styling for fields and cards:
  a distinct resting, focus, answered/valid, and invalid appearance for inputs, tiles,
  choice controls, and file inputs, plus an announced message treatment for errors.
- **FR-010**: Validation and error states MUST be conveyed by at least two of {color,
  icon, text}, and error styling MUST appear only after validation has actually run for
  that question.
- **FR-011**: All interactive controls MUST have a visible focus indicator with at least
  3:1 contrast against the adjacent background, and pointer/touch targets MUST be at least
  44 by 44 device-independent pixels.
- **FR-012**: Layouts MUST be authored mobile-first: a single-column experience on small
  viewports that progressively enhances to the multi-column desktop layout, with no
  horizontal page scrolling from 320 px up to the maximum supported width.
- **FR-013**: The design system MUST define motion tokens and apply entrance, state-change,
  and progress transitions through them, with a global reduced-motion rule that collapses
  all design-system durations and disables transform-based movement.
- **FR-014**: The design system MUST theme library-provided controls (searchable dropdown
  and on/off toggle) by mapping the library's own styling variables to design-system
  tokens so that library internals stay consistent with the rest of the product.
- **FR-015**: The design system MUST document every shipped token and class (name, value,
  and intended use) in a contract document, and MUST ship an automated check that the
  literal-value-free rule (FR-001/FR-005) and the contrast rule (FR-003) hold.
- **FR-016**: The light theme MUST remain the rendered theme regardless of the user's
  system color-scheme preference, while tokens MUST be organized so a dark theme could be
  added later without renaming any token.
- **FR-017**: Existing survey behavior (page navigation, answer preservation, validation
  timing, submission, and the JSON-driven question contract) MUST NOT change; the design
  system changes appearance only.

### Key Entities _(include if feature involves data)_

- **Primitive token**: A raw, context-free value (for example a specific pink or a
  neutral step) referenced only by semantic tokens.
- **Semantic token**: A named role (canvas, surface, text, border, accent, selection,
  success, warning, danger, focus) that maps to one primitive and is the only thing
  components reference.
- **Scale**: An ordered set of related tokens (spacing, type sizes, radii, durations) with
  a documented base unit and step rule.
- **Component class contract**: A documented, reusable class (card, button, field, choice,
  tile, progress, step, alert) with its variants, states, and required minimum markup
  hooks.
- **Design-system check**: An automated verification of the token contract (contrast,
  scale monotonicity, and absence of hard-coded values outside the primitive layer).

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of color, spacing, radius, elevation, and duration declarations in the
  shipped survey styles resolve to a named design token; a check fails the build if a raw
  color or spacing value appears outside the primitive/token layer.
- **SC-002**: Automated contrast checks pass for every text/background token pair shipped
  by the design system, and all interactive focus indicators meet at least 3:1.
- **SC-003**: The full survey flow (load, answer every question type, navigate, submit,
  view completion) can be completed at 320 px, 768 px, and 1440 px widths with no
  horizontal scrolling and no clipped control.
- **SC-004**: With reduced motion enabled, no design-system animation is perceptible, and
  every state remains distinguishable.
- **SC-005**: Every interactive target in the survey measures at least 44 by 44
  device-independent pixels.
- **SC-006**: The design-system token and class contract document covers 100% of the
  tokens and classes exported by the design system; an automated check fails when a token
  is added without documentation.
- **SC-007**: Existing automated tests continue to pass and the production build succeeds,
  demonstrating that appearance-only changes did not alter behavior.

## Assumptions

- The attachment (`public/theme-preview.png`) is the visual reference: a soft pink canvas
  sampled at `#fbafbc`, a white panel, a serif display title, muted gray question prompts,
  large neutral answer tiles with a vivid blue selected state (`#1524d9`), multi-column
  option flows, and a satisfaction scale of icon tiles.
- The maroon brand color (`#800000`) documented in the project constitution remains the
  primary brand role; the reference blue becomes the secondary selection role and the
  reference pink the tertiary canvas role, as clarified on 2026-09-10.
- Typography uses system font stacks (a serif display stack and a UI sans stack) so no new
  network dependency or downloaded font is introduced; the environment must remain usable
  offline.
- Only a light theme is produced; the application renders light even when the operating
  system requests a dark color scheme.
- The design system is delivered as tokens, base styles, and CSS class contracts consumed
  by the existing survey components; Angular component structure, inputs/outputs, and
  application logic are unchanged.
- PrimeNG (the existing component library dependency) is themed through its own styling
  variables; no new dependency, theme package, or CSS framework import is added.
- Automated verification is limited to what can be checked without a rendering browser
  (token parsing, contrast math, scale rules, documentation coverage); visual and
  interaction checks are performed manually through the documented quickstart steps.
