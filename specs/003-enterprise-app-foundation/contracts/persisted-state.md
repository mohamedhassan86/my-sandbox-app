# Contract: Persisted On-Device State (Enterprise)

Normative companion to spec FR-003–FR-005, FR-024, FR-025, FR-033, FR-036, FR-041,
FR-047, and SC-006/SC-009.

## Scope

Only **user-created state** persists on-device (clarified scope). Fixture/collection
data is read-only and never persisted (FR-026). Single demo user; single namespaced
`localStorage` prefix: `enterprise.demo.v1.`.

## Key schema

| Key (under `enterprise.demo.v1.`) | Contents | Written by |
|---|---|---|
| `preferences` | `{ appearance: 'light'\|'dark'\|'system', accessibilityMode: boolean, tableDensity: 'comfortable'\|'compact' }` | `preferences.service` |
| `views` | `DataView[]` per `data-model.md` | `views.service` |
| `favorites` | `Favorite[]` | `favorites.service` |
| `drafts` | `Record<taskKey, Draft>` | `drafts.service` |
| `activity` | `RecentActivityEntry[]` (capped) | `activity.service` |
| `notifications.readState` | `{ readIds: string[], clearedIds: string[] }` | `notifications.service` |
| `onboarding` | `{ completed: boolean, dismissedAt?: string }` | tour component/service |
| `nav` | `{ railCollapsed: boolean }` | side-nav |

Rules:

- Every value is JSON-serialized, versioned by the key prefix, and written through its
  typed service. Reads are defensive: parse failure drops the entry (with a console
  warning) and falls back to defaults — never throws, never blanks the UI (edge case).
- All keys are written under the single prefix so reset is one `localStorage` sweep.

## Behavior requirements

- **Persistence across restarts**: preferences, views, favorites, drafts, read state,
  onboarding completion, and nav state survive reload and app restart (SC-006/SC-009).
- **Immediate apply, no reload**: appearance/accessibility/density changes take effect
  the moment the setting changes (FR-003/FR-004/FR-024).
- **Drafts**: auto-saved debounced (~500 ms) after field edits and on step change;
  restored on return with a resume prompt; cleared only on successful submission or
  explicit discard (FR-033/FR-035, SC-006).
- **Live sync**: favorites appear in the dashboard and side nav from one store
  (FR-015); unread badge derives from read state + live stream (FR-036/FR-037).

## Reset demo data (FR-047)

Triggered from the profile menu after an explicit typed confirmation ("RESET").
Sequence: clear every key under `enterprise.demo.v1.` → stop/clear the demo event
scheduler → reload the application → first-run state (dashboard + welcome/onboarding
offer). Must be available from any page and never delete fixture content.

## Conflict & quota handling

- Single-user demo: no concurrent-writer conflicts; last write wins.
- `QuotaExceededError` / write failure surfaces a clear toast with a "Reset demo
  data" path instead of failing silently (edge case).
