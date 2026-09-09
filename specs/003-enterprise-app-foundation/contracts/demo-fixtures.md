# Contract: Enterprise Demo Fixtures & Simulated Service

Normative companion to spec FR-045–FR-047, FR-037, and `data-model.md`.

## Location & manifest

All enterprise demo content lives under `public/enterprise-fixtures/` as versionable
JSON assets. `manifest.json` lists the allowlisted fixtures and an `area` marker:

```json
{
  "area": "enterprise",
  "version": 1,
  "fixtures": {
    "surveys": "surveys.json",
    "responses": "responses.json",
    "participants": "participants.json",
    "notifications": "notifications.json",
    "activity": "activity.json",
    "quickActions": "quick-actions.json",
    "helpContent": "help-content.json",
    "shortcuts": "shortcuts.json"
  }
}
```

Adding or replacing content = editing these JSON files only. No application-code
change is required (FR-045). Fixture files MUST validate against the typed shapes in
`data-model.md` before any UI renders; invalid content produces a user-visible
configuration error, never a partial dataset.

## Collection fixtures (read-only)

Each collection file is an array of row objects conforming to `data-model.md`
(`Survey`, `Response`, `Participant`), with stable string ids, ISO dates, typed
status keys, and fixture-consistent references (`Response.surveyId` →
`Survey.id`, `Response.participantId` → `Participant.id`). Seed sizes ~20–40 rows per
collection so filtering, pagination (8–10/page), sort, export, and bulk selection are
all demonstrable, including at least one row per status variant.

## notifications.json

Seed notification stream (5–8 items, mixed categories/severities, some pre-read) so
the center shows unread/read states on first run. Live additions come from the demo
event scheduler and simulated actions (below).

## activity.json / quick-actions.json

Seed recent-activity entries (≤12) and the dashboard quick actions (4–6; labels,
icons, targets). Activity is appended at runtime by `activity.service`; quick actions
are static definitions.

## help-content.json / shortcuts.json

Contextual help topics keyed by location, onboarding tour steps (≤4), and the
shortcut-map entries. Content lives in JSON (data), while the canonical shortcut
bindings are enforced by `keyboard.service` per `contracts/keyboard-shortcuts.md`.

## Simulated service API

`fixture.service` + `simulation.service` expose:

- `loadCollection(key)` → rows; applies deterministic latency then resolves; throws a
  typed `SimulatedFailure` when failure injection is armed for that call.
- `queryCollection(key, { searchText, filters, sort, page, pageSize })` →
  `{ rows, total, page }` (pure, read-only).
- `runAction(kind, payload)` → simulated transaction for bulk archive/delete and task
  submission; returns `{ ok: true, message }` or `{ ok: false, error }`; never mutates
  fixture data (FR-026).
- `exportCurrent(collection, query, { scope: 'page'|'all', format: 'csv'|'json' })`
  → Blob URL download (FR-027).
- `simulateFailure(scopeKey, armingFn)` / dev hooks — deterministic failure control for
  tests and demo of error/retry states (FR-046). In the UI, failures are surfaced
  through the standard feedback vocabulary with Retry.

## Demo event scheduler (FR-037)

While an enterprise session is open, a lightweight scheduler emits a new notification
every ~45–75 s from a small pool of survey-operations messages (e.g., "New response
for <Survey>", "<Participant> completed a survey"), and significant simulated actions
(launch submitted, bulk archive) emit one notification each. Unread badge count
updates live. The scheduler pauses when the browser tab is hidden and is inert in
tests unless explicitly driven.

## Reset semantics (FR-047)

"Reset demo data" clears all persisted enterprise state (see
`contracts/persisted-state.md`), discards scheduler state, and reloads to first-run —
fixtures themselves are never modified by the app and are always pristine.
