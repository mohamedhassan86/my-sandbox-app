# Quickstart: verifying the dropdown fix and the question sizes

**Feature**: [005-dropdown-menu-sizing](./spec.md) | **Size contract**:
[contracts/ui-sizes.md](./contracts/ui-sizes.md)

## 1. Run the app

```powershell
pnpm install
pnpm start
```

Open `http://localhost:4200/`. The default fixture is `public/survey.json` (Customer
Feedback Survey); it contains two dropdown questions on the first page ("Country of
residence", required, and "Preferred contact language", optional) and three more question
cards below them, which is exactly the situation the fixed defect needed.

## 2. Check the dropdown fix

1. Scroll to "Country of residence" and select the field.
2. Expected: the option list opens **over** the following cards. All six options
   (United Arab Emirates, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman) are visible and the
   list scrolls inside the panel; the option rows are never covered by the "Preferred
   contact language" card or the Previous/Next buttons.
3. Point at each option row. Expected: every row highlights on hover, including the last
   row in the list, and selecting a row writes that option's label into the field.
4. With the field focused, press `Enter` or `ArrowDown` to open the list, type to filter
   (for example `sa` → Saudi Arabia), press `ArrowDown` then `Enter` to select by keyboard.
5. Clear an optional answer with the field's clear (×) control. Expected: the field returns
   to its empty state and the panel geometry is unchanged.
6. Enable "reduce motion" in the operating system and repeat step 1. Expected: the list still
   opens above the following cards.

## 3. Check the sizes

Measured with the browser's device toolbar at the five documented viewports
(320 × 640, 375 × 812, 768 × 1024, 1280 × 800, 1440 × 900) and a default font size of 16 px.

1. Compare the dropdown field with the "Your name" text box in the card above it. Expected:
   identical height and width; at 1440 px both are 558 × 53. Measured values are in
   [contracts/ui-sizes.md](./contracts/ui-sizes.md) §2.
2. Open the dropdown and compare against §3 of the contract: the panel is exactly as wide as
   the field, its maximum height is `min(20rem, 45vh)`, the option list viewport is
   `min(16rem, 32vh)`, and each option row is at least 44 px tall.
3. Set the viewport to 320 × 640. Expected: no horizontal page scrollbar, no surface clipped,
   and at least three option rows visible in the open list.
4. Set the viewport to 800 × 420 (short landscape) and open the list. Expected: the panel is
   capped by the room available (45 vh or less) and stays inside the viewport with at least
   two option rows reachable.
5. Zoom the browser to 200 % on a 1440 px screen (an effective 720 × 450 viewport) and open
   the "Country of residence" list. Expected: the panel opens **above** the field, fully
   inside the viewport, and the option rows are still reachable.
6. Zoom the browser to 200 %. Expected: cards, fields, and the option panel scale together
   and no text is clipped.

## 4. Run the checks

```powershell
pnpm exec vitest run src/app/core src/app/survey src/app/shared
pnpm exec prettier --check .
pnpm exec ng build
```

The design-system contract test asserts the sizing contract itself: the shared control
height tokens exist and are documented, the option panel is positioned against the field and
layered above sibling cards, the panel and option list are bounded by their tokens, and
none of the select surfaces use a literal pixel size.
