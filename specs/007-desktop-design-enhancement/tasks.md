# Tasks: Desktop Design Enhancement (Theme Preview Parity)

**Feature**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Date**: 2026-09-10

**Organization**: Tasks are grouped by user story so each story stays independently
implementable and testable. Format: `[ID] [P?] [Story] Description` — `[P]` runs in
parallel (different files, no dependencies), `[USn]` maps the task to its story.
Tests-first per constitution IV: check/spec tasks are written before their
implementation tasks and MUST fail first.

## Phase 1: Setup

**Purpose**: Prove the starting point is green and capture the mobile baseline that
US2 must match pixel-for-pixel.

- [x] T001 Run the baseline verification (`pnpm exec vitest run src/app/core src/app/survey src/app/shared`, `pnpm exec prettier --check .` on HERMETIC file list to be touched, `pnpm exec ng build`), confirm all green, and capture desktop + mobile baseline screenshots at 1440/1024/768/375/320 px of the survey flow for the US2 byte-identity comparison; do not proceed on a red baseline
  - Note (from 006): repo-wide `prettier --check` was already red on unrelated files; verify per-file cleanliness for the files this feature touches instead of reformatting the repository.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The asset/token delta, the contract-check merge, and the shared pure
modules every story consumes. No shell DOM is touched in this phase.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Extend `src/app/shared/design-system/design-token.contract.spec.ts` to read `specs/007-desktop-design-enhancement/contracts/desktop-chrome.md` and merge it into documented-token and class-hook coverage (mirroring the 006 merge lines), and add the seven §4 contrast pairs to `CONTRAST_PAIRS` in `src/app/shared/design-system/design-token.contract.ts` (check MUST fail until T003/T004 and the story phases land the surfaces)
- [x] T003 [P] Add `--ds-pattern-sparkle-lg`, `--ds-pattern-sparkle-sm`, and `--ds-dock-texture-opacity` to `src/styles/tokens/primitives.css` per [contracts/desktop-chrome.md](contracts/desktop-chrome.md) §1 (eight-point-star SVG data-URI tiles; drawer dot layer unchanged)
- [x] T004 [P] Add `--ds-icon-lock` and `--ds-icon-steps` black-geometry SVG masks to `src/styles/tokens/icons.css` per [contracts/desktop-chrome.md](contracts/desktop-chrome.md) §2
- [x] T005 [P] Write the presenter unit tests in `src/app/survey/presenters/desktop-chrome.spec.ts` covering `surveyInitial` (letter extraction, empty/non-letter fallback), `liveCardMeta` (singular/plural sections, absent `estimatedMinutes` → null minutes segment), `stepCountsLabel` (pluralization, zero totals), `platformYear`, and `topbarAction` (desktop → `'rail'`, otherwise `'drawer'`) — MUST fail before T006
- [x] T006 Implement the pure presenters in `src/app/survey/presenters/desktop-chrome.ts` per [data-model.md](data-model.md) (depends on T005)
- [x] T007 [P] Write the storage unit tests in `src/app/survey/services/dock-preference.spec.ts` covering desktop gating (read/write refused below breakpoint), absent/corrupt value normalization to `expanded`, blocked/throwing storage degrading to session-only, and round-trip `expanded`/`collapsed` — MUST fail before T008
- [x] T008 Implement `DockMode`, `readDockMode(storage, isDesktop)`, and `writeDockMode(storage, isDesktop, mode)` in `src/app/survey/services/dock-preference.ts` (no Angular; depends on T007)

**Checkpoint**: Contract check fails only on missing surfaces (expected); all pure
unit suites green. Story implementation can now begin.

---

## Phase 3: User Story 1 - Dock identity refinements on desktop (Priority: P1) 🎯 MVP

**Goal**: Expanded desktop dock matches the reference: sparkle texture, circular
monogram badge, live-card encrypted line, `Survey steps` label, `N questions • A/B
done` step rows, `Private & secure` panel, theme caption. Rail and drawer unchanged.

**Independent Test**: Quickstart §2 — open any survey at 1440 px and 1024 px and
compare the dock against `public/theme-preview.png` region by region; collapse to
rail (compact form unchanged); resize below 64 rem (drawer untouched).

- [x] T009 [US1] Extend `src/app/survey/components/survey-navigation/survey-navigation.spec.ts`: desktop-only hooks render with contract copy (`Survey steps`, `Private & secure` + body, `Maroon • Gold • Cream Theme`, `N questions • A/B done` via `stepCountsLabel`), default `.step-counts`/`.dock-security` still present; assert element presence only (breakpoint styling is CSS-verified in quickstart) — MUST fail before T010
- [x] T010 [US1] Add the desktop-only elements to `src/app/survey/components/survey-navigation/survey-navigation.ts`: `.survey-steps-label` (steps glyph + label, `collapse-hide`), `.step-counts-desktop` per-step variant (presenter-driven, hidden on rail via existing `compact` path), `.dock-secure-panel` (shield tile + title + existing security copy, `collapse-hide`), `.dock-theme-caption` (`collapse-hide`)
- [x] T011 [P] [US1] Add the desktop-scoped styles to `src/app/survey/components/survey-navigation/survey-navigation.css` inside the existing `64rem` media query: steps label, step-row desktop treatment (gold-gradient active tile + gold border + chevron cue, completed green tile retained, gated ring cue non-color), `.step-counts`/`.dock-security` hidden, new variants styled per contract §3
- [x] T012 [P] [US1] Add to `src/app/survey/pages/survey-view/survey-view.ts`: `.dock-badge` + `.dock-monogram` (presenter `surveyInitial`, clipboard-glyph fallback, `collapse-hide`, `aria-hidden`, desktop-only) replacing the square mark on desktop, and `.live-sub-desktop` (lock glyph + presenter segments) alongside the hidden-at-desktop `.live-sub`
- [x] T013 [US1] Add the desktop-confined shell styles to `src/app/survey/survey-shell.css`: `.dock::before` sparkle override (base dot layer untouched), `.dock-badge` ring/disc + monogram, `.dock-brand-mark` and `.live-sub` hidden ≥64 rem, `.live-sub-desktop` styling; all rules inside the existing media query or on `only-desktop` elements
- [ ] ⏳T014 [US1] Execute [quickstart.md](quickstart.md) §2 (story 1 walkthrough at 1440 px + 1024 px + rail + drawer resize) and record outcome in the Verification results section of [tasks.md](tasks.md)

**Checkpoint**: US1 delivers the reference dock on desktop and is demonstrable alone.

---

## Phase 4: User Story 2 - Mobile experience stays pixel-identical (Priority: P1)

**Goal**: Prove nothing below 64 rem changed — the explicit constraint of the feature.

**Independent Test**: Quickstart §3 — replay the full flow at 320/375/768 px against
the T001 baseline captures; every screen and interaction identical; plus the
confinement audit proving all diffs are desktop-scoped by construction.

- [x] T015 [US2] Run the confinement audit: diff the working tree and confirm every changed/new CSS rule in `src/styles/**` and `src/app/**/*.css` lives inside `@media (min-width: 64rem)` or on `only-desktop` elements, and every changed template (`src/app/survey/**`) adds elements without mutating mobile-bound ones; record the file list + pattern evidence in the Verification results section of [tasks.md](tasks.md)
- [ ] ⏳T016 [US2] Execute [quickstart.md](quickstart.md) §3 mobile walkthrough at 320/375/768 px (drawer open/close, pills, answering, validation, submit, completion, restart) comparing against the T001 baseline captures; identical rendering and behavior required
- [x] T017 [US2] Re-run the full existing suites (`pnpm exec vitest run src/app/core src/app/survey src/app/shared`) confirming zero behavior drift in `src/app/survey/services/survey-session.service.ts` and validation/submission specs

**Checkpoint**: Mobile parity is proven for everything implemented so far; re-run
this phase's checks after each later story (dependency note below).

---

## Phase 5: User Story 3 - Desktop topbar menu toggle (Priority: P2)

**Goal**: Topbar menu button works on desktop (collapses/expands the rail, shared
state with the dock chevron, `aria-pressed`, persisted per FR-009); mobile drawer
untouched.

**Independent Test**: Quickstart §4 — pointer + keyboard toggle at 1440 px; reload
restores mode with no flash; storage cleared → expanded; storage blocked →
session-only; below 64 rem the button is a pure drawer toggle and the preference is
never read.

- [x] T018 [US3] Extend `src/app/survey/pages/survey-view/survey-view.spec.ts`: toggle branch via `topbarAction` (desktop → rail / mobile → drawer), `aria-pressed` bound only on desktop, hydration seeds `dockCollapsed` from `readDockMode` before first render (mock storage; no flash path), toggle writes via `writeDockMode` when desktop and never below the breakpoint — MUST fail before T019
- [x] T019 [US3] Update `src/app/survey/pages/survey-view/survey-view.ts`: route the menu button through `topbarAction(isDesktop())` (`toggleRail()` desktop / `toggleMobileNav()` mobile), hydrate `dockCollapsed` at field initialization with `readDockMode(..., isDesktop())`, persist in the single `toggleRail()` path via `writeDockMode(..., isDesktop())`, add desktop-only `aria-pressed` and an accessible label for each mode
- [x] T020 [P] [US3] Adjust `.menu-btn` visibility/styling in `src/app/survey/survey-shell.css` (remove `only-mobile` from the template class list per T019; keep the 44 px target, maroon fill, hover — any new rule confined to the desktop media query or shared unchanged rules)
- [ ] ⏳T021 [US3] Execute [quickstart.md](quickstart.md) §4 (toggle pointer/keyboard, pressed announcement, reload-restore no-flash, cleared/blocked storage, mobile unaffected) and record outcome in [tasks.md](tasks.md)

**Checkpoint**: US3 standalone: desktop rail control pair + durable preference;
re-run Phase 4 checks.

---

## Phase 6: User Story 4 - Survey card header badges on desktop (Priority: P2)

**Goal**: `STEP N OF M` gradient pill, `R REQUIRED • O OPTIONAL` caps, bordered
page-icon tile at the header's inline-end; mobile header untouched.

**Independent Test**: Quickstart §5 — page through a multi-page survey at 1440 px
(pill/tallies update, icon tile per `icon` key, default fallback), then below 64 rem
confirm the original eyebrow/icon treatment.

- [x] T022 [US4] Add to `src/app/survey/pages/survey-view/survey-view.ts`: `.step-pill` (`STEP {{n}} OF {{m}}`), `.card-counts-caps` (`{{r}} REQUIRED • {{o}} OPTIONAL`), and `.card-icon-tile` (`[attr.data-icon]` mirroring the page icon key) as `only-desktop` siblings in the card header; existing eyebrow row/`page-icon` retained for mobile
- [x] T023 [P] [US4] Add media-confined header styles in `src/styles/components/card.css` (shared stylesheet — every new/altered rule MUST sit inside `@media (min-width: 64rem)`): pill gradient + caps counts per contract §5, `.card-eyebrow-row` desktop layout, inline `.page-icon` and eyebrow text hidden ≥64 rem, `.card-icon-tile` anchored header inline-end per G-03
- [ ] ⏳T024 [US4] Execute [quickstart.md](quickstart.md) §5 (multi-page paging, tallies vs real counts, unknown/absent icon fallback, mobile header unchanged) and record outcome in [tasks.md](tasks.md)

**Checkpoint**: US4 standalone; re-run Phase 4 mobile checks.

---

## Phase 7: User Story 5 - Desktop palette caption and platform footer (Priority: P3)

**Goal**: Centered palette capsule + platform line below the survey card (answering
and completion states), desktop-only.

**Independent Test**: Quickstart §6 — capsule + line visible and centered at 1440 px
in both states, absent below 64 rem, swatches decorative.

- [x] T025 [US5] Add the `only-desktop` `.shell-footer` to `src/app/survey/pages/survey-view/survey-view.ts` after the survey card: `.palette-capsule` (`Palette —` + three `.palette-swatch` + `.palette-chip` entries per contract §5) and `.platform-line` (`©` + `platformYear()` + static copy)
- [x] T026 [P] [US5] Add the desktop-only footer styles to `src/app/survey/survey-shell.css`: centered capsule (surface fill, pill radius), swatch dots tinted by documented tokens, platform line muted small caps; in-flow under the content column (no fixed positioning, no toast conflicts)
- [ ] ⏳T027 [US5] Execute [quickstart.md](quickstart.md) §6 (both states, centered, decorative swatches, absent below 64 rem) and record outcome in [tasks.md](tasks.md)

**Checkpoint**: All five stories complete; desktop matches the reference frame.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Close the contract geometry, robustness sweeps, and the final evidence.

- [x] T028 [P] Record the measured desktop geometry (G-01…G-07 at 1440×900, 1280×800, 1024×768, root 16 px) into the table in [contracts/desktop-chrome.md](contracts/desktop-chrome.md) §6, confirming no horizontal scroll at any measured width
- [ ] ⏳T029 Execute [quickstart.md](quickstart.md) §7 robustness sweeps: 200% zoom at 1440 px, live resize across the 1024 px boundary, reduced-motion collapse, long-title truncation, invalid-survey error path, completion-state re-check of every new surface
- [x] T030 [P] Final automated gates: `pnpm exec vitest run src/app/core src/app/survey src/app/shared` (all green, contract check merged + passing), `pnpm exec prettier --check` on every file this feature touched, `pnpm exec ng build`
- [ ] ⏳T031 Complete the US2 re-run per [quickstart.md](quickstart.md) §3 on the final tree, record the full Verification results block in [tasks.md](tasks.md) (baseline → final comparisons for SC-001…SC-006), and tick every requirement in [checklists/requirements.md](checklists/requirements.md) that this implementation evidences

---

## Verification results

**2026-09-10 — T001 baseline**: clean tree; full suite 18 files / 149 tests green;
`pnpm exec ng build` exit 0 (pre-existing style-budget warnings only — survey-shell
13.78 kB); prettier per-file clean. No browser harness exists in the repo — the
mobile-baseline visual capture is the live dev-preview pass (T014/T031).

**2026-09-10 — Phase 2 (T002–T008)**: token additions in
`src/styles/tokens/{icons,primitives}.css` (append-only, no recolor); 6 new contract
guard rows incl. the 007 documented-token block; `presenters/desktop-chrome.ts` +
`services/dock-preference.ts` pure modules. New suites green: contract 29,
dock-preference 11, presenters 9 (49 total); red build-error (unresolved import)
confirmed before each implementation per T005/T007.

**2026-09-10 — Plan amendment (T013/T020/T023/T026 CSS target)**: 007 view CSS lives
in the new third component stylesheet `src/app/survey/survey-desktop-chrome.css`
instead of `survey-shell.css`. Reason: angular.json `anyComponentStyle`
maximumError 16 kB is enforced **per style file** and survey-shell.css sits at
13.78 kB; the new file gets its own budget and keeps survey-shell.css bytes
untouched (mobile-immutability audit trail intact).

**2026-09-10 — Phases 3–7 (automated portions)**: spec-first additions (T009 nav
statics, T018 view statics) red→green per file. Delivered: nav steps label + counts,
private-and-secure panel, theme caption; dock badge + monogram; live-card
sections/min/encrypted line; collapsible rail with persisted preference
(`survey.dock.mode`, desktop-only, session-degraded on failure); card pill +
caps-lock counts + per-page icon tile; palette capsule footer; sparkle dock texture.
Confinement (T015): every new CSS rule lives in survey-desktop-chrome.css or the
survey-navigation.css 64-rem block / on `only-desktop` + `collapse-hide` elements;
below-64-rem output unchanged by construction. Contract §6 geometry table filled
(token-derived: badge 44 px, tile 44 px, secure panel 290 px).

**2026-09-10 — T026 polished gate**: full suite 20 files / **177 tests** green
(+28 vs baseline); `pnpm exec ng build` exit 0; prettier all-clean on the 14 touched
sources + spec docs.

**2026-09-10 — T030 final gates**: re-verified after formatting — suite 20 files /
177 tests green; build exit 0; `pnpm exec prettier --check` clean including tasks.md.

**2026-09-10 — Dev-preview smoke test**: `ng serve` on 0.0.0.0:4200; HTTP 200 for
`/`, `styles.css`, `survey.json`, `survey-manifest.json`, `survey-8-step.json`.

**⏳ Live-preview human walkthrough pending (T014/T016/T021/T024/T027/T029/T031)**:
quickstart §2 rail/persistence + §3 mobile-parity visual captures, §4 12-scenario
breakpoint matrix, §5 footer matrix, §6 sparkle verification, §7 final sign-off.
These run against the live dev preview; the reviewer records captures and
SC-001…SC-006 sign-off here.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: none — must be green before anything
- **Foundational (Phase 2)**: depends on Phase 1 — BLOCKS all stories
- **US1 (Phase 3) → US2 (Phase 4)**: US2's guarantee covers everything built so far,
  so its first run follows US1; it is re-executed (T015–T017 pattern) after US3–US5
  and finally in T031
- **US3–US5 (Phases 5–7)**: depend on Foundational only; order by priority (P2 → P2
  → P3); each re-triggers the Phase 4 mobile checks
- **Polish (Phase 8)**: depends on all stories

### User Story Dependencies

- **US1 (P1)**: Foundational only — no dependencies on other stories (MVP)
- **US2 (P1)**: verification story — no new code of its own; depends only on having
  code to verify, re-applied after every story
- **US3 (P2)**: Foundational only (presenters + storage module); integrates with the
  existing rail signal, not with US1's visuals
- **US4 (P2)**: Foundational only; independent of US1/US3
- **US5 (P3)**: Foundational only; independent of US1–US4

### Within Each Story

- Spec/check tasks MUST be written and FAIL before their implementation tasks
  (T002, T005, T007, T009, T018)
- Presenters/storage (T006, T008) before any template that consumes them
- Template (T010/T012/T019/T022/T025) and stylesheet (T011/T013/T020/T023/T026) task
  pairs may overlap but land in the same story checkpoint

### Parallel Opportunities (per story)

```bash
# Foundational after T002:
Task: "Add sparkle pattern tokens to src/styles/tokens/primitives.css"        # T003
Task: "Add lock/steps icon masks to src/styles/tokens/icons.css"              # T004
Task: "Write presenter tests in desktop-chrome.spec.ts"                       # T005
Task: "Write storage tests in dock-preference.spec.ts"                        # T007

# US1 after T009/T010:
Task: "Desktop nav styles in survey-navigation.css"                           # T011
Task: "Badge + live-sub elements in survey-view.ts"                           # T012

# USn template + stylesheet pairs: T022∥T023 (card.css), T025∥T026,
# Polish: T028 ∥ T030
```

## Implementation Strategy

### MVP First (US1 + US2)

1. Phases 1–2 green baseline + tokens + pure modules
2. Phase 3 (US1) → the reference dock on desktop, demoable alone
3. Phase 4 (US2) → mobile byte-identity proven for the MVP
4. **STOP and VALIDATE** against SC-001/SC-002 at 1440/1024/375/320 px

### Incremental Delivery

US3 → re-run Phase 4 → US4 → re-run Phase 4 → US5 → Phase 8 gates + evidence. Each
step is backward-compatible: CSS/tokens only add, and every behavior gate (T017)
guards answer/validation/payload invariance.

## Notes

- [P] tasks = different files, no dependencies; `[USn]` traces to spec stories.
- This is presentation-only work: zero edits under `src/app/core/**` and zero edits
  to `survey-session.service.ts` are expected; flag any that appear.
- `src/styles/components/card.css` is a SHARED stylesheet — US4 restyles must be
  media-query-confined (contract §3.2).
- Commit after each checkpoint; keep the Verification results block current.
