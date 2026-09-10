# Data Model: Survey Design System

This feature introduces no domain data. It defines the token and class model that the
presentation layer is built from; survey, question, answer, and response entities are
unchanged from [001-survey-management/data-model.md](../001-survey-management/data-model.md).

## Token model

Tokens are CSS custom properties named `--ds-<category>-<name>`. Two tiers exist, and only
tier 1 may contain literal values.

### Primitive token (tier 1) — `tokens/primitives.css`

| Field | Type                    | Rules                                                                                                           |
| ----- | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| name  | string                  | `--ds-<palette>-<step>` (palette: `maroon`, `blue`, `pink`, `neutral`, `success`, `warning`, `danger`, `alpha`) |
| value | color / length / number | The only place literals may appear. Steps are ordered light → dark (or 0 → 950 for neutrals)                    |

Sampled reference anchors: `pink-400 = #fbafbc` (canvas), `blue-600 = #1524d9` (selection),
`neutral-200 = #e5e5e5` (tile), `neutral-900 = #202020` (ink), `neutral-600 = #6e6e6e`
(muted text), `maroon-700 = #800000` (brand).

### Semantic token (tier 2) — `tokens/semantic.css`

| Category  | Tokens                                                                                                                                                                                                                                | Rules                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Canvas    | `--ds-color-canvas`, `--ds-color-canvas-subtle`                                                                                                                                                                                       | Tertiary brand role; page backdrop                                                           |
| Surface   | `--ds-color-surface`, `--ds-color-surface-muted`, `--ds-color-surface-raised`, `--ds-color-surface-inverse`                                                                                                                           | Panel/card, tile and input fills                                                             |
| Text      | `--ds-color-text`, `--ds-color-text-secondary`, `--ds-color-text-muted`, `--ds-color-text-subtle`, `--ds-color-text-inverse`, `--ds-color-text-on-canvas`, `--ds-color-text-muted-on-canvas`, `--ds-color-text-on-selection`          | Every text token maps to a background token it is checked against                            |
| Border    | `--ds-color-border`, `--ds-color-border-subtle`, `--ds-color-border-strong`, `--ds-color-border-interactive`                                                                                                                          | `-interactive` is the only border used to identify an interactive control and MUST reach 3:1 |
| Brand     | `--ds-color-primary`, `--ds-color-primary-strong`, `--ds-color-primary-soft`, `--ds-color-primary-contrast`                                                                                                                           | Maroon primary role (brand chrome, validation, emphasis)                                     |
| Selection | `--ds-color-selection`, `--ds-color-selection-strong`, `--ds-color-selection-soft`, `--ds-color-selection-contrast`                                                                                                                   | Secondary role; selected answers and focus                                                   |
| Tertiary  | `--ds-color-tertiary`, `--ds-color-tertiary-soft`, `--ds-color-tertiary-strong`                                                                                                                                                       | Canvas pink role, available standalone                                                       |
| Status    | `--ds-color-success`, `--ds-color-success-soft`, `--ds-color-success-border`, `--ds-color-warning`, `--ds-color-warning-soft`, `--ds-color-warning-border`, `--ds-color-danger`, `--ds-color-danger-soft`, `--ds-color-danger-border` | Each pairs a text color with a soft background and a border                                  |
| Focus     | `--ds-color-focus-ring`, `--ds-focus-ring-width`, `--ds-focus-ring-offset`, `--ds-focus-ring`                                                                                                                                         | Single focus treatment for the whole system                                                  |
| Overlay   | `--ds-color-scrim`, `--ds-color-overlay-shadow`                                                                                                                                                                                       | Modal/drawer backdrop and panel shadow tint                                                  |

### Typography tokens — `tokens/typography.css`

| Field                                    | Type                                                  | Rules                                                                                                    |
| ---------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| font-display                             | stack                                                 | Serif display role (survey titles, display numerals)                                                     |
| font-text                                | stack                                                 | UI sans role (prompts, body, controls)                                                                   |
| font-size-3xs … font-size-5xl            | length (fluid `clamp()` where the step is responsive) | Monotonically increasing; body/prompt sizes must not drop below 16 px on the smallest supported viewport |
| line-height-tight/snug/normal/relaxed    | number                                                | Display uses tight/snug; body and prompts use normal/relaxed                                             |
| letter-spacing-tight/normal/wide/caps    | length                                                | `caps` is used with the eyebrow role                                                                     |
| font-weight-regular/medium/semibold/bold | number                                                | Prompt (question) text uses medium; labels use semibold                                                  |
| measure-narrow/measure/measure-wide      | length (`ch`)                                         | Caps line length so long prompts stay readable                                                           |

### Space, radius, elevation, motion, layout tokens — `tokens/space.css`

| Field                                                 | Type   | Rules                                                                                                           |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| space-0 … space-5xl, space-fluid-lg, space-fluid-xl   | length | 4 px base unit; monotonic                                                                                       |
| radius-xs … radius-2xl, radius-pill                   | length | `md` (10 px) is the tile step from the reference; `2xl` (28 px) is the panel step                               |
| shadow-1 … shadow-4, shadow-panel                     | shadow | Elevation ramp; `panel` is the survey panel lift                                                                |
| duration-instant/fast/base/slow/slower                | time   | Motion steps; entrance motion uses `slower`                                                                     |
| ease-standard/emphasized/exit/spring                  | easing | State changes use `standard`, entrances use `emphasized`, springs are limited to the selected-tile confirmation |
| container-max, container-pad, panel-max, touch-target | length | `touch-target` is 44 px and is the minimum size for any interactive control                                     |
| bp-sm/md/lg/xl                                        | length | Documentation of the breakpoint contract (media queries must use literal values)                                |
| z-sticky/overlay/modal/toast                          | number | Layering contract for nav, drawer scrim, overlays, and messages                                                 |

## Class model

Component classes are `ds-`-prefixed and carry variants and states as BEM-ish modifiers
(`.ds-card--panel`, `.ds-card--invalid`). The full list, with variants, states, and the
existing template hooks they replace, is the contract in
[contracts/css-classes.md](contracts/css-classes.md).

| Entity                     | Fields                                                                                                                                                         | Rules                                                                                                    |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Card                       | variant (panel, question, raised, flat, interactive), padding (sm, md, lg), state (answered, invalid, complete, disabled), parts (header, title, body, footer) | One primitive builds the survey panel, the navigation panel, and every question card                     |
| Field                      | label, hint, control, state (invalid, valid, disabled), plus control classes for input/textarea/select/file                                                    | Error styling appears only after validation produced an issue for that question                          |
| Choice / Tile              | group (`.ds-tile-group`, `.ds-choice` set), value, caption, state (selected, disabled, focus-visible)                                                          | Selected state MUST combine fill, border, and a non-color cue; every control reaches `--ds-touch-target` |
| Progress                   | value 0–100, size (sm, md, lg), indeterminate flag                                                                                                             | Exposes `role="progressbar"` semantics with `aria-valuenow`; fill animates through motion tokens         |
| Steps                      | list of steps with status (current, complete, upcoming), interactive flag, compact flag                                                                        | Status is conveyed by marker shape/icon plus text, never by color alone                                  |
| Alert / Validation message | severity (error, warning, success, info), icon, body                                                                                                           | Error severity announces via `role="alert"`; other severities use `role="status"`                        |

## Design-system check (automated)

| Check                  | Rule                                                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token resolution       | Every `var(--ds-*)` reference in the shipped CSS resolves to a token defined in a token file                                                                                  |
| Token discipline       | No literal color or raw spacing length appears outside `tokens/primitives.css` (documented exceptions: `0`, `1px` hairlines, and `@media` query lengths)                      |
| Contrast               | Every documented text/background pair meets 4.5:1 (or 3:1 where the pair is documented as large-text/UI only); selection and other state fills meet 3:1 against their surface |
| Scale rules            | Spacing steps are multiples of the 4 px base and monotonic; the type scale is strictly increasing; radii and durations are ordered                                            |
| Motion                 | A `prefers-reduced-motion: reduce` block exists that collapses the duration tokens and removes transform movement                                                             |
| Documentation coverage | Every token shipped in CSS is documented in `contracts/design-tokens.md`, and every documented token exists in CSS                                                            |
