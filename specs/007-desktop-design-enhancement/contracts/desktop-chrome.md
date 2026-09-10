# Contract: Desktop Chrome (Theme Preview Parity)

**Feature**: [007-desktop-design-enhancement](../spec.md) | **Deltas**:
[004 design-tokens.md](../../004-survey-design-system/contracts/design-tokens.md) ·
[006 brand-delta.md](../../006-survey-dock-brand/contracts/brand-delta.md) ·
[006 shell-sizes.md](../../006-survey-dock-brand/contracts/shell-sizes.md) (read
together; this file only ADDS)

This file is the 007 acceptance surface: every token/asset added, every class hook
added or restyled, every static copy string, every contrast pair added, and the
measured desktop geometry. The automated check merges this file with the 004/005/006
documents: a shipped 007 surface must be documented here, and a surface documented
here must ship. Visual target: `public/theme-preview.png`.

## 0. Gating rule (normative)

Every element listed in §3 renders only at or above the existing desktop media query
(`64rem`, the documented literal) via the shipped `.only-desktop` mechanism —
**hidden below the breakpoint with `display: none`**, never transparent/disabled-only
— and every restyle in §3 lives inside that same media query. No rule in this file may
alter any style, element, or string that applies below the breakpoint (spec FR-001,
SC-002). New surfaces use flow-relative (`inline-*`) properties; rendering is LTR-only
(FR-019).

## 1. New decorative assets (`tokens/primitives.css`)

| Token                       | Value                                                                                                                             | Intended use                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `--ds-pattern-sparkle-lg`   | Two-scale eight-point-star tessellation as a repeating SVG data URI (≈72 px tile), tinted gold at the documented decorative alpha | Desktop-only replacement of the dock backdrop layer (FR-002)                 |
| `--ds-pattern-sparkle-sm`   | Companion smaller sparkle tile (≈36 px), same tint family                                                                         | Second layer of the desktop dock texture (offset registration)               |
| `--ds-dock-texture-opacity` | ≈0.18–0.28 decorative opacity for the desktop sparkle composite                                                                   | Keeps the texture below the dock's hairline awareness level; decorative only |

The existing `--ds-alpha-gold-30` round-dot layer is **unchanged**; it remains the
drawer texture below the breakpoint. Textures are aria-hidden decoration; removal
(forced colors, user agents) must leave every label intact.

## 2. Icon mask additions (`tokens/icons.css`)

| Token             | Glyph         | Used for                                       |
| ----------------- | ------------- | ---------------------------------------------- |
| `--ds-icon-lock`  | padlock       | Live-card desktop `Encrypted` segment (FR-004) |
| `--ds-icon-steps` | numbered list | `Survey steps` label (FR-005)                  |

Same black-geometry data-URI convention tinted via `background-color`; each ships
adjacent to text (never the sole carrier of meaning).

## 3. Class hooks (new) and desktop restyles

### 3.1 New classes (contract: name → surface → gating)

| Class                                                  | Surface                                                           | Gating                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `.dock-badge` + `.dock-monogram`                       | Circular gold ring + maroon monogram letter in the dock brand row | `only-desktop` + `collapse-hide`; square `.dock-brand-mark` hidden ≥64 rem                          |
| `.live-sub-desktop`                                    | Live-card meta line with lock glyph + segments                    | `only-desktop`; `.live-sub` hidden ≥64 rem                                                          |
| `.survey-steps-label`                                  | `Survey steps` caps label with steps glyph, above step list       | `only-desktop` + `collapse-hide`                                                                    |
| `.step-counts-desktop`                                 | Step-row counts text                                              | `only-desktop`; `.step-counts` hidden ≥64 rem                                                       |
| `.dock-secure-panel`                                   | Bordered panel: shield tile + `Private & secure` + body line      | `only-desktop` + `collapse-hide`; `.dock-security` hidden ≥64 rem (never removed — untouched below) |
| `.dock-theme-caption`                                  | Centered caption at dock bottom                                   | `only-desktop` + `collapse-hide`                                                                    |
| `.step-pill`                                           | Gradient capsule `STEP N OF M` in card header eyebrow row         | `only-desktop`; existing `Step N` eyebrow hidden ≥64 rem                                            |
| `.card-counts-caps`                                    | `R REQUIRED • O OPTIONAL` caps                                    | `only-desktop`; counts keep existing data                                                           |
| `.card-icon-tile`                                      | Bordered page-icon tile, card header inline-end                   | `only-desktop`; inline `.page-icon` hidden ≥64 rem                                                  |
| `.shell-footer`                                        | Column below survey card (answering + completion states)          | `only-desktop`                                                                                      |
| `.palette-capsule`, `.palette-swatch`, `.palette-chip` | Palette caption capsule with 3 role swatches                      | inside `.shell-footer`                                                                              |
| `.platform-line`                                       | Centered platform copy line                                       | inside `.shell-footer`                                                                              |

### 3.2 Desktop restyles (existing hooks, media-query-confined rules only)

| Base hook                                                            | Desktop change                                                                                                                                                                                                                                |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.dock::before`                                                      | Background switches to the sparkle tiles at `--ds-dock-texture-opacity` (base dot layer untouched for drawer)                                                                                                                                 |
| `.dock-brand-mark`                                                   | `display: none` (replaced by `.dock-badge`)                                                                                                                                                                                                   |
| `.live-sub`, `.page-step .step-counts`, `.step-country eyebrow text` | `display: none` (replaced by §3.1 desktop variants)                                                                                                                                                                                           |
| `.page-step` active row                                              | Reference treatment already shipped by 006 and verified, not changed: gold-gradient number tile + gold border + inline-end chevron cue (gold on active, muted chevron on gated rows) + disabled affordance — states never color-only (FR-006) |
| `.menu-btn`                                                          | `only-mobile` removed → visible at all widths; desktop click → rail toggle with `aria-pressed`; below breakpoint behavior/geometry byte-identical                                                                                             |
| `.card-eyebrow-row`                                                  | Desktop layout: pill + caps counts inline-start, icon tile inline-end; mobile order unchanged                                                                                                                                                 |

## 4. Contrast: covered by existing verified pairs (no new pairs were added)

Every new surface composes pairs that 004/006 already machine-verify, so **no new pairs
were added** to `CONTRAST_PAIRS`; the automated check re-verifies the matrix below each
run. The badge monogram ships as gold text on the dark disc (not maroon-on-gold as
drafted) precisely to reuse the verified dock pair.

| Surface                                                   | Foreground → Background                                                               | Existing verified pair             |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------- |
| `Survey steps` label, dock caption, badge monogram letter | `--ds-color-accent-on-dark` (gold-300) → `--ds-color-surface-dock` (maroon-950)       | 006 'dock gold labels' — 13.78:1   |
| secure panel body                                         | `--ds-color-text-muted-on-dock` (gold-200) → `--ds-color-surface-dock`                | 006 'dock muted text' — (check)    |
| secure panel title                                        | `--ds-color-text-on-dock` → `--ds-color-surface-dock`                                 | 006 'dock primary text' — 17.42:1  |
| `STEP N OF M` pill text                                   | `--ds-color-text-on-primary` (white) → `--ds-color-primary` (maroon-700 gradient top) | 004 'text on primary fill'         |
| palette chip text                                         | `--ds-color-text-muted` → `--ds-color-surface` (capsule fill)                         | 004 'muted text on surface'        |
| platform line                                             | `--ds-color-text-muted` → `--ds-color-canvas`                                         | 006 'muted text on cream' — 4.77:1 |

Swatches, sparkle, the monogram ring, and icon tiles are decorative (no minimum beyond
the 3:1 already guaranteed by their adjacent text treatments).

## 5. Copy-string contract (exact static strings)

| Slot                   | String                                                                                                                                                           | Source                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Steps label            | `Survey steps`                                                                                                                                                   | static                                   |
| Secure panel title     | `Private & secure`                                                                                                                                               | static                                   |
| Secure panel body      | `Your responses are encrypted & securely stored.`                                                                                                                | reuse of existing drawer note (verbatim) |
| Dock caption           | `Maroon • Gold • Cream Theme`                                                                                                                                    | static                                   |
| Live-card desktop line | `{sectionsLabel} • {minutesLabel} • Encrypted` with `~M min` omitted when absent                                                                                 | presenter `liveCardMeta`                 |
| Step counts            | `{total} question(s) • {answered}/{total} done`                                                                                                                  | presenter `stepCountsLabel`              |
| Step pill              | `STEP {n} OF {m}` (display caps)                                                                                                                                 | existing page index/length               |
| Counts line            | `{r} REQUIRED • {o} OPTIONAL` (display caps)                                                                                                                     | existing required/optional tally         |
| Palette capsule        | `Palette —` + chips `Maroon primary`, `Metallic gold secondary`, `Warm cream tertiary`                                                                           | static                                   |
| Platform line          | `© {year} Regional Survey Platform • Secured & Encrypted • Dock Navigation Edition`                                                                              | static + `platformYear()`                |
| Storage key            | `survey.dock.mode` ← `expanded` \| `collapsed` (one device-local value; desktop-only reads/writes; corrupt/absent → `expanded`; storage failures → session-only) | `dock-preference.ts`                     |

Forbidden (FR-013): `Draft saved`, `Save draft`, `Payload`, `JSON`, `Reset`, and any
elapsed timer string MUST NOT appear in shipped UI; reference brand names
(`GCC Insights`, `Resident Survey • 2026`) MUST NOT appear.

## 6. Desktop geometry (rules; measured values recorded at implementation)

Root 16 px; viewports 1440×900, 1280×800, 1024×768; values recorded during
implementation exactly like the 006 contract.

| #    | Surface              | Rule                                                                                                                                                                            | Driving token(s)               |
| ---- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| G-01 | `.dock-badge`        | Circle: gold-gradient ring (`--ds-color-accent-*`) + dark disc (`--ds-color-surface-dock`); box ≈ `--ds-touch-target` aligned to brand row; centered gold monogram, never wraps | `--ds-touch-target`, gold ramp |
| G-02 | `.step-pill`         | Pill radius, gradient `--ds-color-primary`(700→800), compact vertical padding; never truncates `STEP N OF M`                                                                    | radii + space scale            |
| G-03 | `.card-icon-tile`    | Square ≈ `--ds-touch-target`, `--ds-radius-lg`, 1 px `--ds-color-primary-border`, glyph ≈ `--ds-icon-size`                                                                      | existing tokens only           |
| G-04 | `.dock-secure-panel` | Bordered (`--ds-color-border-on-dock`), `--ds-radius-xl`, shield tile gold-bordered; body wraps cleanly at dock width                                                           | radii + borders                |
| G-05 | `.palette-capsule`   | Centered, surface fill, pill radius; swatch dots ≈ `--ds-space-sm`                                                                                                              | radii + space scale            |
| G-06 | `.platform-line`     | Centered, `--ds-font-size-3xs`, muted on canvas                                                                                                                                 | typography scale               |
| G-07 | Desktop sweep        | No horizontal page scroll 1024→1920 px including at 200% zoom; dock content never overflows the rail (hidden chrome stays hidden)                                               | SC-003                         |

| Viewport | badge | pill height | icon tile | secure panel width | capsule max-width | hscroll |
| -------- | ----: | ----------: | --------: | -----------------: | ----------------: | :------ |
| 1440×900 |    44 |         ≈20 |        44 |                290 |       content-fit | no      |
| 1280×800 |    44 |         ≈20 |        44 |                290 |       content-fit | no      |
| 1024×768 |    44 |         ≈20 |        44 |                290 |       content-fit | no      |
