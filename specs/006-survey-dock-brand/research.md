# Phase 0 Research: Survey Dock Brand

All unknowns from the spec are resolved below as decisions with rationale and rejected
alternatives. The reference is `public/index.html` ("GCC Resident Insights — Survey Dock");
all sampled values below come from it.

## Decision: Token delta on the existing system, not a new system

- **Decision**: Extend `src/styles/tokens/primitives.css` with three new ramps (gold,
  cream, red) plus a deeper maroon step, re-point the semantic roles in `semantic.css`
  (canvas → cream, selection → maroon, tertiary → cream, danger → red, focus core follows
  selection to maroon), and add one new semantic family (`--ds-color-accent-*`, gold) plus
  shell layout tokens (dock widths, drawer cap, ring size). Token *names* stay stable; only
  values and role mappings change. See [contracts/brand-delta.md](contracts/brand-delta.md).
- **Rationale**: FR-018/FR-019 require the rebrand to ride the existing contract-first
  workflow and change brand/chrome/layout only. The 004/005 automated checks, the PrimeNG
  `--p-*` bridge (146 token references, zero hard-coded hues), and the size contract all
  consume token names — a delta keeps every one of them meaningful instead of orphaned.
- **Alternatives considered**: A parallel `dock-*` token namespace (rejected: two sources
  of truth for one product; every 004/005 check would need forking); editing values
  in-place with no contract delta (rejected: undocumented re-points break the
  docs-coverage check by design).

## Decision: Functional gold is the dark step; bright gold is decorative only

- **Decision**: Symbols, star fills, and any gold text use gold-700 `#8f6f16` (4.72:1 on
  white ✓). Bright gold `#d4af37` is restricted to large/decorative graphics (gradients,
  ring stroke, medallion) and to filled backgrounds carrying dark text (submit action:
  `#3d000f` on `#d4af37` = 8.29:1 ✓). Verified by machine, not by eye:

  | Pair | Ratio | Verdict |
  | ---- | ----: | ------- |
  | maroon `#800020` on white / cream | 10.83 / 10.14 | ✓ text |
  | white / gold-300 `#f3e5ab` on dock deep `#3d000f` | 17.42 / 13.78 | ✓ dock text |
  | maroon-900 `#3d000f` on gold `#d4af37` (submit) | 8.29 | ✓ |
  | gold-700 `#8f6f16` on white (stars, symbols) | 4.72 | ✓ text/symbols |
  | white on step green `#15803d` | 5.02 | ✓ completed tiles |
  | muted `#6e6e6e` on cream `#faf7f2` | 4.77 | ✓ |
  | rose-600 `#e11d48` on white (errors) | 4.70 | ✓ |
  | gold-600 `#b89320` / gold-500 `#d4af37` on white | 2.90 / 2.10 | ✗ decorative only |
- **Rationale**: The reference paints gold stars on white; the shipped product must keep
  the 004 contrast contract (3:1 minimum for symbols/fills). The dark gold step reads as
  gold and passes as text.
- **Alternatives considered**: Bright-gold symbols with a contrast exception (rejected:
  weakens the contract for the most-seen state in the survey); maroon stars (rejected:
  contradicts the reference, which is explicit).

## Decision: Additive, optional JSON extension for page chrome copy

- **Decision**: Extend the survey JSON contract with three *optional* fields —
  `Survey.estimatedMinutes?`, `SurveyPage.description?`, `SurveyPage.icon?` — validated
  when present (non-empty, bounded length; icon is a key into the documented icon set
  with a graceful default for unknown keys) and ignored when absent. All existing
  fixtures remain valid byte-for-byte; answer values and the submission payload are
  untouched. Documented as an amendment in [contracts/brand-delta.md](contracts/brand-delta.md) §5.
- **Rationale**: FR-005/FR-010 require a per-page description, a page icon, and a
  survey-level time estimate, and the spec's assumptions require chrome copy to be
  JSON-driven rather than hard-coded. The current model (`SurveyPage`: `pageId`,
  `title`, `questions`) cannot supply them.
- **Alternatives considered**: Hard-coding descriptions/icons per page index in the
  template (rejected: violates the JSON-driven constitution principle and FR-017's
  "no per-survey code"); omitting descriptions/icons (rejected: contradicts FR-010 and
  visibly breaks reference parity).

## Decision: Shell restructure lives in the survey-view template; behavior stays in the session

- **Decision**: `survey-view` gains the dock sidebar, sticky topbar, progress card,
  survey-card header/footer, mobile step pills, and toast markup. All navigation,
  validation, and submission *rules* stay in `SurveySessionService` and the validators;
  the template only reads signals and forwards events. New view state is limited to
  `dockCollapsed` (desktop rail), `drawerOpen` (mobile, reusing the existing
  `mobileNavOpen` signal), and transient toast state. The drawer breakpoint moves from
  768 px to 1024 px to match the reference.
- **Rationale**: The spec explicitly scopes this feature to "brand, chrome, and
  navigation layout" (FR-019) — markup/layout change is the feature, while gating,
  answer preservation, validation timing, and submission contracts are frozen. The
  existing view already owns drawer/backdrop/collapse mechanics, so this extends a
  proven pattern instead of inventing one.
- **Alternatives considered**: New routed shell component (rejected: routing and
  component boundaries are behavior-adjacent; a new boundary risks changing the
  navigation contract); pure-CSS reskin of the current two-column grid (rejected:
  cannot produce the dock rail, topbar, ring, or drawer).

## Decision: Answered-state is a domain rule with one definition

- **Decision**: Add a pure `isQuestionAnswered(question, answers, attachments)` helper
  to `response.validator.ts` (text/rating/dropdown/boolean non-empty; checkbox non-empty
  array; file questions answered via attachments; `toggle_button` answered once a boolean
  exists — matching `SurveyPageComponent.isAnsweredValue` semantics, which is refactored
  to delegate to it). The session exposes `answeredQuestionCount` / `totalQuestionCount`
  computeds; the view derives per-page `{ answered, total }` progress and passes it to
  `SurveyNavigationComponent` as a new `progress` input. Ring, bars, counts, and pills all
  read these values — no second counting implementation.
- **Rationale**: US-2 acceptance 5 requires ring, status, counts, and mini-bars to agree
  with each other and with reality. One domain-level definition, unit-tested, is the only
  way to guarantee that across five consumers. Constitution principle II/III place this
  rule in validators, not templates.
- **Alternatives considered**: Counting in each template with local helpers (rejected:
  five copies guaranteed to drift); counting answered-ness in the navigation component
  from raw answers (rejected: pushes domain semantics into a presentation component).

## Decision: Completion tiles are built by a pure presenter

- **Decision**: `CompletionSummaryComponent` gains a `tiles` input
  (`ReadonlyArray<{ label, value }>`). A pure, unit-tested `buildCompletionTiles(survey,
  answers, attachments)` presenter produces one tile per page (`"<title>": "n/m answered"`)
  plus one attachments tile (`"Files": "k file(s) attached"`), capped at a documented
  tile count with an overflow tile. The component stays presentational.
- **Rationale**: FR-013 forbids the reference's hard-coded GCC fields; tiles must be
  survey-derived for *every* catalog survey regardless of page count or question mix. A
  pure presenter is independently testable and keeps the component free of domain logic.
- **Alternatives considered**: Templating per-question answers (rejected: unbounded —
  a 24-question survey would render 24 tiles); reusing the reference's four fixed tiles
  (rejected: meaningless for any other survey).

## Decision: Toast is presentational and event-driven

- **Decision**: A toast region in the survey-view template (`role="status"`, promoted to
  `role="alert"` for blocking errors) driven by the *existing* return values of
  `session.next()`, `session.goToPage()`, and `buildResponse()`/`submit()`. Message text
  comes from a tiny pure mapper (unit-tested); auto-dismiss is view-local with a
  documented duration; no domain state is added.
- **Rationale**: FR-012 requires toasts on blocked navigation and success, but the
  triggers already exist as synchronous return values — no service, store, or new
  dependency is needed.
- **Alternatives considered**: A toast service with an observable queue (rejected:
  over-engineering for single-message, event-driven feedback); PrimeNG Toast module
  (rejected: new dependency surface and its own theme tokens for one region).

## Decision: Icons extend the SVG-mask set; no icon font

- **Decision**: Add `--ds-icon-star`, `--ds-icon-shield-check`, `--ds-icon-clipboard`,
  `--ds-icon-chevrons`, and `--ds-icon-upload` masks to `icons.css`, drawn as black
  geometric SVG paths tinted by `background-color` tokens (the established pattern).
  Satisfaction keeps its emoji glyphs; rating keeps numeric buttons. Star-shaped rating
  buttons are explicitly *not* introduced — the numeric control is re-skinned (gold-dark
  selected fill + `N / max` readout, with a Poor…Excellent descriptor only on 5-step
  scales via a pure, tested mapper).
- **Rationale**: FR-016 forbids the reference's Font Awesome CDN; the mask pattern is the
  offline, token-driven equivalent already in the contract. Keeping the rating control's
  structure honors FR-019 (behavior unchanged) while the readout satisfies story 4's
  "textual readout of the value".
- **Alternatives considered**: Self-hosting an icon font (rejected: binary asset +
  licensing + bundle cost for a handful of glyphs); inline SVG per template (rejected:
  litters templates with decoration and bypasses the token contract); star-shaped rating
  buttons (rejected: changes a tested control's structure and keyboard model).

## Decision: Celebration is CSS-only

- **Decision**: The completion summary celebrates with a medallion pop plus one expanding
  ring pulse, implemented as `opacity`/`transform`-only keyframes in `motion.css`
  (extending the existing `ds-enter-pop` family). No JavaScript confetti: the reference's
  `canvas-confetti` CDN is barred by FR-016, and DOM-particle systems would need bespoke
  reduced-motion handling.
- **Rationale**: Matches the reference's celebratory beat, stays compositor-friendly per
  the motion contract, and collapses automatically under the existing global
  `prefers-reduced-motion` block.
- **Alternatives considered**: Hand-rolled canvas confetti (rejected: ~200 lines of
  animation code, focus/announcement edge cases, and a second motion system outside the
  token contract); no celebration (rejected: the reference is explicit and the summary is
  the brand's last impression).

## Decision: Sheen and hover motion stay on the compositor

- **Decision**: The Continue-button sheen sweep is implemented as a translated
  `::before` gradient (`transform: translateX()`), and option hover uses the existing
  lift pattern (`translateY(-1px)` + shadow). No `left`/`width`/layout-property
  animation is introduced.
- **Rationale**: The 004 motion contract ("only `opacity`/`transform`") is enforced by
  the keyframes check and asserted as a principle for transitions; the reference's
  `left`-based sheen would violate it.
- **Alternatives considered**: Faithful `left`-based sheen (rejected: layout-thrashing
  animation, fails the motion contract); no sheen (rejected: it is the primary action's
  signature detail in the reference).

## Decision: PrimeNG bridge inherits the rebrand; verified, not rewritten

- **Decision**: The `--p-*` bridge maps exclusively through semantic tokens (146
  references, zero literal hues), so re-pointing the semantics re-themes the dropdown
  and toggle automatically. The plan verifies the mapping (dropdown field/overlay/option
  states and toggle on/off against the reference treatments) and adjusts only any
  mapping whose *semantic choice* is now wrong (e.g. a selection-soft tint that must
  read maroon rather than blue-soft — which follows automatically — versus a decorative
  blue that must become gold, which needs a deliberate edit).
- **Rationale**: The whole point of the bridge (004) is that library controls inherit
  token changes. A rewrite would fork the control styling away from the contract.
- **Alternatives considered**: Rewriting the bridge per control state (rejected:
  duplicates the semantic layer inside the integration layer).

## Decision: Contract artifacts live with the feature; the check merges them

- **Decision**: 006 ships `contracts/brand-delta.md` (ramps, re-pointed roles, new
  tokens, added contrast pairs, JSON amendment) and `contracts/shell-sizes.md` (dock/
  chrome geometry + measured values at the five documented viewports). The automated
  check is extended to merge documented tokens from the 004 *and* 006 token contracts,
  to enforce the added contrast pairs, and to assert the shell-geometry tokens exist,
  are documented, and drive the shell surfaces. The 004/005 contract files are left
  untouched so their checks keep their original meaning; measured shell sizes are filled
  during implementation (the plan states derivations, implementation records rulers).
- **Rationale**: Spec Kit contracts are feature-scoped; editing 004's contracts in place
  would rewrite history and tangle two features' acceptance. Merging keeps one green
  check with clear per-feature provenance.
- **Alternatives considered**: Editing the 004 contracts in place (rejected: rewrites the
  prior feature's acceptance baseline); a standalone 006 check file (rejected: two checks
  can disagree about shared tokens — one merged check, one verdict).

## Decision: Backdrop is CSS-only on existing hooks

- **Decision**: The fading dot pattern renders via `body::before` (radial-gradient dots
  in a maroon alpha + mask fade, matching the reference) and the two ambient fields via
  the survey shell's own `::before`/`::after` (large blurred maroon/gold washes at low
  opacity). No template markup, no images, no new elements.
- **Rationale**: The reference implements exactly this with three decorative layers;
  pseudo-elements on hooks that already exist keep the DOM identical and the effect
  purely presentational (forced-colors and print degrade to the flat cream canvas).
- **Alternatives considered**: Backdrop markup in the template (rejected: decorative DOM
  nodes that screen readers and tests must then ignore); SVG/PNG background assets
  (rejected: new binary assets for gradients CSS expresses natively).

## Decision: Shell styles are split for the component-style budget

- **Decision**: Dock/topbar/toast/chrome styles ship in a new `survey-shell.css` alongside
  the existing `survey.css` (the view declares both via `styleUrl`-equivalent style
  array), keeping each file under the 16 kB `anyComponentStyle` error budget. If the
  production build still breaches a budget, the budget is raised with a Complexity
  Tracking entry exactly as 004 did — never silently.
- **Rationale**: The current `survey.css` already sits near the warning line; ~400 lines
  of dock/chrome CSS would push one file over the error budget. Splitting by concern
  (shell/chrome vs. questions/actions) is structural, not evasive — each file stays
  coherent and independently readable.
- **Alternatives considered**: One growing `survey.css` plus a pre-emptive budget raise
  (rejected: raises the guardrail before knowing it is needed); stuffing shell styles
  into the global layer (rejected: shell classes are view-scoped, global would leak
  them).
