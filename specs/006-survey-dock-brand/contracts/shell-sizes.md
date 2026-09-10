# Contract: Survey Dock Shell Geometry

**Feature**: [006-survey-dock-brand](../spec.md) | **Companion**:
[005 ui-sizes.md](../../005-dropdown-menu-sizing/contracts/ui-sizes.md) (question-surface
geometry, unchanged) · [brand-delta.md](brand-delta.md) (tokens that drive these sizes)

This file states the geometry rules for the dock shell — dock, rail, drawer, topbar,
progress card, survey card, ring, pills, and toast — plus the measured values at the five
documented viewports. Derivations are normative (a reviewer re-derives them from tokens);
measured values are recorded during implementation with a 16 px root font and default
browser settings, exactly like the 005 contract.

## 1. Rules

| # | Surface | Rule | Driving token(s) |
| - | ------- | ---- | ---------------- |
| R-01 | Expanded dock (desktop ≥1024 px) | Fixed to the viewport's inline-start, full height, exactly `--ds-dock-width`; the main column is offset by the same width | `--ds-dock-width` |
| R-02 | Collapsed rail (desktop) | Exactly `--ds-dock-rail-width`; shows step tiles + compact progress only; labels hidden, not merely transparent (no accessible-name loss: tiles keep `aria-label`) | `--ds-dock-rail-width` |
| R-03 | Mobile drawer (<1024 px) | Slide-in panel exactly `--ds-drawer-width` = `min(20.625rem, 88vw)`; dimmed blurred backdrop covers the viewport; body content never shifts | `--ds-drawer-width`, `--ds-z-modal`, `--ds-z-overlay` |
| R-04 | Dock step region | Independently scrollable (`overflow-y: auto`) between a fixed header and a fixed footer; a 12-step survey scrolls the list, never the page | — (structural) |
| R-05 | Progress ring | `--ds-ring-size` square; stroke from the gold decorative role; percentage centered in tabular numerals | `--ds-ring-size`, `--ds-color-accent-decorative` |
| R-06 | Topbar | Sticky, `--ds-topbar-height`, blurred cream, inner capped at `--ds-topbar-max`; contains menu toggle (44 px target), breadcrumb, and title — all three visible at 320 px | `--ds-topbar-height`, `--ds-topbar-max`, `--ds-touch-target` |
| R-07 | Progress card | Full content width; page pill + percent row, gradient bar (`--ds-space-2xs` track), answered-count row | `--ds-space-*`, `--ds-color-selection`, `--ds-color-accent-decorative` |
| R-08 | Survey card | Content column capped at `--ds-content-max`, `--ds-radius-2xl`, white elevated; header gradient cream-100 → white; footer actions row wraps without overlap at 320 px | `--ds-content-max`, `--ds-radius-2xl`, `--ds-shadow-panel`, `--ds-cream-*` |
| R-09 | Mobile step pills | Horizontally scrollable strip (`overflow-x: auto`) under the topbar; each pill ≥ 44 px tall; current/completed/upcoming distinguishable without color | `--ds-touch-target` |
| R-10 | Toast | Fixed bottom-center, max `--ds-toast-max`; auto-dismiss per `--ds-toast-duration`; never covers a footer action at 320 px (sits above it in `z`) | `--ds-toast-max`, `--ds-z-toast`, `--ds-toast-duration` |
| R-11 | Question geometry | Unchanged: `--ds-control-height`, `--ds-select-list-max-height`, `--ds-select-panel-max-height`, `--ds-select-option-min-height`, `--ds-z-active-card` keep their 005 derivations and values | 005 contract |
| R-12 | No horizontal page scroll | At every documented viewport, no shell surface extends past the viewport; the page scrolls vertically only | — (verified by review + SC-004) |

## 2. Measured values (root 16 px; recorded during implementation)

`dock` = expanded dock width · `rail` = collapsed rail · `drawer` = drawer width ·
`top` = topbar height · `ring` = ring box · `card` = survey-card content width ·
`pill` = mobile pill height · `hscroll` = horizontal page scroll present?

| Viewport | Shell state | dock | rail | drawer | top | ring | card | pill | hscroll |
| -------- | ----------- | ---: | ---: | -----: | --: | ---: | ---: | ---: | :-----: |
| 320 × 640 | drawer | — | — | 282 | 68 | 58 | 288 | 44 | no |
| 375 × 812 | drawer | — | — | 330 | 68 | 58 | 343 | 44 | no |
| 768 × 1024 | drawer | — | — | 330 | 68 | 58 | 736 | 44 | no |
| 1280 × 800 | dock | 322 | 96 | — | 68 | 58 | 894 | — | no |
| 1440 × 900 | dock | 322 | 96 | — | 68 | 58 | 1054 | — | no |

Notes:

- Drawer at 320 px: `min(330, 0.88 × 320)` = 281.6 → 282 px. All other drawer widths hit
  the 330 px cap.
- `card` values are content-column widths inside the padded shell at each viewport and
  are re-measured (not re-derived) during implementation; a >1 px drift from the shipped
  CSS fails review of this contract.
- `pill` applies only below 1024 px; `rail` applies only at/above 1024 px.
- The automated check asserts the *tokens* (existence, documentation, and use on the
  shell selectors) and the *drawer-cap formula*; the ruler values above are verified by
  the quickstart review pass, exactly as in 005.
