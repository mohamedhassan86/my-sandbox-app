# Contract: Survey Question UI Sizes (height and width)

**Feature**: [005-dropdown-menu-sizing](../spec.md) | **Layers**: `src/styles/tokens/space.css`,
`src/styles/integrations/primeng.css`, `src/styles/compat.css`, `src/app/survey/survey.css`

This is the size description for the survey questions: every answer surface, the question
card that holds it, and the dropdown option panel. Each row states the token that drives the
size, the derivation of that value, and the value measured in the running survey at the five
documented viewports. The automated check
(`src/app/shared/design-system/design-token.contract.spec.ts`) fails if a size token listed
here is removed, if a new size token is shipped undocumented, or if a surface uses a literal
size instead of a token.

All values are CSS pixels at the default zoom (1 CSS px = 1 device-independent pixel),
measured with a browser default font size of 16 px. The reference viewport set is
320 × 640, 375 × 812, 768 × 1024, 1280 × 800, and 1440 × 900.

## 1. Shared sizing tokens

| Token                                                                        | Value                                                                                            | Drives                                                                |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `--ds-control-height`                                                        | `calc(var(--ds-space-sm) * 2 + var(--ds-line-height-normal) * var(--ds-font-size-lg) + 2 * 1px)` | Height of every single-line answer control (text box, dropdown field) |
| `--ds-touch-target`                                                          | `2.75rem` (44 px)                                                                                | Minimum height of choice rows, option rows, and buttons               |
| `--ds-icon-size`                                                             | `1.25rem` (20 px)                                                                                | Choice control box, check/alert markers, dropdown chevron             |
| `--ds-select-list-max-height`                                                | `min(16rem, 32vh)`                                                                               | Scrolling viewport of the open option list                            |
| `--ds-select-panel-max-height`                                               | `min(20rem, 45vh)`                                                                               | Ceiling of the whole option panel (search field + option list)        |
| `--ds-select-option-min-height`                                              | `var(--ds-touch-target)`                                                                         | Minimum height of one option row                                      |
| `--ds-container-max`                                                         | `72rem` (1152 px)                                                                                | Maximum width of the survey page canvas                               |
| `--ds-container-pad`                                                         | `clamp(1rem, 4vw, 2rem)`                                                                         | Page canvas gutter                                                    |
| `--ds-panel-max`                                                             | `60rem` (960 px)                                                                                 | Standalone status/error panel width                                   |
| `--ds-sidebar-width`                                                         | `19rem` (304 px)                                                                                 | Survey navigation panel width on desktop                              |
| `--ds-radius-lg` / `--ds-radius-xl` / `--ds-radius-2xl` / `--ds-radius-pill` | 14 px / 20 px / 28 px / 999 px                                                                   | Field radius / card radius / panel radius / button radius             |
| `--ds-space-fluid-lg`                                                        | `clamp(1.5rem, 1rem + 2vw, 2.5rem)`                                                              | Content panel and card padding                                        |
| `--ds-measure-wide`                                                          | `75ch`                                                                                           | Prompt line length cap                                                |

The control height is the reason a dropdown field and a text box now match: both resolve to
"2 × block padding (`--ds-space-sm` = 12 px) + 1 control line box (`--ds-line-height-normal`
1.5 × `--ds-font-size-lg`) + 2 × 1 px border".

## 2. Heights and widths per viewport (measured)

| Surface                            | 320 × 640                    | 375 × 812           | 768 × 1024 | 1280 × 800 | 1440 × 900 |
| ---------------------------------- | ---------------------------- | ------------------- | ---------- | ---------- | ---------- |
| Page canvas width                  | 320                          | 375                 | 768        | 1152       | 1152       |
| Content panel width                | 232                          | 287                 | 370.6      | 720        | 720        |
| Content panel padding              | 24                           | 24                  | 31.36      | 40         | 40         |
| Question card width                | 184                          | 239                 | 307.8      | 640        | 640        |
| Question card padding              | 24                           | 24                  | 31.36      | 40         | 40         |
| Question card radius               | 20                           | 20                  | 20         | 20         | 20         |
| Question prompt font size          | 18.4                         | 18.675              | 20.64      | 22         | 22         |
| Answer area width (control width)  | 134                          | 189                 | 243.1      | 558        | 558        |
| Single-line text answer height     | 51.5                         | 51.5                | 52.9       | 53         | 53         |
| Dropdown field height              | 51.5                         | 51.5                | 52.9       | 53         | 53         |
| Dropdown field radius              | 14                           | 14                  | 14         | 14         | 14         |
| Dropdown chevron cell width        | 28                           | 28                  | 28         | 28         | 28         |
| Choice row (radio/checkbox) height | 44 (60.5 wrapped)            | 44                  | 44         | 44         | 44         |
| Choice control box                 | 20 × 20                      | 20 × 20             | 20 × 20    | 20 × 20    | 20 × 20    |
| On/off toggle height × width       | 46 × 136.3                   | 46 × 136.3          | 46 × 136.3 | 46 × 136.3 | 46 × 136.3 |
| Textarea minimum height            | 132                          | 132                 | 132        | 132        | 132        |
| Rating tile minimum size           | 44 × 44                      | 44 × 44             | 44 × 44    | 44 × 44    | 44 × 44    |
| Satisfaction tile minimum size     | 44 × 44 (icon tiles 88 × 44) | same                | same       | same       | same       |
| File input height                  | 44                           | 44                  | 44         | 44         | 44         |
| Primary/secondary button height    | 50                           | 50                  | 50         | 50         | 50         |
| Navigation panel width (desktop)   | collapsed drawer 56          | collapsed drawer 56 | 304        | 328        | 328        |
| Horizontal page overflow           | none                         | none                | none       | none       | none       |

### Question card heights (same content, measured)

| Card content                 | 320 × 640 | 375 × 812 | 768 × 1024 | 1280 × 800 | 1440 × 900 |
| ---------------------------- | --------- | --------- | ---------- | ---------- | ---------- |
| Prompt + text answer         | 132.5     | 132.8     | 151.4      | 170.5      | 170.5      |
| Prompt + choice list         | 420.5     | 365.2     | 368.3      | 257.5      | 257.5      |
| Prompt + on/off toggle       | 219.3     | 173.5     | 190.7      | 186.6      | 186.6      |
| Prompt + dropdown (required) | 147.5     | 148.2     | 143.4      | 162.5      | 162.5      |

Card height is content-driven: it is the prompt, the answer control, the card padding
(2 × 24 to 40 px), and the 1 px card border. Only the padding and the prompt size change
between breakpoints; no card has a fixed height.

## 3. Dropdown option panel (the fixed defect)

| Property                             | Contract                                                                                             | 320 × 640 | 375 × 812 | 768 × 1024 | 1280 × 800 | 1440 × 900 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------- | --------- | ---------- | ---------- | ---------- |
| Panel width                          | equal to the dropdown field width (`min-width: 100%`, `max-width: 100%`)                             | 134       | 189       | 243        | 558        | 558        |
| Panel horizontal position            | aligned with the field's inline start                                                                | ✓         | ✓         | ✓          | ✓          | ✓          |
| Gap between field and panel          | 1–2 px (field border only; `top: 0` relative to the field)                                           | 1.5       | 1.5       | 1.1        | 1          | 1          |
| Panel maximum height                 | `min(20rem, 45vh)`                                                                                   | 260.8     | 312       | 312        | 312        | 312        |
| Panel opening direction              | downwards when the panel fits below the field, upwards when it does not and there is more room above | ↓         | ↓         | ↓          | ↓          | ↓          |
| Panel distance from screen edge      | whole panel inside the viewport, 0 px horizontal overflow                                            | ✓         | ✓         | ✓          | ✓          | ✓          |
| Search field height                  | 42                                                                                                   | 42        | 42        | 42         | 42         | 42         |
| Option list viewport                 | `min(16rem, 32vh)`, scrolls when longer                                                              | 204.8     | 256       | 256        | 256        | 256        |
| Option row height                    | ≥ `--ds-touch-target` (44); measured row height                                                      | 49.5      | 49.5      | 50.9       | 51         | 51         |
| Option row radius                    | 8 (`--ds-radius-sm`)                                                                                 | 8         | 8         | 8          | 8          | 8          |
| Option label overflow                | truncated with an ellipsis inside the row, never widens the panel                                    | ✓         | ✓         | ✓          | ✓          | ✓          |
| Vertical stacking                    | above every following question card and above the page actions                                       | ✓         | ✓         | ✓          | ✓          | ✓          |
| Option rows visible before scrolling | at least 3 fully visible rows, plus the next one cut as the scroll cue                               | 3 + 1     | 4 + 1     | 4 + 1      | 4 + 1      | 4 + 1      |

Panel height is `min(content, --ds-select-panel-max-height)`: a two-option list renders a
short panel (search field + two rows), a six-option list renders the full bounded panel, and
a forty-option list keeps the same bounded panel with the list scrolling inside it.

### Viewports shorter than the panel ceiling

When the room on the chosen side of the field is smaller than the token ceiling, the ceiling
is lowered to that room (minus a 2 px hairline gap) so the panel stays on screen. The token
remains the source of the size; the measurement only trims it.

| Reference viewport               | Field position       | Placement                                          | Panel                    |
| -------------------------------- | -------------------- | -------------------------------------------------- | ------------------------ |
| 800 × 420 (short landscape)      | low in the viewport  | opens downwards (no fit below, no more room above) | 270 × 181, bottom at 418 |
| 720 × 450 (1440 px at 200% zoom) | near the bottom edge | opens upwards                                      | 483 × 196, top at 57     |
| 320 × 640                        | mid page             | opens downwards, full 260.8-tall ceiling           | 134 × 260.8              |

At least two option rows stay reachable in every one of those cases, and the list scrolls
inside the trimmed panel.

## 4. Layering contract used by the open panel

| Layer                   | Token                                       | Purpose                                                           |
| ----------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Sticky survey chrome    | `--ds-z-sticky` (10)                        | Sticky navigation panel                                           |
| Card with an open panel | `--ds-z-active-card` (20)                   | Lifts the card that owns the open option list above sibling cards |
| Page overlay            | `--ds-z-overlay` (40)                       | Mobile navigation backdrop                                        |
| Modal / option panel    | `--ds-z-modal` (50) / library overlay value | Drawer and the option panel itself                                |
| Toast                   | `--ds-z-toast` (60)                         | Transient messages                                                |

Rules:

1. An open option panel is positioned against its field (`position: absolute`, `top: 0`,
   inline start 0) so it never consumes layout space in the question card.
2. The card that owns an open panel carries `--ds-z-active-card`, so sibling cards — each of
   which forms its own stacking context through the entrance animation — cannot paint over
   the list.
3. Question cards enter with `ds-enter-rise` and, with the `both` fill mode, keep the resolved
   end state: `translateY(0)`, which is the identity matrix (no movement, nothing clipped) and
   collapses to zero travel under reduced motion because `--ds-enter-distance` becomes `0`.
   Because that identity transform still gives every card its own stacking context, the
   active-card token — not paint order — is what keeps an open option list above its
   siblings.

## 5. How these numbers are verified

1. **Automated contract check** (`src/app/shared/design-system/design-token.contract.spec.ts`):
   every size token above is documented here, resolves to a token rather than a literal,
   and every `var(--ds-*)` reference resolves. The check fails on undocumented or stale
   tokens.
2. **Manual measurement** (documented in [../quickstart.md](../quickstart.md)): render the
   survey at the five viewports, open each dropdown, and compare the measured field, card,
   panel, and option-row values against the tables above. All measured values in this
   document were produced this way.
3. **Interaction checks**: point at the last option row of an open list to confirm it is
   hit-testable (not covered by the following card), select options by mouse and keyboard,
   filter the list, and clear an optional answer.
