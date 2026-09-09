# Design System Definition & Design Tokens — Enterprise Application Foundation

Normative companion to `spec.md` for the enterprise application product area.
Covers requested deliverables **4 (Design System Definition)** and **11 (Design Tokens)**.
§1 System definition · §2 Color · §3 Spacing · §4 Radius · §5 Elevation · §6 Typography ·
§7 Motion · §8 Layout & geometry · §9 Token architecture & naming · §10 Light token set ·
§11 Dark token set · §12 Accessibility mode tokens · §13 Guaranteed contrast pairs ·
§14 Implementation mapping notes.

The visual language is **Fluent 2 inspired**: neutral-first surfaces, one deliberate
accent, 8px rhythm, 8–12px radii, soft elevation, modern type. It applies to this
product area only; the survey viewer keeps its separate maroon identity.

---

## §1 System definition

- **Personality**: calm, competent, friendly. Surfaces are neutral and quiet; the
  accent is used for what is actionable and current, never decoration.
- **Rhythm**: all spacing, sizing, and layout offsets derive from the 8px base grid
  (4px is permitted only for icon-to-glyph micro-gaps).
- **Shape**: controls are rounded (8px base, up to 12px for elevated surfaces);
  pills only for status/tag/persona items. Consistent per component class — no
  per-page shape drift.
- **Elevation**: flat by default; soft shadows only where layering is real
  (popovers, drawers, dialogs, sticky header), never decorative.
- **Text**: modern UI type stack with a restrained ramp; hierarchy via size/weight,
  not color alone.
- **Mode support**: every token resolves in light and dark; accessibility mode swaps
  in the §12 overrides.

---

## §2 Color

### 2.1 Brand accent (blue)

| Name | Light | Dark | Usage |
|---|---|---|---|
| brand | `#0078D4` | `#4CC2FF` | Primary actions, links, focus accents, selected states |
| brand-hover | `#106EBE` | `#6CB8F6` | Primary hover |
| brand-pressed | `#005A9E` | `#3AA0F3` | Primary pressed/active |
| brand-strong | `#005FB8` | `#9BD7FF` | Text links, icons on dark |
| brand-tint | `#EFF6FC` | `#0A2C42` | Selected row/surface tint, info backgrounds |

### 2.2 Status

| Name | Light | Dark | Usage |
|---|---|---|---|
| success | `#107C10` | `#6CCB5F` | Success text/icons; filled success on light uses paired white text |
| success-bg | `#DFF6DD` | `#0B3B0B` | Success status surfaces |
| warning | `#FFB900` | `#FCE100` | Warning accent (glyph) |
| warning-text | `#9D5D00` | `#FCE100` | Warning text on light surfaces (AA pair) |
| warning-bg | `#FFF4CE` | `#3B2E00` | Warning surfaces |
| error | `#D13438` | `#FF99A4` | Error text/icons |
| error-bg | `#FDE7E9` | `#442726` | Error surfaces/empty region fills |

### 2.3 Neutrals (grayscale)

| Name | Light | Dark | Usage |
|---|---|---|---|
| surface | `#FFFFFF` | `#1B1A19` | Page background |
| surface-raised | `#FFFFFF` | `#292827` | Cards, popovers, drawers, dialogs |
| surface-sunken | `#FAF9F8` | `#141414` | Alternating rows, wells |
| surface-tinted | `#F5F5F5` | `#242424` | Hover wells, subtle fills |
| stroke (default border) | `#E1DFDD` | `#484644` | Hairlines, dividers, control borders |
| stroke-strong | `#C8C6C4` | `#A19F9D` | Stronger borders, control hover borders |
| text-primary | `#1B1A19` | `#F3F2F1` | Body text, headings |
| text-secondary | `#605E5C` | `#C8C6C4` | Secondary text, metadata |
| text-disabled | `#A19F9D` | `#797775` | Disabled text (with disabled fill) |
| text-on-accent | `#FFFFFF` | `#0A0A0A` | Text on filled brand buttons |
| text-on-status | `#FFFFFF` | `#0A0A0A` | Text on filled success/error buttons |

All text pairs above meet WCAG 2.2 AA in their mode (§13 states the guaranteed pairs).

---

## §3 Spacing (8px system)

Base unit 8px. Scale in px with rem equivalents at 16px root (planning reference):

| Token | px | rem |
|---|---|---|
| sp-0 | 0 | 0 |
| sp-05 | 4 | 0.25 |
| sp-1 | 8 | 0.5 |
| sp-1-5 | 12 | 0.75 |
| sp-2 | 16 | 1 |
| sp-2-5 | 20 | 1.25 |
| sp-3 | 24 | 1.5 |
| sp-4 | 32 | 2 |
| sp-5 | 40 | 2.5 |
| sp-6 | 48 | 3 |
| sp-8 | 64 | 4 |

Rhythm rules: control-to-label gap 8; field-to-field gap 16; section gap 24–32;
page padding 24 (narrow 16); card padding 16–24; list row padding 8/12 vertical.

---

## §4 Radius

| Token | Value | Usage |
|---|---|---|
| radius-sm | 8px | Inputs, buttons, chips, badges, small controls |
| radius-md | 10px | Cards, tables' containers, menu items (optional) |
| radius-lg | 12px | Dialogs, drawers, popover panels, large cards |
| radius-pill | 999px | Tags, status pills, avatars, toggle knobs, search pill |

The brief's 8–12px range is honored: interactive controls 8, elevated surfaces 10–12.

---

## §5 Elevation (soft shadows)

| Token | Light | Dark | Usage |
|---|---|---|---|
| elevation-1 | `0 1.6px 3.6px 0 rgba(0,0,0,.13), 0 0.3px 0.9px 0 rgba(0,0,0,.10)` | stronger alpha | Menus, popovers, tooltips |
| elevation-2 | `0 6.4px 14.4px 0 rgba(0,0,0,.13), 0 1.2px 3.6px 0 rgba(0,0,0,.10)` | stronger alpha | Drawers, dialogs, search overlay |
| elevation-sticky | `0 1.2px 2.4px rgba(0,0,0,.08)` | stronger alpha | Sticky header, sticky columns |

Dark elevations raise alpha (~1.5–1.8×) so shadows read on dark surfaces. Reduced
motion/accessibility mode keeps static shadows but removes animated transitions
(§7, §12).

---

## §6 Typography

Font stack: `"Segoe UI Variable", "Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif`.
Tabular numbers for numeric table columns.

| Token | Size/Line | Weight | Usage |
|---|---|---|---|
| type-caption | 12/16 | 400 | Metadata, timestamps |
| type-body | 14/20 | 400 | Default body, table cells |
| type-body-strong | 14/20 | 600 | Emphasis within body, list titles |
| type-subtitle | 18/24 | 600 | Card titles, section subtitles |
| type-title | 20/28 | 600 | Page titles (h1 on non-home) |
| type-title-large | 28/36 | 600 | Dashboard hero heading |
| type-display | 40/52 | 600 | Reserved (marketing/hero only) |

Casing: sentence case everywhere (no ALL CAPS except data values). Hierarchy is
size/weight; color roles per §10/§11.

---

## §7 Motion

| Token | Value | Usage |
|---|---|---|
| motion-fast | 120ms | Hover, micro-feedback, color changes |
| motion-standard | 200ms | Drawer/menu/popover in-out, accordion, tooltip |
| motion-complex | 300ms | Stepper transitions, large layout shifts (rare) |
| motion-ease | cubic-bezier(.2,.0,0,1) | Fluent-like deceleration (out) |
| motion-ease-in-out | cubic-bezier(.33,0,.67,1) | In-out transitions |

Rules: only one meaningful motion per interaction; never animate layout-affecting
properties for loading; respect `prefers-reduced-motion` and accessibility mode
(animate opacity/transform only, ≤120ms, or none).

---

## §8 Layout & geometry

| Token | Value | Usage |
|---|---|---|
| header-height | 48px | Sticky top header |
| nav-rail-width | 48px | Collapsed side navigation |
| nav-expanded-width | 256px | Expanded side navigation |
| nav-drawer-width | min(320px, 85vw) | Narrow-screen drawer |
| content-max-width | 1400px | Centered page content ceiling |
| page-gutter | 24px (16 narrow) | Horizontal content padding |
| touch-target | 44px (mobile) / 32px (desktop mouse) | Interactive targets |
| a11y-touch-target | 48px | Accessibility mode target floor |
| breakpoint-small | 640px | Layout collapse points |
| breakpoint-medium | 1024px | Layout expansion points |

Z-order scale (stacking): `z-header 100 · z-sticky 200 · z-overlay 300 ·
z-drawer 400 · z-dialog 500 · z-toast 600`. Breadcrumb/command bar live in content
flow (no z token).

---

## §9 Token architecture & naming

Two layers:

1. **Core/primitive tokens** — raw values (hex, px, timing). Namespaced by family:
   `core.color.brand.primary`, `core.space.8`, `core.radius.lg`, `core.shadow.elev2`,
   `core.type.body`.
2. **Semantic tokens** — meaning-bound references consumed by UI parts:
   `sem.color.background.page`, `sem.color.action.primary.default`,
   `sem.color.text.body`, `sem.space.page-gutter`, `sem.radius.control`,
   `sem.shadow.popover`, `sem.type.body`.

UI parts reference **only semantic tokens**; modes (light/dark/accessibility) are
implemented as semantic-token sets. This keeps one code path for theming and
guarantees FR-002/FR-003/FR-004 are testable (e.g., swap a semantic set and the whole
product restyles).

---

## §10 Light token set (semantic)

| Semantic token | Value |
|---|---|
| color.background.page | core.color.neutral.surface (`#FFFFFF`) |
| color.background.raised | `#FFFFFF` |
| color.background.sunken | `#FAF9F8` |
| color.background.hover | `#F5F5F5` |
| color.background.selected | core.color.brand.tint (`#EFF6FC`) |
| color.background.disabled | `#F3F2F1` |
| color.text.body / .heading | `#1B1A19` |
| color.text.secondary | `#605E5C` |
| color.text.disabled | `#A19F9D` |
| color.action.primary.default / hover / pressed | `#0078D4` / `#106EBE` / `#005A9E` |
| color.action.primary.text | `#FFFFFF` |
| color.action.secondary | transparent over `#FFFFFF` surface w/ `#E1DFDD` border |
| color.action.destructive | `#D13438` (hover `#B02E30` pressed `#932426`) |
| color.focus.ring | `#005FB8` outer + `#FFFFFF` inner (3:1 against neighbor) |
| color.stroke.default / strong | `#E1DFDD` / `#C8C6C4` |
| color.link | `#005FB8` (visited `#4F3680`? → use `#5156AD`) |
| surface border, table row hover | via stroke + `#F5F5F5` |
| status fills | §2.2 light values |

---

## §11 Dark token set (semantic)

Same semantic names; key values:

| Semantic token | Value |
|---|---|
| color.background.page | `#1B1A19` |
| color.background.raised | `#292827` |
| color.background.sunken | `#141414` |
| color.background.hover | `#323130` |
| color.background.selected | core.color.brand.tint dark (`#0A2C42`) |
| color.text.body / .heading | `#F3F2F1` |
| color.text.secondary | `#C8C6C4` |
| color.action.primary.default / hover / pressed | `#4CC2FF` / `#6CB8F6` / `#3AA0F3` |
| color.action.primary.text | `#0A0A0A` |
| color.focus.ring | `#4CC2FF` outer + `#1B1A19` inner |
| color.stroke.default / strong | `#484644` / `#A19F9D` |
| color.link | `#9BD7FF` |
| status fills | §2.2 dark values |

---

## §12 Accessibility mode tokens

Applied on top of light or dark as an override set (spec FR-004):

- `sem.color.focus.ring` → `#000000` (light) / `#FFFFFF` (dark) double 2px ring with
  maximum neighbor contrast, never removed.
- Contrast-max surfaces: page/raised pushed to the extreme of the mode (pure
  `#FFFFFF`/`#000000` surfaces where feasible) and text-secondary darkened/lightened
  to ≥7:1.
- Touch/click targets floor raised to 48px (`sem.size.touch.a11y`).
- Motion: `motion-duration-*` tokens collapse to ≤1ms (effectively off) and animated
  affordances render statically.
- Focus + selection remain distinguishable in addition to color (underline, ring,
  icon) so color is never the only cue.

---

## §13 Guaranteed contrast pairs (WCAG 2.2 AA)

Every semantic color pair used for text/UI in the shipped token sets is verified
against these floors (implementation verification step):

| Pair | Floor | Typical ratio |
|---|---|---|
| text.body/heading on page & raised surfaces | 4.5:1 | ≥ 12:1 (light), ≥ 11:1 (dark) |
| text.secondary on page & raised | 4.5:1 | ~5.9:1 (light), ~7.4:1 (dark) |
| text.on.accent on brand primary (filled buttons) | 4.5:1 | ≥ 4.7:1 |
| error/success/warning text on their surfaces | 4.5:1 | verified per pair in §2.2 |
| UI component boundaries (borders, focus rings) vs neighbor | 3:1 | verified per token set |
| placeholder text | 4.5:1 | same floor as secondary |

Any token combination that cannot meet its floor in a mode MUST NOT ship; a11y-mode
overrides (§12) are the escalation path.

---

## §14 Implementation mapping notes

These notes are implementation-level detail for the plan phase; they live here so
`spec.md` stays technology-agnostic.

- Semantic tokens are exposed as CSS custom properties (design-token layer) on a
  theme root; mode switching swaps the property set (light / dark / a11y), matching
  the repository's constitution technology constraints.
- The product builds on the repository-mandated UI component library and layout
  framework. Its built-in theme is used as the *base* theme; component-level
  appearance is then overridden exclusively through the token properties above so the
  resulting look matches §2–§8 (see `primeng-component-mapping.md` for the per-
  component token wiring).
- Spacing tokens map to the layout framework's utility scale where it is 8px-
  compatible (0.5rem base) and to custom utilities otherwise; no hard-coded spacing
  in application code.
- Typography tokens set the global font stack and per-component font properties;
  numeric columns opt into tabular numerals.
- Token value changes require a single-file update (per mode) and must be verified by
  the mode-swap test in spec FR-003/SC-009.
