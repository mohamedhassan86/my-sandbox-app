# Data Model: Desktop Design Enhancement (Theme Preview Parity)

**Feature**: [007-desktop-design-enhancement](spec.md) | This is a presentation-only
feature: no survey domain entity changes, no JSON contract change (FR-018). The only
stateful addition is one device-local UI preference; everything else is derived
display data produced by pure presenters.

## View-state model

### `DockMode` (persisted UI preference)

| Field        | Rule                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type         | Union of exactly two string values: `'expanded' \| 'collapsed'`                                                                                                                 |
| Storage      | One device-local storage key, documented in the contract; values outside the union normalize to `expanded`                                                                      |
| Default      | `expanded` (first-time visitors and corrupt/absent values)                                                                                                                      |
| Scopes       | **Desktop only** — reads and writes are refused below the 64 rem breakpoint; the drawer/rail behavior below it never consults this value                                        |
| Availability | Storage errors (blocked, quota, private mode) are swallowed: the session continues in-memory with the toggle still functional (spec edge case §storage)                         |
| Ownership    | Held by the existing survey-view rail signal after hydration; hydrate once, pre-paint; single writer path (`toggleRail()`) shared by the dock chevron and the new topbar toggle |
| Non-goals    | No cross-tab synchronization, no expiry, no server copy, no relation to answer/draft state (draft persistence remains excluded, FR-013)                                         |

### Signal additions (survey-view, presentation state only)

| Signal                                     | Already exists? | Change                                                                      |
| ------------------------------------------ | --------------- | --------------------------------------------------------------------------- |
| `dockCollapsed`                            | yes             | Hydrated from `readDockMode` when desktop; persisted on toggle when desktop |
| `isDesktop`                                | yes             | Reused as the gate for persistence and the toggle branch                    |
| `mobileNavOpen`, answers, submission state | yes             | Untouched (FR-014)                                                          |

## Derived-display data (pure presenters, `survey/presenters/desktop-chrome.ts`)

| Helper                             | Input → Output                                                                      | Rules                                                                                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `surveyInitial(title)`             | survey title → `{ letter: string } \| { glyph: 'clipboard' }`                       | First normalized uppercase letter; empty/letterless titles produce the clipboard-glyph fallback so the badge is never empty (FR-003)                                               |
| `liveCardMeta(survey)`             | survey → `{ sectionsLabel: string, minutesLabel: string \| null, encrypted: true }` | `sectionsLabel` = `N section(s)`; `minutesLabel` = `~M min` or `null` when `estimatedMinutes` absent — rendering joins non-null segments with `•` and appends `Encrypted` (FR-004) |
| `stepCountsLabel(answered, total)` | counts → `N questions • A/B done`                                                   | `N` is the page's total questions; singular/plural `question(s)` handled (FR-006)                                                                                                  |
| `platformYear(now)`                | date → full year number                                                             | Render-time year for the platform line (FR-012)                                                                                                                                    |
| `topbarAction(isDesktop)`          | boolean → `'rail' \| 'drawer'`                                                      | Branches the existing menu button; `drawer` below the breakpoint preserves today's behavior exactly (FR-009)                                                                       |

## Template-hook model (new classes/attributes)

All hooks live in [contracts/desktop-chrome.md](contracts/desktop-chrome.md) §3 with
their gating rule; every `only-desktop` element also gets `collapse-hide` when it must
vanish in the rail.

| Hook                                                                                      | Surface                             | Gating                                                                            |
| ----------------------------------------------------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------- |
| `.dock-badge`, `.dock-monogram`                                                           | survey-view dock header             | desktop-only + `collapse-hide`                                                    |
| `.live-sub-desktop`                                                                       | survey-view live card               | desktop-only (`.live-sub` hidden ≥64 rem)                                         |
| `.survey-steps-label`                                                                     | survey-navigation above steps list  | desktop-only + `collapse-hide`                                                    |
| `.step-counts-desktop`                                                                    | survey-navigation step row          | desktop-only (`.step-counts` hidden ≥64 rem)                                      |
| `.dock-secure-panel`                                                                      | survey-navigation                   | desktop-only + `collapse-hide` (`.dock-security` hidden ≥64 rem, untouched below) |
| `.dock-theme-caption`                                                                     | survey-navigation footer            | desktop-only + `collapse-hide`                                                    |
| `.step-pill`, `.card-counts-caps`                                                         | survey-view card header             | desktop-only (existing eyebrow hidden ≥64 rem)                                    |
| `.card-icon-tile`                                                                         | survey-view card header, inline-end | desktop-only (inline `.page-icon` hidden ≥64 rem)                                 |
| `.shell-footer`, `.palette-capsule`, `.palette-swatch`, `.palette-chip`, `.platform-line` | survey-view below survey card       | desktop-only; visible in answering + completion states                            |
| `aria-pressed` on `.menu-btn`                                                             | survey-view topbar                  | desktop-only attribute (pressed ↔ rail collapsed)                                 |

## Token model delta

Full table in [contracts/desktop-chrome.md](contracts/desktop-chrome.md) §1–§2.
Summary: 2 sparkle pattern tiles + documented opacities (primitives, decorative,
data URIs); 2 icon masks (`--ds-icon-lock`, `--ds-icon-steps`). Zero new color or
spacing primitives — the badge, pill, tile, capsule, and panel compose existing
maroon/gold/cream ramps, alpha steps, radii, and spacing.

## Automated-check model additions

- `design-token.contract.spec.ts` reads
  `specs/007-desktop-design-enhancement/contracts/desktop-chrome.md` and merges it
  into (a) documented-tokens coverage (each new token named in the doc must ship and
  vice versa) and (b) documented class hooks (each hook named in the doc must appear
  in shipped styles with the doc's gating rule).
- Contrast-pair additions listed in the contract's §4 are verified by the same
  machine check; existing pairs are re-verified against unchanged values.

## What deliberately does not change

- Survey JSON schema, manifest, fixtures: no new fields, all existing documents valid
  unchanged (FR-018).
- `SurveySessionService` and response models: zero edits (FR-014).
- Everything below 64 rem: same DOM elements, same strings, same styles (FR-001);
  the parallel-span pattern exists precisely to keep that guarantee mechanical.
