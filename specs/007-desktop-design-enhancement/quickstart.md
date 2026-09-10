# Quickstart: verifying the Desktop Design Enhancement

**Feature**: [007-desktop-design-enhancement](spec.md) — desktop parity with
`public/theme-preview.png`; mobile byte-identical below 64 rem; device-persistent
dock mode. Contracts live in [contracts/desktop-chrome.md](contracts/desktop-chrome.md);
derived strings in [data-model.md](data-model.md).

## 1. Run the app

```powershell
pnpm install
pnpm start
```

Open `http://localhost:4200` (any catalog survey). Use browser dev tools device
toolbar for width checks, and a second profile/origin only for the storage checks
(neither affects survey answers).

## 2. Dock identity on desktop (story 1) — 1440 px and 1024 px

Compare against `public/theme-preview.png`, dock region by region:

- Texture: sparkle/star tessellation replaces the round dots (decorative, static).
- Brand row: circular gold badge with the survey title's first letter (maroon);
  `Customer Feedback Survey` renders `C`.
- Live card: sub line reads `N section(s) • ~M min • Encrypted` with a lock glyph;
  on the 8-step manifest entry, verify against its `estimatedMinutes`.
- `Survey steps` caps label (with list glyph) sits above the step list.
- Step rows read `N questions • A/B done`; active row has the gold-gradient number
  tile + gold border + chevron, completed shows the green check, gated rows show the
  ring cue and are disabled — states readable without color.
- `Private & secure` panel with shield tile and the documented body copy.
- `Maroon • Gold • Cream Theme` caption centered at the dock's bottom edge.
- Collapse to the rail: badge/label/panel/caption all disappear; the rail matches its
  previous compact form; expand again.

## 3. Mobile byte-identity (story 2) — 320 px, 375 px, 768 px

For each width, walk load → answer → validation error → navigate → submit →
completion → restart:

- Drawer opens/closes identically (menu button, backdrop, Escape); dock texture is
  the round dots; live card shows the previous two-line content; step rows show the
  previous `A/B done` format; the one-line security note is present (no panel);
  no theme caption; no palette capsule/platform line anywhere.
- Nothing overlaps, shifts, or renders either new or missing relative to the shipped
  build. (Confinement review: every 007 diff must touch only `only-desktop` content
  or rules inside the existing `64rem` media query.)

## 4. Topbar toggle and persistence (story 3) — 1440 px

- Click the topbar maroon menu button: dock collapses to the rail; again: expands.
  The dock-header chevron does the same (shared state).
- Keyboard: Tab to the button — visible focus ring, ≥44 px target; Enter and Space
  both toggle; a screen reader announces the pressed/expanded state on desktop.
- Reload the page with the dock collapsed: it renders **collapsed immediately**
  (no expand-then-collapse flash). Reload expanded → stays expanded.
- Dev tools → Application → clear site storage → reload: dock starts expanded again.
- Block storage (edge/privacy mode or dev-tools override): toggle still works during
  the session, no error appears; next reload starts expanded.
- Resize below 1024 px: the button returns to pure drawer behavior; the stored
  preference has no effect on mobile.

## 5. Survey-card header (story 4) — 1440 px

- Page through all steps: header shows gradient pill `STEP 1 OF 3` (etc.), caps line
  `2 REQUIRED • 1 OPTIONAL` matching the page's real tallies, and the bordered icon
  tile at the header's right edge.
- A page without `icon`/`description` renders the default icon tile and skips the
  description cleanly.
- Below 1024 px the header is exactly the shipped treatment (inline icon, `Step N`
  eyebrow).

## 6. Palette capsule and platform line (story 5) — 1440 px

- Below the survey card: centered capsule `Palette —` + the three chips with
  maroon/gold/cream swatch dots; beneath it
  `© {current year} Regional Survey Platform • Secured & Encrypted • Dock Navigation Edition`.
- Still visible after submission (completion state).
- Absent below 1024 px; swatch dots are decorative (the chips remain meaningful
  without them).

## 7. Robustness sweeps

- 200% zoom at 1440 px: no clipped text, overlapping targets, or horizontal scroll.
- Width sweep 1024 → 1920 px; cross the 1024 px boundary live: chrome appears/vanishes
  without leftover artifacts.
- Reduced motion enabled: no new motion; entrance timing collapses per the global rule.
- A long survey title truncates as before; monogram stays one centered letter.
- An invalid survey definition shows the existing error — no new chrome around it.

## 8. Run the checks

```powershell
pnpm exec vitest run src/app/core src/app/survey src/app/shared
pnpm exec prettier --check .
pnpm exec ng build
```

Expected:

- New unit suites pass: `desktop-chrome.presenters` and `dock-preference` (including
  blocked-storage fallback, corrupt-value normalization, desktop gating); updated
  survey-view and survey-navigation specs (toggle branch, pressed state, desktop-only
  hooks present).
- The design-system contract test now additionally merges the 007 contract: new
  tokens/glyphs/patterns exist and are documented, new class hooks ship with their
  documented gating, and every added contrast pair (contract §4) passes.
- All pre-existing tests pass unmodified — answer values, validation messages, page
  gating, and submission payloads remain byte-identical for the same inputs (SC-004).
