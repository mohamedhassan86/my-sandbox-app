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
`radio`, `checkbox`, `textbox`, and `textarea`. Questions may require zero through
three attachments and may define selection, text length, file type, and file size rules.

The response submission boundary is documented in
`specs/001-survey-management/contracts/response-submission.md`. The default adapter
posts to `/api/survey-responses`; connect that route to the response service before
using production submissions.

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
