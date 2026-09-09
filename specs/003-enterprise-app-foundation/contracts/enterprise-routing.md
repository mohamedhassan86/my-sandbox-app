# Contract: Enterprise Routing & Product-Area Isolation

Normative companion to spec FR-006–FR-011 and FR-048.

## Route area

The enterprise product is a **lazy-loaded child route area** mounted at the `/enterprise`
prefix of the existing Angular application. The survey viewer's existing routes are unchanged:

```text
''                      → SurveyViewComponent        (unchanged)
'surveys/:surveyKey'    → SurveyViewComponent        (unchanged)
'enterprise'            → EnterpriseAreaComponent    (NEW, lazy; children below)
```

## Enterprise URL tree (children of /enterprise)

```text
''                  → Home dashboard (redirect '' → 'home' optional; '' renders dashboard)
'home'              → Dashboard
'surveys'           → Surveys collection (T3)
'surveys/:id'       → Survey detail (T4)
'responses'         → Responses collection (T3)
'responses/:id'     → Response detail (T4)
'participants'      → Participants collection (T3)
'participants/:id'  → Participant detail (T4)
'launch'            → Guided task "Launch a survey" (T5)
'notifications'     → Notification center page (T6)
'help'              → Help: tour replay, help index, shortcut map
'**'                → Friendly not-found (never a blank/broken screen)
```

Rule: every non-home page renders breadcrumbs derived from this tree
(`Area / Page`, `Area / Collection / Record`); the tree is the single source for both
navigation labels and breadcrumb labels (no drift, FR-009).

## Isolation rules (FR-048)

- `src/app/enterprise/**` MUST NOT import from `src/app/survey/**`,
  `src/app/core/**`, or `src/app/shared/**` (survey-viewer internals). Shared needs
  are re-implemented inside the enterprise area or promoted only via an explicit
  decision — never cross-imported silently.
- `app.routes.ts` gains exactly one added lazy route for `/enterprise`; the survey
  route entries and their component bindings are not modified.
- Enterprise global styles (tokens, mode classes) are scoped to the enterprise shell
  host; they MUST NOT alter survey-viewer styling (see `research.md` scoped-token
  decision and `contracts/design-tokens.md` §14).
- Enterprise fixtures live under `public/enterprise-fixtures/**`; survey fixtures
  (`public/survey*.json`) are not read or written by enterprise code.
- Both areas coexist in one build and one preview; the survey viewer remains reachable
  at `/` and `/surveys/:surveyKey` exactly as before.
