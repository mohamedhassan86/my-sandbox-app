# MySandboxApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

# Dynamic Survey Viewer

Angular application for rendering and submitting JSON-configured surveys.

## Development

Install dependencies and start the development server:

```powershell
pnpm install
pnpm start
```

Open `http://localhost:4200/` after the server starts. The default fixture is
`public/survey.json`; changing that JSON changes the rendered survey without changing
the survey components.

## Sample survey

The default fixture (`public/survey.json`) contains a four-page demo survey:

1. **About You** — name, email, and how you heard about us
2. **Your Experience** — satisfaction rating, topics of interest, and open feedback
3. **Supporting Files** — file upload with PNG/JPEG/PDF support (up to 3 files, 5 MB each)
4. **Final Thoughts** — improvement suggestions and follow-up consent

Navigation lives in a fixed maroon dock: live step buttons with answered counts and
mini-bars, a gold progress ring with status text, and a collapsible icon rail on
desktop; on mobile the dock becomes a slide-in drawer. A sticky topbar carries the
breadcrumb, survey title, and estimate/answered pills, with a step-pill strip on
mobile. Answered questions show a green bar and checkmark cue; validation failures
surface as rose error cards plus an auto-dismissing toast.

An independent six-step fixture is available at
`http://localhost:4200/surveys/extended-feedback`. It contains exactly six steps
with three questions per step and covers all supported question types without changing
the default four-page survey.

A three-step all-closed "Product Pulse Survey" is available at
`http://localhost:4200/surveys/quick-pulse`. It contains exactly three steps with
three closed questions per step — radio, checkbox, dropdown, rating, satisfaction,
and toggle, with no free-text or attachment questions — and exactly one required
question per step (its first: a radio, a rating, and a radio).

New survey variants are added by placing a validated JSON file in `public/` and adding
one named entry to `public/survey-manifest.json`; no Angular route or component change
is required.

## Validation

Run the focused feature tests:

```powershell
pnpm exec vitest run src/app/core src/app/survey
```

Run the production build:

```powershell
pnpm exec ng build
```

The full `pnpm exec vitest run` command also includes the Angular-generated app test.

## Survey configuration

The JSON contract is documented in
`specs/001-survey-management/contracts/survey-json.md`. Supported question types are
`radio`, `checkbox`, `textbox`, `textarea`, `rating`, `satisfaction`,
`toggle_button`, and `dropdown`. Questions may require zero through three attachments
and may define selection, text length, file type, and file size rules.

The `toggle_button` type (documented in
`specs/002-toggle-button-question/contracts/survey-json.md`) renders a boolean
on/off switch. It supports `defaultValue` (boolean), `required`, and
`options.onLabel`/`options.offLabel` (defaulting to "On"/"Off"). Submitted answers use
a native boolean, e.g. `{ "enable_notifications": true }`.

The `dropdown` type (documented in
`specs/003-dropdown-question/contracts/survey-json.md`) renders a single-select
searchable list from a static `options` array of `{ label, value }` pairs (values must
be unique). Every dropdown starts blank — no placeholder, no preselection — supports
`required`, allows clearing on optional questions, and submits the selected option
value as a string, e.g. `{ "country_of_residence": "ae" }`.

Three optional fields feed the dock chrome (validated in
`specs/006-survey-dock-brand/contracts/brand-delta.md` §6, consumed with fallbacks so
older JSON renders unchanged): survey-level `estimatedMinutes` (1–120, shown in the
live card and topbar), and per-page `description` (1–280 chars, shown under the card
title) and `icon` (a 1–32 char glyph key such as `id-card`, `star`, `file-shield`,
`check`, `clipboard`, `shield-check`, or `laptop-file`; unknown keys fall back to the
clipboard glyph).

The response submission boundary is documented in
`specs/001-survey-management/contracts/response-submission.md`. The default local
adapter simulates an accepted response so the completion flow can be reviewed without
a backend. For production transport, instantiate the service with simulation disabled
and connect `/api/survey-responses` to the response service.

## Design system

The respondent experience follows [`public/theme-preview.png`](public/theme-preview.png) and
is built from a token-driven design system layered under `src/styles/`:

```text
src/styles/
├── tokens/       primitives, semantic roles, typography, space/radius/elevation/motion, icons
├── base/         reset, element defaults, typography roles, accessibility baseline
├── layout/       container, section, stack, cluster, grid, split, rail
├── components/   card, button, field/choice/tile, progress/steps, feedback, motion
├── integrations/ PrimeNG `--p-*` token bridge
└── compat.css    bridge for the classes existing templates already render
```

`src/styles.css` imports the layers in cascade order. Only
`tokens/primitives.css` may contain literal colour values; components consume semantic roles,
so re-tinting the product is a one-file change.

**Brand roles.** GCC maroon (`--ds-color-primary`, `#800020`) is the primary role used
for the dock, chrome, primary actions, and the active step. Metallic gold
(`--ds-color-accent-*`, `#d4af37`) is the secondary role used for the active tile, the
progress ring, badges, and the Submit action. Warm cream (`--ds-color-tertiary`,
`#faf7f2`) is the tertiary role used for the page canvas. Rose (`--ds-color-danger-*`)
carries errors, emerald (`--ds-color-success-*`) carries completion. Each role is
usable independently.

**Reference match.** Cream canvas with a fading dot pattern and maroon/gold ambient
washes, white elevated panels, extrabold sans headings, a maroon dock with gold active
steps and green completed checks, numbered question badges with optional pills, maroon
selected rows with check badges, gold rating tiles with a star and readout pill, maroon
satisfaction tiles, and a medallion completion summary with survey-derived tiles — all
matching `public/index.html`, which is the read-only visual reference.

**Accessibility.** WCAG 2.1 AA contrast for every shipped text/background pair, 3:1 for
interactive borders, focus rings, and selection fills; 44px minimum targets; state never
conveyed by colour alone (check marks, icons, and `aria-*` carry it too); all entrance,
selection, and progress motion collapses under `prefers-reduced-motion: reduce`.

**Motion.** Panels and cards enter with a short rise, tiles confirm selection with a spring,
and the progress fill tweens — all through motion tokens and only on `opacity`/`transform`.

### Verifying the design system

```powershell
pnpm exec vitest run src/app/shared/design-system
```

The contract check parses the shipped stylesheets and fails when a `var(--ds-*)` reference
does not resolve, a literal colour appears outside the primitive layer, a spacing declaration
uses a raw length, a token or `ds-` class is undocumented (or documented but no longer
shipped), the spacing/type/radius/duration scales stop being ordered, a documented contrast
pair drops below its minimum, the reduced-motion block stops collapsing motion, an animation
touches a non-compositor property, or a PrimeNG variable stops mapping to a token. The
check merges the 004 and 006 token contracts, so documented-but-unshipped (or
shipped-but-undocumented) tokens fail in either file. The full contracts live in
[`specs/004-survey-design-system/contracts/`](specs/004-survey-design-system/contracts/)
and [`specs/006-survey-dock-brand/contracts/`](specs/006-survey-dock-brand/contracts/).

The same check also guards the survey answer geometry: the dropdown field and the text box
resolve to one shared control height, the option panel is anchored to its field and layered
above the following question cards, and the panel and option list are bounded by their
sizing tokens. The documented heights and widths for every question surface — measured at
320 px, 375 px, 768 px, 1280 px, and 1440 px — live in
[`specs/005-dropdown-menu-sizing/contracts/ui-sizes.md`](specs/005-dropdown-menu-sizing/contracts/ui-sizes.md).

The dock shell has its own geometry contract: dock/rail/drawer widths, ring size, and
topbar height must be driven by the shell tokens (never literals) on the shell
selectors, and the drawer width must keep its `min(20.625rem, 88vw)` cap formula. The
rules and the measured values at all five viewports live in
[`specs/006-survey-dock-brand/contracts/shell-sizes.md`](specs/006-survey-dock-brand/contracts/shell-sizes.md).

When reviewing the UI, check desktop and mobile widths, keyboard focus, selected and
unselected states, reduced motion, readable labels, and preservation of answers during
navigation.

After a successful submission, the editable survey is replaced by a completion summary:
a maroon-to-gold medallion with a celebration ring, `100% complete`, per-page
`n/m answered` tiles plus a files tile (capped with an overflow tile on long surveys),
and a Start-new-response action. Failed submissions keep the survey editable and
preserve the respondent's answers.

## Project design

- Typed domain models live under `src/app/core/models`.
- Configuration and submission services live under `src/app/core/services`.
- Validation rules live under `src/app/core/validators`.
- Survey pages, question renderers, navigation, session state, and pure presenters
  (e.g. completion tiles) live under `src/app/survey`.
- Design tokens, base styles, composition utilities, and component classes live under
  `src/styles`; the contract check that guards them lives under
  `src/app/shared/design-system`.
- Spec Kit planning artifacts live under `specs/001-survey-management`,
  `specs/002-toggle-button-question`, `specs/003-dropdown-question`,
  `specs/004-survey-design-system`, `specs/005-dropdown-menu-sizing`, and
  `specs/006-survey-dock-brand`.

## Deployment

Production hosting is Cloudflare Pages, published without the Cloudflare SDK: the
deploy step is one `zip` plus one `curl` call to the Pages upload API
(`scripts/pages-upload.sh`), so the runner needs no login session and no extra packages.

```powershell
pnpm run build:prod
pnpm run deploy
```

`pnpm run deploy:ci` runs the production build and the publish step in one command, which
is what a deploy runner should execute. Add `PAGES_BRANCH=preview` for a preview
deployment, or `PAGES_DRY_RUN=1` to package and validate the bundle without calling the
API. Both are read from the environment, so `PAGES_DRY_RUN=1 pnpm run deploy` on a POSIX
shell works as-is.

| Variable                | Purpose                                                                       | Default                       |
| ----------------------- | ----------------------------------------------------------------------------- | ----------------------------- |
| `CLOUDFLARE_API_TOKEN`  | API token with Cloudflare **Pages:Edit** and **Account:Read**                 | required, never committed     |
| `CLOUDFLARE_ACCOUNT_ID` | account id, shown in the dashboard’s account rail                             | required                      |
| `PAGES_PROJECT_NAME`    | Pages project to publish to                                                   | `my-sandbox-app`              |
| `PAGES_BRANCH`          | branch for this deploy; must equal the project’s production branch to go live | `master`                      |
| `PAGES_OUTPUT_DIR`      | directory that becomes the site root                                          | `dist/my-sandbox-app/browser` |
| `PAGES_DRY_RUN`         | `1` stops after packaging                                                     | unset                         |

`dist/my-sandbox-app/browser` is the published output (Angular’s
`@angular/build:application` writes to `<outDir>/<project>/browser`). Deep links such as
`/surveys/quick-pulse` work because `public/_redirects` ships the
`/*  /index.html  200` SPA fallback into that directory; it must stay in `public/`, not
the repository root. The archive is built with entries relative to the output directory,
because Pages serves a zip from its root.

Two caveats about `scripts/pages-upload.sh`:

- It calls the same direct-upload endpoint as the dashboard’s drag-and-drop uploader,
  which Cloudflare does not document in its public API reference.
- Direct uploads are rejected for Pages projects created with Git integration. Those
  projects deploy from a push, and for a manual publish use `pnpm run deploy:wrangler`,
  which needs `wrangler` (a devDependency) and `CLOUDFLARE_API_TOKEN` as well.

The same request from PowerShell:

```powershell
Compress-Archive -Path dist\my-sandbox-app\browser\* -DestinationPath $env:TEMP\site.zip -Force
curl.exe -X POST "https://api.cloudflare.com/client/v4/accounts/$env:CLOUDFLARE_ACCOUNT_ID/pages/projects/my-sandbox-app/direct_uploads" `
  -H "Authorization: Bearer $env:CLOUDFLARE_API_TOKEN" -F "branch=master" -F "file=@$env:TEMP\site.zip;type=application/zip"
```

To skip deploys from the shell entirely, connect the repository to Pages and let
Cloudflare build: Framework preset **Angular**, Build command
`pnpm install --frozen-lockfile && pnpm exec ng build`, Build output directory
`dist/my-sandbox-app/browser`. `wrangler.jsonc` mirrors the same project name and output
directory for `pnpm run deploy:wrangler` and `pnpm run preview`.

Do not commit tokens; `.env*`, `.dev.vars`, and `.wrangler` are ignored.
`vercel.json` is kept only for the legacy Vercel target and is not used by the
Cloudflare Pages pipeline.
For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
