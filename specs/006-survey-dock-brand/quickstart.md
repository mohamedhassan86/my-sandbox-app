# Quickstart: verifying the Survey Dock Brand

**Feature**: [006-survey-dock-brand](./spec.md) | **Token delta**:
[contracts/brand-delta.md](./contracts/brand-delta.md) | **Shell geometry**:
[contracts/shell-sizes.md](./contracts/shell-sizes.md)

## 1. Run the app

```powershell
pnpm install
pnpm start
```

Open `http://localhost:4200/`. The default fixture is `public/survey.json` (Customer
Feedback Survey); also open `http://localhost:4200/surveys/extended-feedback` — the
brand, dock, and chrome must be identical on both, with copy (titles, descriptions,
time estimate) coming from each survey's own JSON.

## 2. Check the brand (story 1)

Side-by-side with `public/index.html` at 1440 px:

1. Cream canvas with the fading dot pattern and two soft ambient washes (maroon upper
   right, gold mid left); white elevated panels.
2. Maroon chrome and primary actions; gold accents, ring stroke, and submit action;
   extrabold sans headings; muted sans prompts.
3. Answer a question, navigate, submit. Expected: questions, answers, validation
   timing, gating, and the submission payload behave exactly as before the rebrand.

## 3. Check the dock (story 2)

1. Desktop ≥1024 px: fixed dark-maroon dock, 322 px. Header shows the brand mark,
   survey title, and the live-survey card (title, section count, `~N min` from
   `estimatedMinutes`, or the count alone when absent).
2. Each step button shows its number tile, page title, `n/m` answered counts, and a
   mini progress bar. Answer a question: the counts, bars, ring percentage, status
   line, and linear bar all update together and agree with each other.
3. Collapse the dock: 96 px icon rail with step tiles and compact progress; expand
   restores the full dock with answers and position intact.
4. Below 1024 px: the menu toggle slides the drawer (330 px, or 88% of the viewport
   at 320 px) over a dimmed backdrop. Close via the close control, the backdrop, or
   `Escape`. Expected: answers and position intact.
5. Completed steps show a green tile with a check; the active step shows the
   gold-bordered highlight; upcoming steps are visibly disabled. All three states are
   distinguishable without color (tile, check, border, label).
6. Forward gating is unchanged: jumping ahead past an invalid page lands on the first
   invalid page with its errors shown.

## 4. Check the chrome (story 3)

1. Scroll the page: the blurred cream topbar stays stuck with the menu toggle,
   `Survey / Step N — Page title` breadcrumb, and survey title.
2. On mobile: the step-pill strip under the topbar shows every step; current,
   completed, and upcoming pills are distinguishable without color.
3. Progress card: page pill, percent complete, maroon-to-gold gradient bar, and
   answered count — all update on navigation and answers, and all are announced to
   assistive technology.
4. Survey card header: step badge, required/optional counts, page title, page
   description (from JSON; no empty row when absent), and page icon.
5. Footer: no Back on the first page; Continue (maroon gradient + sheen sweep on
   hover) on middle pages; gold Submit on the last page.

## 5. Check questions and validation (story 4)

Render a survey containing every question type (the extended fixture covers all eight
plus attachments):

1. Each question sits in its own card: number badge, `*` required marker or
   `Optional` pill, helper text where defined.
2. Choice options: hover lifts with a gold border; selected shows a maroon border,
   tinted fill, and check badge. Selection is never color-only.
3. Rating: gold selected numerals with a `N / max` readout (`— Poor…Excellent`
   descriptor on 5-step scales). Satisfaction tiles and the toggle/dropdown/file
   controls wear the matching brand treatments with visible maroon focus rings.
4. Dropzone: dashed resting state, maroon hover/active states; attached files render
   as success rows with a working remove action.
5. Leave a required question unanswered and continue: the card shows the rose error
   message with icon, border, and tint; a toast explains what is missing; errors are
   announced. Optional untouched questions show no error state.

## 6. Check completion (story 5)

1. Submit a complete survey: medallion pop + single ring pulse, success message,
   `100% complete`, one tile per page (`n/m answered`) plus a files tile, and a
   working new-response action. Tiles reflect *this* survey's pages — never fixed
   demo fields.
2. Enable "reduce motion" and repeat: no celebration movement, no sheen, no entrance
   travel — the success state is still unmistakable.

## 7. Check viewports, zoom, and keyboard

1. Repeat steps 2–6 at 320 × 640, 375 × 812, 768 × 1024, 1280 × 800, and 1440 × 900
   (device toolbar, 16 px root). Expected: no horizontal page scroll anywhere, no
   clipped control, drawer ≤ 88% of the viewport, footer actions never overlapped by
   the toast.
2. Zoom to 200%: chrome, cards, and controls reflow together; no clipped text.
3. Keyboard only: `Tab` reaches the dock toggle, every step button, all answer
   controls, and all footer actions with a visible maroon focus ring; `Escape` closes
   the drawer and never discards answers.

## 8. Run the checks

```powershell
pnpm exec vitest run src/app/core src/app/survey src/app/shared
pnpm exec prettier --check .
pnpm exec ng build
```

The design-system contract test now also asserts the brand delta: the new ramps and
roles exist and are documented across the merged 004 + 006 contracts, the added
contrast pairs pass, the shell-geometry tokens drive the dock/drawer/topbar/ring
surfaces, and no literal color, spacing length, or shell width escapes the token
layer. All pre-existing tests must pass unmodified in behavior (answer values,
validation messages, gating, payloads byte-identical for the same inputs).
