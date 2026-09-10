# Feature Specification: Survey Dock Brand (GCC Maroon · Gold · Cream)

**Feature Branch**: `006-survey-dock-brand`

**Created**: 2026-09-10

**Status**: Draft

**Input**: User description: "new survey brand as "public/index.html""

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Survey wears the GCC dock brand (Priority: P1)

Any respondent opening any survey sees one coherent GCC brand: a warm cream canvas with
a fading dot pattern and two soft ambient color fields, white elevated panels, maroon
chrome and primary actions, metallic gold accents, and a single sans typeface with bold
headings. A designer can change one brand value (for example the gold) and every surface
derived from it updates without touching any survey content or structure.

**Why this priority**: This is the requested deliverable — the whole survey product must
look like the reference. Every other story (dock, chrome, questions, summary) consumes
these brand decisions.

**Independent Test**: Can be fully tested by opening each survey in the catalog and
confirming the canvas, panels, headings, body text, buttons, and focus treatment all
use the three documented brand roles, and that no survey content or answer behavior
changed.

**Acceptance Scenarios**:

1. **Given** any survey in the survey catalog, **When** it renders, **Then** the page
   canvas uses the cream tertiary role with the dot pattern and ambient fields, panels
   are white and elevated, brand chrome and primary actions use the maroon primary role,
   and accents/selection highlights use the metallic gold secondary role.
2. **Given** the brand value layer, **When** a single primitive value is changed,
   **Then** every surface derived from that value updates without any survey content or
   structural change.
3. **Given** the existing surveys, **When** the brand is applied, **Then** questions,
   answers, validation timing, navigation rules, and submission behave exactly as
   before — only appearance and the navigation layout change.

---

### User Story 2 - Dock sidebar navigation (Priority: P1)

A respondent always sees where they are through a fixed left dock: a brand header with
a live-survey card, one step button per survey page showing answered counts and a mini
progress bar, and a footer with a progress ring, percentage, status text, and linear
bar. On desktop the dock collapses to a narrow icon rail; on mobile it becomes a slide-
in drawer over a dimmed backdrop. Steps already reached can be revisited; steps ahead
stay gated by the existing validation rules.

**Why this priority**: The dock is the signature layout of the reference — without it
the product does not read as the new brand, and respondents lose their sense of place
in multi-page surveys.

**Independent Test**: Can be fully tested by stepping through a multi-page survey on
desktop and mobile: the dock shows one entry per page with live counts, collapsing and
opening the dock preserves answers and position, the ring percentage equals answered
questions over total questions, and forward steps remain gated exactly as before.

**Acceptance Scenarios**:

1. **Given** a multi-page survey on desktop, **When** it renders, **Then** the dock
   shows a brand header, a live-survey card, one step button per page (state tile,
   title, answered counts, mini progress bar, status cue), and a footer with progress
   ring, percentage, status text, and linear bar.
2. **Given** the expanded dock, **When** the respondent collapses it, **Then** it
   narrows to an icon rail showing step numbers and a compact progress readout, and
   expanding it again restores the full dock without losing answers or position.
3. **Given** a mobile viewport, **When** the respondent opens the steps menu, **Then**
   the dock slides in as a drawer over a dimmed backdrop, and closing it (close
   control, backdrop, or Escape) returns to the survey untouched.
4. **Given** the step buttons, **When** the respondent views active, completed, and
   not-yet-reached steps, **Then** each state is distinguishable without relying on
   color alone (number tile, check mark, border, label, or icon), and unreachable
   steps are visibly disabled.
5. **Given** answers are recorded or cleared, **When** the dock re-renders, **Then**
   the ring percentage, status text, per-step counts, and mini progress bars all agree
   with the actual answered-over-total state.

---

### User Story 3 - Topbar, progress card, and survey card chrome (Priority: P2)

A respondent gets consistent chrome around every page: a sticky blurred topbar with a
menu toggle, a breadcrumb (`Survey / Step N — Page title`), and the survey title, plus
a compact step-pill strip on mobile; a progress card (page indicator, percent complete,
gradient progress bar, answered count); and a survey card with a gradient header (step
badge, required/optional counts, page title, description, page icon) and a footer with
Back / Continue / Submit actions.

**Why this priority**: The chrome frames every question and carries progress and
navigation; it is lower priority than the brand foundation and the dock only because
the survey remains answerable without it.

**Independent Test**: Can be fully tested by paging through a survey at desktop and
mobile widths and confirming the topbar stays visible while scrolling, the breadcrumb
and step badge track the current page, the progress card advances, Back is hidden on
the first page, and the gold submit action appears on the last page.

**Acceptance Scenarios**:

1. **Given** any survey page, **When** the respondent scrolls, **Then** the topbar
   remains visible with the menu toggle, current-step breadcrumb, and survey title.
2. **Given** a mobile viewport, **When** the page renders, **Then** a compact step-
   pill strip shows every step with the current, completed, and upcoming states
   distinguishable without color alone.
3. **Given** the progress card, **When** the respondent moves between pages, **Then**
   the page indicator, percent complete, gradient bar, and answered count all update
   and expose their values to assistive technology.
4. **Given** the survey card header, **When** a page renders, **Then** it shows the
   step badge, the count of required and optional questions, the page title and
   description from the survey definition, and the page icon.
5. **Given** the survey card footer, **When** the respondent is on the first page,
   **Then** no Back action is shown; on the last page the Continue action is replaced
   by the gold Submit action; on middle pages Back and Continue are both available.

---

### User Story 4 - Branded questions, answers, and validation feedback (Priority: P2)

A respondent answers questions presented as cards on the cream canvas: a numbered
badge, a required marker or an "optional" pill, helper text where defined, large
comfortable answer targets with a clear selected state, and immediate visible feedback
when an answer is missing. All supported question types — single-select, multi-select,
single-line text, long text, star rating, satisfaction scale, on/off toggle,
searchable dropdown, and file attachments — wear the brand, not just the subset shown
in the reference prototype.

**Why this priority**: Answering is where the product's value is created. The reference
shows the treatment, but the shipped brand must cover every question type the survey
contract supports, or the product looks half-branded.

**Independent Test**: Can be fully tested by rendering a survey containing every
question type and interacting with each: every question appears in its own card with
the branded prompt treatment, each control shows distinct hover, focus, and selected
states, and leaving a required question unanswered surfaces an error message with an
error border/tint that is announced to assistive technology.

**Acceptance Scenarios**:

1. **Given** a survey page with several question types, **When** the page renders,
   **Then** each question is presented in its own card with a number badge, required
   marker or optional pill, helper text where defined, and consistent spacing between
   cards.
2. **Given** a choice question, **When** the respondent hovers, focuses, or selects an
   option, **Then** the option shows a distinct hover (lift plus gold border), focus,
   and selected (maroon border, tinted fill, check badge) state, and selection is not
   communicated by color alone.
3. **Given** a star rating or satisfaction scale, **When** the respondent selects a
   value, **Then** the selected symbols use the gold role with a textual readout of
   the value (for example `4 / 5 — Good`), and the readout is exposed to assistive
   technology.
4. **Given** a text, long-text, dropdown, toggle, or file control, **When** it
   renders and receives focus, **Then** it uses the brand's field treatment with a
   visible maroon focus ring; the file dropzone shows its dashed resting, hover, and
   active states, and attached files render as success rows with a remove action.
5. **Given** a required question left unanswered, **When** validation runs for that
   question, **Then** the card shows an error state (message, icon, and error border/
   tint) that is announced to assistive technology, and attempting to continue past
   the page surfaces a toast explaining what is missing.
6. **Given** an optional question that is untouched or cleared, **When** it renders,
   **Then** no error state is shown and the control rests in its default appearance.

---

### User Story 5 - Branded completion summary (Priority: P3)

After a successful submission the editable survey is replaced by a branded completion
summary: a success medallion, a clear success message with `100% complete`, summary
tiles derived from the submitted survey definition and answers (generic, not hard-
coded to any one survey), and an action to start a new response. A short celebration
plays only when the respondent's system allows motion.

**Why this priority**: The summary is the last impression of the brand and confirms
the response was recorded; it is lower priority because submission already succeeds
without it.

**Independent Test**: Can be fully tested by submitting a complete survey and
confirming the summary shows the medallion, the success message, `100% complete`,
tiles reflecting that survey's own questions and answers, and a working new-response
action — and that with reduced motion requested, no celebration movement is
perceptible.

**Acceptance Scenarios**:

1. **Given** a successfully submitted response, **When** the completion summary
   renders, **Then** it shows a success medallion, a clear success message, `100%
complete`, and summary tiles derived from the submitted survey's questions and
   answers.
2. **Given** the completion summary, **When** the respondent starts a new response,
   **Then** a fresh editable survey begins with no answers carried over.
3. **Given** the operating system requests reduced motion, **When** the summary
   renders, **Then** no celebration movement is perceptible while the success state
   remains unmistakable.

### Edge Cases

- What happens at a 320 px viewport? The dock is a drawer capped at 88% of the
  viewport width, cards and option flows reflow to one column, and the page never
  scrolls horizontally.
- What happens on a short landscape viewport? The dock's step region and the page
  scroll independently, the topbar stays reachable, and no action is stranded off
  screen.
- What happens when the page is zoomed to 200%? Chrome, cards, and controls reflow
  together with no clipped text or overlapping targets.
- What happens when a respondent uses only a keyboard? The dock toggle, step buttons,
  drawer, all answer controls, and footer actions are reachable with a visible focus
  indicator, and Escape closes the drawer.
- What happens when the operating system requests reduced motion? Dock transitions,
  entrance movement, button sheen, progress tweens, and celebration collapse to an
  effectively static experience; no information depends on animation.
- What happens when the operating system forces high contrast or a dark scheme? The
  light brand theme remains the rendered theme and text/controls stay readable.
- What happens with a single-page survey? The dock shows one step, progress degrades
  gracefully, and Back is never shown.
- What happens with very long survey, page, or option titles? Text truncates or wraps
  inside its container and never breaks the dock, topbar, or card layout.
- What happens when a survey definition is invalid? The existing user-visible error
  is shown; no half-branded or partially rendered survey appears.
- What happens when an answer is cleared after being set? Dock counts, ring, bars,
  and card cues all return to the unanswered state with no error styling on optional
  questions.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The brand MUST be defined as three independently usable color roles — a
  maroon primary role (`#800020` scale) for chrome, primary actions, active states,
  and error accents; a metallic gold secondary role (`#d4af37` scale) for highlights,
  selection accents, satisfaction symbols, and the submit action; and a warm cream
  tertiary role (`#faf7f2` scale) for the page canvas and soft fills — with a
  documented usage map stating where each role is used.
- **FR-002**: The page canvas MUST use the cream role with the reference's fading dot
  pattern and two soft ambient color fields (maroon and gold); survey panels MUST be
  white elevated surfaces above it.
- **FR-003**: Brand typography MUST use one sans family for all survey text with an
  extrabold heading treatment, documented size/weight/line-height roles for titles,
  prompts, body, helper, and pill/label text that stay legible from 320 px to desktop
  widths without horizontal scrolling.
- **FR-004**: The dock MUST be fixed to the left on desktop at 322 px expanded and
  96 px collapsed (icon rail with compact progress readout), switching with a short
  transition; on viewports below 1024 px it MUST render as a slide-in drawer 330 px
  wide (capped at 88% of viewport width) over a dimmed blurred backdrop, with the
  step region scrolling independently.
- **FR-005**: The dock header MUST show the brand mark, the survey title, a
  live-survey card (survey title, section count, estimated time from the survey
  definition), and collapse/close controls appropriate to the viewport.
- **FR-006**: The dock step navigation MUST render one button per survey page with a
  state tile (step number, or a green tile with a check when complete), the page
  title, answered/total counts, a mini progress bar, and a status cue; the active
  step MUST carry the gold-bordered highlighted treatment, and all three states MUST
  be distinguishable without relying on color alone.
- **FR-007**: The dock footer MUST show a circular progress ring with the overall
  percentage, a status line, the current step position, and a linear progress bar;
  the percentage MUST equal answered questions over total questions across the
  survey, and the status copy MUST follow documented completion bands.
- **FR-008**: The topbar MUST be sticky with a blurred cream treatment showing the
  menu toggle, the `Survey / Step N — Page title` breadcrumb, and the survey title;
  on mobile it MUST additionally show the compact step-pill strip from story 3.
- **FR-009**: The progress card MUST show the page indicator pill, the percent-
  complete readout, the maroon-to-gold gradient progress bar, and the answered count,
  all updated on navigation and answer changes and exposed to assistive technology.
- **FR-010**: The survey card MUST have a gradient header (step badge, required/
  optional question counts, page title, page description, page icon), the question
  list, and a footer whose actions follow story 3 scenario 5, with the maroon
  gradient Continue treatment (including its sheen sweep on hover) and the gold
  gradient Submit treatment.
- **FR-011**: Every supported question type and the file attachment control MUST wear
  the brand treatments from story 4 (cards, option hover/selected/check badge, gold
  symbols with textual readout, maroon focus rings, dropzone states, attached-file
  success rows with remove actions) — including types the reference prototype does
  not demonstrate (satisfaction scale, on/off toggle).
- **FR-012**: Validation presentation MUST show the error message with icon and the
  card error border/tint only after validation has run for that question, MUST
  announce errors to assistive technology, and MUST surface a toast when navigation
  is blocked or when an action succeeds.
- **FR-013**: The completion summary MUST show the success medallion, the success
  message, `100% complete`, summary tiles derived from the submitted survey's own
  questions and answers (never hard-coded fields), and a new-response action; any
  celebration MUST be motion-preference safe.
- **FR-014**: Layouts MUST be authored mobile-first — one column on small viewports,
  enhancing to the docked desktop layout — with content width caps matching the
  reference and no horizontal page scrolling from 320 px up to the maximum supported
  width.
- **FR-015**: Accessibility rules from the existing design-system contract MUST hold
  for every new surface: WCAG 2.1 AA text contrast, 3:1 for interactive borders,
  focus rings, and selection fills, 44 px minimum targets, visible focus, state never
  conveyed by color alone, a single light theme regardless of system scheme, and a
  global reduced-motion collapse.
- **FR-016**: The shipped brand MUST NOT add render-blocking third-party network
  dependencies: the prototype's CDN fonts, icon font, and celebration script MUST be
  matched with self-hosted or system equivalents, and the survey MUST remain fully
  usable offline.
- **FR-017**: The JSON-driven contract MUST NOT change: survey definitions, the
  survey manifest, answer values, and the submission payload keep their existing
  shapes, and the brand applies to every catalog survey without per-survey code or
  configuration.
- **FR-018**: The token and class contract documents MUST be updated for the new
  roles and every new reusable surface (dock, topbar, progress card, survey card,
  option/star/dropzone/toast/summary treatments) with name, value, and intended use,
  and the automated checks (literal-free values, contrast, documentation coverage,
  ordered scales) MUST be extended to them and passing.
- **FR-019**: Existing behavior MUST NOT change: navigation gating, answer
  preservation, validation timing, submission handling, and the documented
  control/panel geometry all keep their current contracts; this feature changes
  brand, chrome, and navigation layout only.

### Key Entities _(include if feature involves data)_

- **Brand role**: One of the three named color roles (maroon primary, gold secondary,
  cream tertiary) with its scale steps and documented usages; the only colors
  surfaces may reference.
- **Dock**: The left navigation region — header/live-survey card, step buttons with
  per-step progress, footer ring/bar/status — in its expanded, collapsed-rail, and
  mobile-drawer forms.
- **Step entry**: One survey page as shown in the dock and mobile pills — position,
  title, answered/total counts, progress fraction, and state (active, completed,
  upcoming/unreachable).
- **Survey chrome**: The topbar, progress card, and survey card header/footer shared
  by every page of every survey.
- **Answer surface**: The branded presentation of one question — card, prompt,
  control(s), help text, and validation state — for each supported question type.
- **Completion summary**: The post-submission presentation — medallion, success
  message, `100% complete`, survey-derived summary tiles, and new-response action.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A side-by-side review of the shipped survey against `public/index.html`
  at 1440 px, 768 px, 375 px, and 320 px widths reports zero mismatches on the
  brand roles, dock states (expanded, collapsed rail, drawer), topbar, progress
  card, survey card header/footer, every question-type treatment, validation and
  toast states, and the completion summary.
- **SC-002**: 100% of color, spacing, radius, elevation, and duration declarations in
  the shipped survey styles resolve to a named token; the automated check fails if a
  raw value appears outside the primitive layer.
- **SC-003**: Automated contrast checks pass for every shipped text/background pair,
  every interactive target measures at least 44 by 44 device-independent pixels, and
  with reduced motion enabled no brand animation is perceptible while every state
  remains distinguishable.
- **SC-004**: The full survey flow (load, answer every question type, navigate both
  directions, submit, view completion, start a new response) completes at 320 px,
  768 px, and 1440 px widths with no horizontal scrolling and no clipped control,
  and the mobile drawer never exceeds 88% of the viewport width.
- **SC-005**: The token and class contract documents cover 100% of the new roles and
  reusable surfaces, and the documentation-coverage check fails when a token or
  class ships without documentation.
- **SC-006**: All existing automated tests continue to pass, the production build
  succeeds, and answer values, validation messages, navigation gating, and the
  submission payload are byte-for-byte identical to before the rebrand for the same
  inputs.

## Assumptions

- `public/index.html` ("GCC Resident Insights — Survey Dock") is the authoritative
  visual reference. Brand values sampled from it: maroon scale `#fdf2f4 → #25000a`
  with primary `#800020`; metallic gold scale `#fbf3d9 → #8f6f16` with secondary
  `#d4af37`; warm cream scale `#fcfcf9 → #d3c1a4` with canvas `#faf7f2`; dock widths
  322 px expanded / 96 px collapsed rail / 330 px mobile drawer; success green and
  error rose kept for their semantic meanings.
- Prototype demo tooling is out of scope and MUST NOT ship: the live payload/JSON
  modal, copy/export payload, elapsed-time counter, Reset and JSON dock buttons, and
  the autosave pill with localStorage draft persistence. In-session answer
  preservation keeps its existing behavior.
- Prototype content specifics MUST NOT transfer as hard-coded UI: flag emoji, the
  selected-country preview card, the hard-coded summary fields (country, residency,
  satisfaction, files), and demo copy such as section counts or time estimates are
  either driven by the survey definition or omitted.
- The serif display face is loaded by the prototype but never applied there — all
  prototype headings use the sans family — so the shipped brand uses the sans family
  for all survey text while keeping a display type role available for later use.
- Brand fonts, icons, and celebration motion are matched without render-blocking
  third-party requests (self-hosted or system equivalents); the choice is a plan-
  time detail, and offline usability is the acceptance bar.
- Dock step gating reuses the existing navigation/validation rules; no new gating
  logic is introduced.
- Only the light brand theme ships; the application renders it even when the
  operating system requests a dark color scheme.
- New reusable surfaces follow the existing contract-first workflow: tokens and
  class contracts are documented before use, and the automated checks guard them
  exactly as they guard the current design system.
