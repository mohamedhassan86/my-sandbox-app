# Quickstart: Survey Design System

## Prerequisites

- Node/pnpm environment set up for this workspace (`pnpm install` completed).
- Familiarity with [contracts/design-tokens.md](contracts/design-tokens.md) and
  [contracts/css-classes.md](contracts/css-classes.md).
- The visual reference: [public/theme-preview.png](../../public/theme-preview.png).

## 1. Run the automated design-system check

```powershell
pnpm exec vitest run src/app/shared/design-system
```

Expected: the contract check passes and reports how many tokens, contrast pairs, and
classes were verified. To see it fail, change any semantic text token in
`src/styles/tokens/semantic.css` to a value below the contrast threshold, re-run, and
confirm the failing pair is named. Revert afterwards.

## 2. Run the app and review the reference match

```powershell
pnpm start
```

Open `http://localhost:4200/` and check, against the attachment:

- The page canvas is the reference pink (`#fbafbc`) and the survey sits on white panels
  with generous rounded corners and a soft shadow.
- The survey title uses the serif display role; question prompts use the muted UI text role
  and are clearly larger than body text.
- Rating questions render ten neutral tiles with endpoint labels beneath them; the selected
  tile is the reference blue (`#1524d9`) with white text.
- Satisfaction questions render five icon tiles; the selected tile is blue and the label
  stays readable.
- Single/multi-select options flow in multiple columns on desktop and stack on mobile.

## 3. Validate the states

- **Answered:** answer every question on a page — each card gains an "answered" cue that is
  not color-only.
- **Invalid:** leave a required question empty and press Next — the question card shows the
  error tint/border, the control is flagged invalid, and the message is announced
  (`role="alert"`).
- **Focus:** tab through the page — every control shows a visible focus ring, and the step
  rail, tiles, toggles, and dropdown all remain operable.
- **Progress:** move between pages — the progress bar tweens, the current step is marked
  current, completed steps carry a check cue, and unreachable steps are disabled.
- **Completion:** submit the survey — the summary card reports 100% complete with a success
  treatment.

## 4. Validate responsive and motion behaviour

- Resize from 320 px to 1440 px (or use device emulation): no horizontal scrolling, tiles
  and option groups reflow to a single column, and the mobile drawer shows progress,
  current page, and remaining pages.
- Enable the OS "reduce motion" setting and reload: entrance animations, tile selection
  pulses, and progress tweens must be imperceptible while every state stays distinguishable.
- Zoom to 200%: text remains readable and no control is clipped.

## 5. Build

```powershell
pnpm run build
```

Expected: production build succeeds. Budget numbers are reported below.

## 6. Full verification (recorded results, 2026-09-10)

```powershell
pnpm exec vitest run
pnpm exec ng build
```

- **Contract check**: `src/app/shared/design-system/design-token.contract.spec.ts` runs 13
  assertions over the shipped stylesheets — token resolution, literal-colour discipline,
  spacing discipline, token documentation coverage, class documentation coverage, spacing /
  radius / duration ordering, type-scale monotonicity, the documented contrast pairs,
  reduced-motion collapse, compositor-only animation, and the PrimeNG token bridge.
- **Unit tests**: 17 test files, 104 tests passed, 0 failed (baseline before this feature:
  16 files / 91 tests). No existing test needed changing, which is the evidence that this
  feature is appearance-only.
- **Production build**: succeeded with no budget warnings. `styles.css` is 58.53 kB raw /
  8.16 kB transfer (was 1.93 kB / 661 B) and the initial total is 631.70 kB / 140.03 kB
  transfer (was 564.51 kB / 132.18 kB). The `anyComponentStyle` (8 kB / 16 kB) and `initial`
  (700 kB / 1.2 MB) budgets were raised in `angular.json` as recorded in
  [plan.md](plan.md) Complexity Tracking — the shared survey stylesheet already exceeded the
  previous 4 kB warning before this feature.
- **Formatting**: every file added or changed by this feature passes
  `pnpm exec prettier --check`.

### Manual review (open the running preview)

The development server is configured with `allowedHosts` in `angular.json` so the hosted
preview and `localhost` both work. Steps 2-4 above are reviewer steps; the checklist to walk
through is:

1. Canvas is the reference pink, panels are white with the panel radius/shadow, the survey
   title is serif, and question prompts are muted and clearly larger than body text.
2. Rating tiles: ten neutral tiles, endpoint labels beneath, selected tile in the reference
   blue with white text and a check cue.
3. Satisfaction: five icon tiles, selected tile blue with a readable caption.
4. Options flow in multiple columns on desktop and stack into one column at 320 px with no
   horizontal scrolling.
5. Validation: leave a required question empty and press Next — the card gains the error
   tint/border and cue, the field is flagged invalid, and the message is announced.
6. Progress: the bar tweens between pages, the current step is marked, completed steps show
   a check cue, and unreachable steps are disabled.
7. Toggle "reduce motion" in the OS and reload: no entrance, selection, or progress motion is
   perceptible and every state stays distinguishable.
8. Keyboard-only pass: tab through the survey; every control shows the focus ring and the
   dropdown/toggle stay operable.
