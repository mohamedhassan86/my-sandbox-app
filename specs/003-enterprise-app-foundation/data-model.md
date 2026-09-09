# Data Model: Enterprise Application Foundation

Defines the typed domain entities for the enterprise product area
(`src/app/enterprise/models/**`), the fixture file shapes it consumes, and the
on-device persisted state it owns. Normative companions:
`contracts/demo-fixtures.md`, `contracts/persisted-state.md`, and spec.md Key Entities.
The survey viewer's data model (`../001-survey-management/data-model.md`,
`../002-toggle-button-question/data-model.md`) is out of scope and unchanged (FR-048).

## Entity inventory

### DemoUserProfile

| Field | Type | Rules |
|---|---|---|
| id | string | Fixed demo id (`demo-user`) |
| displayName | string | Non-empty, from copy/fixture |
| initials | string | Derived for avatar |
| roleLabel | string | Demo role line |

### CollectionRecord (base for read-only rows)

Read-only rows never mutate (FR-026). Concrete collections: Survey, Response, Participant.

| Field | Type | Rules |
|---|---|---|
| id | string | Unique within collection |
| createdAt | ISO date | Display + sort |
| updatedAt | ISO date | Display + sort |
| status | StatusKey | Typed union per collection; maps to status pill tokens |

**Survey** adds: `title` (string), `owner` (owner label), `questionCount` (number),
`responseCount` (number), `launchedAt?` (ISO date), `targetAudience?` (string),
`rating?` (1–10 or null for trend chart).

**Response** adds: `surveyId` (ref Survey.id), `participantId` (ref Participant.id),
`score` (0–100 number), `durationMinutes` (number), `device?` (select label),
`completion` (`'complete' \| 'partial' \| 'abandoned'`).

**Participant** adds: `name` (string), `email` (string), `region` (select label),
`lastActiveAt?` (ISO date), `totalResponses` (number), `optedIn` (boolean).

### QuickAction

| Field | Type | Rules |
|---|---|---|
| id | string | Unique |
| label | string | Copy or fixture |
| icon | IconKey | Token icon reference |
| target | RouteRef | Enterprise route or action id |
| order | number | Display order |

### RecentActivityEntry

| Field | Type | Rules |
|---|---|---|
| id | string | Unique (timestamp-derived) |
| targetType | `'survey' \| 'response' \| 'participant' \| 'view' \| 'task' \| 'page'` | |
| targetRef | string | Route or record id |
| title | string | Human-readable |
| occurredAt | ISO date | Newest-first; capped (e.g., 12 entries) |

### Favorite

| Field | Type | Rules |
|---|---|---|
| id | string | Stable ref: `favorite:{type}:{ref}` |
| targetType | `'record' \| 'view' \| 'page'` | |
| targetRef | string | Record/collection id or route |
| title | string | Snapshot title |
| addedAt | ISO date | Display order |

### Notification

| Field | Type | Rules |
|---|---|---|
| id | string | Unique |
| category | `'response' \| 'survey' \| 'participant' \| 'system'` | |
| severity | `'info' \| 'success' \| 'warning' \| 'error'` | Maps to tokens |
| title | string | |
| body | string | |
| deepLink? | RouteRef | Opens target on activation |
| read | boolean | Toggled by triage |
| createdAt | ISO date | Newest-first |

### DataView (Saved View)

| Field | Type | Rules |
|---|---|---|
| id | string | Unique |
| collectionKey | `'surveys' \| 'responses' \| 'participants'` | View applies to one collection |
| name | string | Non-empty, user-provided |
| searchText | string | |
| filters | FilterChip[] | Serializable predicate descriptors |
| sort | `{ field, order } \| null` | |
| columns | ColumnSetting[] | Visible/order per column key |
| density | `'comfortable' \| 'compact'` | |
| createdAt / updatedAt | ISO date | |

### GuidedTask & Draft (Launch-a-survey task)

| Field | Type | Rules |
|---|---|---|
| taskKey | `'launch-survey'` | Single task in demo |
| steps | TaskStep[] | From fixture (step id, title, fields) |
| field | FieldSpec | Per step: key, kind (`text \| email \| number \| select \| multiselect \| date \| toggle \| textarea`), label, required, defaultValue, min/max/options, validation messages |

**Draft**: `{ taskKey, currentStepIndex, values: Record<fieldKey, Value>, updatedAt }`.
`Value` mirrors the survey `Answer.value` domain: `string | string[] | boolean | number | null`.

### Preferences (persisted)

`{ appearance: 'light'|'dark'|'system', accessibilityMode: boolean, tableDensity:
'comfortable'|'compact' }` — see `contracts/persisted-state.md`.

### Help & tour content

**HelpTopic** `{ locationKey, title, summary, link? }`; **TourStep**
`{ target: selector|'shell'|'search'|..., title, body, placement }`;
**ShortcutEntry** `{ id, scope: 'global'|'context', keys: string[], label, action }`.

## Validation rules summary

- Fixture content is validated on load by a typed validator (mirrors the survey
  config-validator pattern): unknown collection rows, malformed dates, out-of-range
  scores, and duplicate ids fail loudly with a user-visible configuration error; no
  partially-valid dataset renders (constitution: JSON-Driven Domain Contract).
- Saved-view `name` non-empty and unique per collection; favorite refs unique;
  notification deep-links must resolve or render as unavailable (edge case).
- Draft values are validated per `FieldSpec` on step change/blur and on submit
  (FR-030/FR-031); only the current step's required rules block forward navigation.

## State transitions

- **Collections**: immutable — `loading → ready | empty | error`, retry re-enters
  `loading` (FR-039/FR-040).
- **Notification**: `unread → read` (per item or all); `present → cleared` (clear-all
  requires confirmation when >1).
- **Favorite / Activity / View / Draft / Preferences**: additive user state with
  `created → updated → deleted | reset`; reset demo data transitions all to empty
  first-run state (FR-047).
- **Guided task**: `editing → submitting → submitted | submission-error`; a submitted
  task clears its draft; busy state prevents double submission (FR-034, edge case).
