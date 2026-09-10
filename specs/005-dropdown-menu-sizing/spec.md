# Feature Specification: Dropdown Menu UI Fix and Survey Question Sizing Contract

**Feature Branch**: `005-dropdown-menu-sizing`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "fix ui issue spicicly for the dropdown question menu and descrize the ui size hight and width for the suvey questions"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - An opened dropdown list is fully visible (Priority: P1)

A respondent answering a dropdown question taps the field and the option list opens on top
of the page. Every option in that list is visible and clickable, including when the
question sits in the middle of a page and later question cards are rendered underneath it.

**Why this priority**: This is the reported defect. Today the list is painted underneath
the next question card, so a respondent sees only the first two options and the rest are
unobtainable; the question cannot be answered reliably at all.

**Independent Test**: Can be fully tested by opening a dropdown that is followed by at
least two more question cards and confirming that the whole option list is drawn above
those cards, that each option row responds to pointer and keyboard selection, and that the
card holding the open list is the topmost card.

**Acceptance Scenarios**:

1. **Given** a survey page where a dropdown question is followed by other question cards,
   **When** the respondent opens the dropdown, **Then** the option list is painted above
   every following card and no option is obscured.
2. **Given** an open option list, **When** the respondent points at the last visible option
   row, **Then** that row is the element that receives the pointer, is highlighted on hover,
   and selecting it records the answer.
3. **Given** an open option list, **When** the respondent closes it or selects an option,
   **Then** the surrounding cards return to their normal stacking order and no layout shift
   is left behind.
4. **Given** the operating system asks for reduced motion, **When** the dropdown is opened,
   **Then** the list still appears above the following cards.

---

### User Story 2 - One size contract for every question control (Priority: P1)

A respondent sees answer controls that line up: the dropdown field is exactly as wide as
the other single-line answers, and exactly as tall as the text box above it, at every
supported viewport from 320 px to the widest desktop layout. Product owners and designers
can read the exact heights and widths of every question surface in one document instead of
measuring the running application.

**Why this priority**: The reported issue is a visual/sizing defect and the requested
deliverable is the written size description. Without a single documented size contract the
next control added re-introduces the mismatch.

**Independent Test**: Can be fully tested by rendering each question type side by side at
320 px, 375 px, 768 px, 1280 px, and 1440 px and comparing measured heights and widths
against the documented size table, and by confirming that a dropdown field and a text box
in the same card measure the same height and width.

**Acceptance Scenarios**:

1. **Given** any survey page, **When** it renders, **Then** the dropdown field and the
   single-line text box in the same card have identical height and width at every supported
   viewport.
2. **Given** the documented size contract, **When** a reviewer measures the running
   application at the documented breakpoints, **Then** every measured height and width is
   within 1 px of the documented value.
3. **Given** a 320 px-wide viewport, **When** the page renders, **Then** no survey surface
   (panel, card, field, or option list) extends past the viewport and the page does not
   scroll horizontally.
4. **Given** the documented size contract, **When** a size changes in the future, **Then** a
   failed automated check names the surface whose size no longer matches the contract.

---

### User Story 3 - The open option list stays inside the screen (Priority: P2)

A respondent opening a dropdown with many options, or opening one near the bottom of a
short viewport, still reaches every option: the option list scrolls inside a bounded panel
that fits the screen instead of running off the page.

**Why this priority**: Bounded scrolling is what makes the fix hold for long lists and
laptop screens; it is lower priority than making the list visible at all.

**Independent Test**: Can be fully tested by opening a dropdown with more options than fit
in the bounded panel on a short viewport and confirming the list scrolls inside the panel,
the panel stays within the viewport, and a filtered (short) list shrinks the panel instead
of leaving empty space.

**Acceptance Scenarios**:

1. **Given** a dropdown with more options than the bounded list height, **When** the list
   opens, **Then** the panel is capped at the documented maximum height and the option list
   scrolls inside it, showing a partially cut option as the scroll cue.
2. **Given** a dropdown with few options on a short viewport, **When** the list opens,
   **Then** the panel is only as tall as its content and never taller than the documented
   ceiling.
3. **Given** a dropdown opened near the bottom of the viewport where the panel does not fit
   below the field, **When** the option list opens, **Then** the panel is drawn above the
   field, fully inside the viewport, with the option rows still reachable.
4. **Given** a viewport shorter than the documented ceiling, **When** the list opens,
   **Then** the ceiling is lowered to the room available on the chosen side and the list
   scrolls inside the trimmed panel.
5. **Given** a long option label, **When** the list opens, **Then** the label is truncated
   inside the row instead of widening the panel beyond the field.

---

### User Story 4 - Documented size contract for survey questions (Priority: P2)

A team member can read one contract document that states the height and width of every
survey question surface — page panel, question card, prompt, single-line answer, choice
row, tile, toggle, file input, and the dropdown field and option panel — with the token
that drives each value and the measured value at each documented breakpoint.

**Why this priority**: The size description is what keeps the fix from regressing; it is
enforced by the automated checks in the existing design-system contract.

**Independent Test**: Can be fully tested by reading the size contract document and
confirming that every shipped size token and every question surface in the survey appears
in the tables with a token reference and a measured value, and that a new size token added
without documentation fails the automated contract check.

**Acceptance Scenarios**:

1. **Given** the size contract document, **When** a reader looks up the dropdown option
   panel, **Then** its width rule, its maximum height rule, its minimum option row height,
   and the measured values at 320 px, 375 px, 768 px, 1280 px, and 1440 px are all stated.
2. **Given** the size contract document, **When** a reader looks up any other question
   type, **Then** the height and width of its answer control and of its card are stated.
3. **Given** a new size token or a changed size token, **When** the checks run, **Then**
   the documentation check fails until the contract document is updated.

### Edge Cases

- What happens at a 320 px viewport? No surface may extend past the viewport, the page must
  not scroll horizontally, and the option list must still show at least three option rows.
- What happens on a short landscape viewport (for example 800 × 420)? The panel ceiling must
  follow the viewport height so the panel remains fully visible.
- What happens when the respondent zooms the page to 200%? Sizes are expressed relative to
  the root font size, so controls, cards, and the option panel scale together and no text is
  clipped.
- What happens when the operating system requests reduced motion? The entrance animation of
  a card must not keep a transform on the card once the animation has finished.
- What happens when filtering leaves no matches? The panel shows the empty message inside
  the same bounded box and does not grow or jump.
- What happens when the option list is opened, then the page is re-rendered (navigation)?
  The panel closes and the card returns to its resting stacking order.
- What happens when an optional answer is cleared? Only the field state changes; the panel
  geometry and the documented sizes are unaffected.
- What happens when an option label is longer than the field? The label truncates inside the
  row and keeps the panel exactly as wide as the field.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: An open dropdown option list MUST be painted above every following question
  card, and the card that owns the open list MUST be the topmost card on the page.
- **FR-002**: Every option row of an open list MUST be reachable with the pointer and by
  keyboard navigation; no option row may be covered by another element on the page.
- **FR-003**: The dropdown field MUST be styled as a fixed-geometry control anchored to the
  field: absolute placement relative to the field, zero offset (the panel touches the field
  bottom edge, separated only by the field border) and the same width as the field.
- **FR-004**: The dropdown field, the single-line text answer, and every other single-line
  answer control MUST resolve to one shared control height, derived from the same padding,
  line height, and border steps, so their heights are identical at every supported viewport.
- **FR-005**: The option list MUST have a bounded viewport height and MUST scroll inside the
  panel when it holds more options than fit.
- **FR-006**: The whole option panel (search field plus option list) MUST be capped by a
  maximum height that also respects the viewport height, so the panel always fits the screen
  on short viewports; when the panel does not fit below the field and there is more room
  above it, the panel MUST open upwards instead of running off the screen.
- **FR-007**: Each option row MUST be at least as tall as the minimum touch target, and the
  list MUST show at least three option rows before scrolling at the smallest supported
  viewport.
- **FR-008**: The panel MUST NOT extend past the viewport horizontally at any supported
  viewport, and long option labels MUST truncate inside their row instead of widening the
  panel.
- **FR-009**: The panel's minimum height MUST shrink with its content; the empty-filter
  state MUST use the same bounded box as a short list.
- **FR-010**: No survey surface (page panel, question card, field, or option panel) may
  cause horizontal page scrolling from 320 px up to the maximum supported width.
- **FR-011**: A question card MUST end its entrance animation at zero displacement (identity
  transform) so nothing is clipped or offset, and the card that owns an open option panel
  MUST be lifted above its sibling cards through the layering token rather than by paint
  order; under reduced motion the entrance travel MUST be zero.
- **FR-012**: The design system MUST expose the sizing decisions above as named tokens
  (shared control height, option-list viewport, panel ceiling, option minimum height,
  active-card layer) and no component may use a literal size for them.
- **FR-013**: The size contract document MUST state, for every question surface, the token
  that drives its height and width plus the measured value at 320 px, 375 px, 768 px,
  1280 px, and 1440 px.
- **FR-014**: An automated check MUST fail when a documented size token is removed, when a
  shipped size token is undocumented, when a raw literal size is used for these surfaces, or
  when a documented measured value no longer matches the shipped derivation.
- **FR-015**: Existing survey behavior (question rendering, answer values, validation,
  navigation, submission, and JSON-driven configuration) MUST NOT change; this feature
  changes geometry and documentation only.

### Key Entities _(include if this feature involves data)_

- **Size contract entry**: One survey surface (page panel, question card, answer control,
  option panel, option row) with the token that drives its height and width, the derivation
  of that value, and the measured value per documented breakpoint.
- **Open panel layer**: The stacking arrangement while an option list is open — the owning
  card is lifted, the panel is positioned against the field, and sibling cards stay below.
- **Control height**: The single height every single-line answer control resolves to,
  derived from two padding steps, one control line box, and the control borders.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of option rows in an open dropdown list are hit-testable at 320 px,
  375 px, 768 px, 1280 px, and 1440 px viewports (measured by pointing at each row and
  confirming the row receives the pointer).
- **SC-002**: A dropdown field and a single-line text answer measure identical height and
  width in the same card, with a difference of at most 1 px, at all five documented
  viewports.
- **SC-003**: The open option panel never exceeds the documented maximum height, and it
  stays inside the viewport with zero horizontal overflow at all five documented viewports,
  including a 320 × 640 and an 800 × 420 viewport, in both opening directions.
- **SC-004**: At the smallest supported viewport (320 × 640) the option list shows at least
  three fully visible option rows before scrolling, at least two stay fully visible on the
  shortest supported viewport (800 × 420), every option row is at least 44 px tall, and
  every row (including those scrolled out of view) is reachable by scrolling the list.
- **SC-005**: The size contract document covers 100% of the shipped size tokens and question
  surfaces listed in FR-013, and the documentation check fails when a shipped size token is
  undocumented.
- **SC-006**: Existing automated tests and the production build continue to pass, and the
  survey's answer values, validation messages, and navigation behave exactly as before.

## Assumptions

- The defect and the size description are one feature because the size contract is what the
  fix is verified against; the documented numbers were measured from the current running
  survey at the five documented breakpoints.
- The option panel overlays page content (no scrolling of the page is required to reach an
  option). When there is no room below the field and the viewport is shorter than the panel
  ceiling, the panel opens upwards and trims its ceiling to the room available, so the list
  always stays on screen.
- The closed dropdown keeps the empty state documented by the dropdown question type (no
  placeholder text); this feature does not change that decision.
- Sizes are expressed in root-relative units so browser zoom scales the whole geometry.
- Touch target, contrast, focus, and reduced-motion rules from the design system contract
  continue to apply unchanged; this feature only adds the geometry they must fit into.
- The size numbers are documentation, not configuration: they are derived from design
  tokens and verified by the automated check plus the documented manual measurements.
