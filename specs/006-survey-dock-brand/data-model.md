# Data Model: Survey Dock Brand

This feature adds no domain entities. It (a) extends the survey JSON contract with three
*optional* presentation-copy fields, (b) defines the token delta the brand is built from,
(c) defines the view-state and derived-data shapes the new chrome consumes, and (d)
extends the automated-check model. Survey, question, answer, and response entities are
unchanged from [001-survey-management/data-model.md](../001-survey-management/data-model.md);
the token/class model below deltas [004-survey-design-system/data-model.md](../004-survey-design-system/data-model.md).

## JSON contract amendment (additive, optional)

| Field | Type | Rules |
| ----- | ---- | ----- |
| `Survey.estimatedMinutes` | `number?` | Absent by default. When present: integer, 1–120. Feeds the dock live-survey card ("~N min"); surveys without it show the section count only. |
| `SurveyPage.description` | `string?` | Absent by default. When present: 1–280 chars. Rendered under the page title in the survey-card header; absent renders no description row (the header does not reserve empty space). |
| `SurveyPage.icon` | `string?` | Absent by default. When present: 1–32 chars, key into the documented icon set (`clipboard`, `id-card`, `laptop-file`, `file-shield`, `star`, `shield-check`, `upload`, `check`). Unknown keys fall back to the default page icon; validation rejects empty/oversize values but never unknown keys (forward-compatible with new icons). |

Compatibility: every document valid before this feature is valid after it. Answer values,
attachments, and the submission payload are byte-identical. Invalid *new* fields produce
the existing user-visible configuration error, never a half-rendered survey.

## Token model delta

Tier-1 additions in `tokens/primitives.css` (the only file that may hold literals):

| Family | Tokens | Anchor values sampled from `public/index.html` |
| ------ | ------ | ---------------------------------------------- |
| Gold ramp | `--ds-gold-100 … --ds-gold-700` | `100 #fbf3d9`, `200 #f7e8b5`, `300 #f3e5ab`, `400 #e6ca65`, `500 #d4af37`, `600 #b89320`, `700 #8f6f16` |
| Cream ramp | `--ds-cream-50 … --ds-cream-400` | `50 #fcfcf9`, `100 #faf7f2`, `200 #f2eae0`, `300 #e5d7c5`, `400 #d3c1a4` |
| Red ramp | `--ds-red-50 … --ds-red-700` | `50 #fef2f2`, `100 #fee2e2`, `200 #fecaca`, `600 #e11d48` (text ✓ 4.70), `700 #be123c` |
| Maroon depth | `--ds-maroon-950` | `#25000a` (dock gradient root) |
| Dock alphas | `--ds-alpha-maroon-7`, `--ds-alpha-gold-30`, `--ds-alpha-cream-60` | Dot pattern, ring glow, drawer scrim tint |
| Icon masks | `--ds-icon-star`, `--ds-icon-shield-check`, `--ds-icon-clipboard`, `--ds-icon-chevrons`, `--ds-icon-upload` | Black-geometry SVG data URIs, tinted by `background-color` |

Tier-2 changes in `tokens/semantic.css` (re-points + one new family):

| Role | Before | After | Rule |
| ---- | ------ | ----- | ---- |
| `--ds-color-canvas`, `-subtle`, `-strong` | pink | cream-100 / cream-50 / cream-200 | Canvas is cream everywhere |
| `--ds-color-selection*` | blue | maroon (`600 #800020` fill, `50` soft, `200` border) | Selected answers read maroon per the reference |
| `--ds-color-tertiary*` | pink | cream | Tertiary role is the cream canvas, usable standalone |
| `--ds-color-danger*` | maroon | red ramp | Errors read rose per the reference |
| `--ds-color-focus-ring-core`, `-ring` | selection blue | maroon | One maroon focus treatment system-wide |
| `--ds-color-accent*` (new) | — | gold (`500` decorative, `700` functional text/symbol, `300` on-dark text, `100` soft) | Gold highlights, stars, submit fill; functional uses MUST pass 3:1+ |
| `--ds-color-text-on-accent` (new) | — | maroon-900 `#3d000f` | Dark text on gold fills (8.29:1 ✓) |
| `--ds-color-surface-dock*` (new) | — | maroon-950 → maroon-700 gradient stops + on-dock text/border tokens | Dock chrome; on-dock text pairs verified in the contrast delta |

Layout/measure additions in `tokens/space.css` and `tokens/typography.css`:

| Token | Value | Rule |
| ----- | ----- | ---- |
| `--ds-dock-width` | `20.125rem` (322 px) | Expanded dock, desktop |
| `--ds-dock-rail-width` | `6rem` (96 px) | Collapsed icon rail, desktop |
| `--ds-drawer-width` | `min(20.625rem, 88vw)` (330 px cap) | Mobile drawer; never exceeds 88% of viewport |
| `--ds-dock-breakpoint` | `64rem` (1024 px) | Documentation of the drawer/dock switch (queries use the literal) |
| `--ds-ring-size` | `3.625rem` (58 px) | Dock progress ring |
| `--ds-topbar-height` | `4.25rem` (68 px) | Sticky topbar, desktop |
| `--ds-font-weight-extrabold` | `800` | Brand headings (the scale previously topped at 700) |

## View-state and derived-data shapes

No new services or stores. All derived data is computed from existing session signals.

| Shape | Fields | Producer (pure, unit-tested) | Consumers |
| ----- | ------ | ---------------------------- | --------- |
| `PageProgress` | `{ pageId: string; answered: number; total: number }` | `pageProgress(page, answers, attachments)` built on `isQuestionAnswered()` in `response.validator.ts` | Dock step buttons (counts + mini-bars), mobile pills, ring math |
| `ShellProgress` | `{ answered: number; total: number; percentage: number; band: 'starting' \| 'progress' \| 'almost' \| 'complete' }` | Session computeds + pure `progressBand(percentage)` | Dock ring/bar/status, progress card, topbar summary |
| `CompletionTile` | `{ label: string; value: string }` | `buildCompletionTiles(survey, answers, attachments)` presenter (per-page `n/m answered` + files tile, capped with overflow tile) | `CompletionSummaryComponent.tiles` input |
| `ToastMessage` | `{ kind: 'error' \| 'success' \| 'info'; text: string }` | Pure `toastForNavigation(result)` / `toastForSubmission(result)` mappers | View-local toast region (auto-dismiss, view-owned timer) |
| `RatingReadout` | `{ text: string }` e.g. `"4 / 5 — Good"`, `"7 / 10"` | Pure `ratingReadout(value, min, max)` (descriptor only on 5-step scales) | Rating control readout line (`aria-live="polite"`) |
| `StepState` | `'active' \| 'completed' \| 'upcoming'` (existing `PageStatus`) | Existing `statusFor` (unchanged) | Dock steps, mobile pills |

View-owned ephemeral state (signals in `SurveyViewComponent`, no persistence):

| Signal | Type | Rule |
| ------ | ---- | ----- |
| `dockCollapsed` | `boolean` (default `false`) | Desktop only; toggles rail vs. expanded dock |
| `mobileNavOpen` | `boolean` (existing) | Mobile drawer open/closed; closes on backdrop, close control, Escape, or step selection |
| `toast` | `ToastMessage \| null` | Single transient message; success/info auto-dismiss, errors persist until next action |

## Template-hook model (new classes/attributes)

Shell styling follows the existing survey pattern (plain view-scoped classes, not new
`ds-` classes): `.dock`, `.dock-rail`, `.dock-drawer`, `.topbar`, `.mobile-pills`,
`.progress-card`, `.survey-card`, `.survey-card__header`, `.survey-card__footer`,
`.toast-region`. The PrimeNG bridge keeps its selectors; only token *values* flowing
through it change. Full hook list with states and required ARIA is part of the
implementation tasks, not the token contract — only `--ds-*` tokens and `ds-*` classes
are docs-covered by the automated check.

## Automated-check model additions

| Check | Rule |
| ----- | ---- |
| Token resolution (extended) | Every `var(--ds-*)` reference resolves against the token layer — unchanged rule, now covering the new shell stylesheets |
| Documentation coverage (merged) | Documented tokens = 004 `design-tokens.md` ∪ 006 `brand-delta.md`; every shipped token documented in exactly the union, no stale entries in either file |
| Contrast delta | Added pairs (on-dock text, gold functional, submit fill, red errors, maroon selection/focus on cream) meet their minima; all 004 pairs re-verified against the re-pointed values |
| Shell geometry | `--ds-dock-width`, `--ds-dock-rail-width`, `--ds-drawer-width`, `--ds-ring-size` exist, are documented in `shell-sizes.md`, and drive the shell surfaces (no literal widths on dock/drawer/topbar/ring selectors); drawer cap includes the `88vw` term |
| Motion | New keyframes (celebration ring) use `opacity`/`transform` only — covered by the existing keyframes check, which now scans the extended `motion.css` |
