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

Navigation appears above the page content with a progress bar, clickable page steps,
and Previous/Next buttons. Completed pages show a green left border and a checkmark
cue on answered questions.

An independent six-step fixture is available at
`http://localhost:4200/surveys/extended-feedback`. It contains exactly six steps
with three questions per step and covers all supported question types without changing
the default four-page survey.

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
`radio`, `checkbox`, `textbox`, `textarea`, `rating`, `satisfaction`, and
`toggle_button`. Questions may require zero through three attachments and may define
selection, text length, file type, and file size rules.

The `toggle_button` type (documented in
`specs/002-toggle-button-question/contracts/survey-json.md`) renders a boolean
on/off switch. It supports `defaultValue` (boolean), `required`, and
`options.onLabel`/`options.offLabel` (defaulting to "On"/"Off"). Submitted answers use
a native boolean, e.g. `{ "enable_notifications": true }`.

The response submission boundary is documented in
`specs/001-survey-management/contracts/response-submission.md`. The default local
adapter simulates an accepted response so the completion flow can be reviewed without
a backend. For production transport, instantiate the service with simulation disabled
and connect `/api/survey-responses` to the response service.

## UX reference

The respondent experience follows [`public/theme-preview.png`](public/theme-preview.png):
a centered white survey panel on a soft pink backdrop, generous question spacing,
rounded neutral controls, and vivid blue selected states. Rating questions use 1-10
tiles with endpoint labels. Satisfaction questions use accessible icon choices with
text labels. Maroon remains the product accent for navigation, validation, and supporting
states.

When reviewing the UI, check desktop and mobile widths, keyboard focus, selected and
unselected states, readable labels, and preservation of answers during navigation.

After a successful submission, the editable survey is replaced by a completion summary
showing `100% complete` and a clear success message. Failed submissions keep the survey
editable and preserve the respondent's answers.

## Project design

- Typed domain models live under `src/app/core/models`.
- Configuration and submission services live under `src/app/core/services`.
- Validation rules live under `src/app/core/validators`.
- Survey pages, question renderers, navigation, and session state live under
	`src/app/survey`.
- Spec Kit planning artifacts live under `specs/001-survey-management`.

## Deployment

The project is linked to Vercel. Deploy a production build with:

```powershell
pnpm dlx vercel --prod
```

Vercel uses `vercel.json` to run Angular’s build and `pnpm install --ignore-scripts`.
Environment files and Vercel metadata are excluded from version control.
For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
