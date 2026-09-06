# Phase 0 Research: Toggle Button Question Type

## Decision: Answer value representation

- **Decision**: Widen `Answer.value` from `string | string[] | null` to
  `string | string[] | boolean | null`. Toggle answers are stored and submitted as a
  native boolean, not a stringified `"true"`/`"false"`.
- **Rationale**: Resolved via `/speckit-clarify` (Session 2026-09-06). Matches the
  spec's literal response format (`{ "<question_id>": true }`) and avoids lossy
  string/boolean round-tripping in the validator and submission payload.
- **Alternatives considered**: Keep `Answer.value` string-only and convert at the UI
  boundary — rejected because it would require ad-hoc parsing wherever a toggle answer
  is read (validator, session service, submission service), duplicating logic that a
  single type-level change avoids.

## Decision: Question identifier field name

- **Decision**: Use the project's existing `questionId` field (not the illustrative
  `id` field name from the raw feature request) for the toggle question's identifier.
- **Rationale**: Every existing question type (`radio`, `checkbox`, `textbox`,
  `textarea`, `rating`, `satisfaction`) uses `questionId` in both the JSON contract and
  the `QuestionBase` TypeScript interface. Introducing `id` as a parallel identifier
  field for one question type only would fragment the schema and break the uniqueness
  validation that already keys off `questionId`.
- **Alternatives considered**: Support both `id` and `questionId` — rejected as
  unnecessary complexity; the feature description's schema was illustrative, not a
  hard external contract this project must match.

## Decision: `type` literal value

- **Decision**: Use the literal string `toggle_button` for the `type` field, exactly as
  specified in the feature request.
- **Rationale**: The request explicitly names the type `toggle_button`; existing type
  literals (`radio`, `checkbox`, `textbox`, `textarea`, `rating`, `satisfaction`) happen
  to be single words, but nothing in the schema or validator requires that shape, and
  changing the externally-specified type name (e.g. to `toggleButton`) would silently
  diverge from the stakeholder's explicit requirement without benefit.
- **Alternatives considered**: `toggleButton` (camelCase, matching TS naming) —
  rejected; JSON `type` discriminator values are data, not identifiers bound by
  TypeScript naming conventions, and the explicit request should be honored.

## Decision: Rendering approach

- **Decision**: Implement `ToggleButtonQuestionComponent` as a standalone Angular
  component that wraps PrimeNG's `ToggleButton` (`primeng/togglebutton`, selector
  `p-togglebutton`), binding the question's `options.onLabel`/`options.offLabel`
  directly to the component's `onLabel`/`offLabel` inputs and the checked state via
  `[ngModel]`/`(onChange)` (or `[(ngModel)]`), rather than a native
  `<input type="checkbox" role="switch">`.
- **Rationale**: PrimeNG 22 is already an installed project dependency and its
  `ToggleButton` component's public API (`onLabel`, `offLabel`, boolean value via
  `ControlValueAccessor`, an `onChange` event carrying `{ checked }`) maps directly
  onto this feature's schema (`options.onLabel`/`options.offLabel`, boolean value) with
  no adaptation layer. Using the library component also gives consistent focus,
  keyboard (Space/Enter), and ARIA (`role="switch"`, `aria-checked`) handling out of the
  box instead of the project re-implementing it. This supersedes the earlier decision to
  keep the plain-HTML `form-check`/`form-check-input` convention, per explicit direction
  to use PrimeNG's ToggleButton for this control.
- **Alternatives considered**: Native `<input type="checkbox" role="switch">` styled
  with the existing Bootstrap-compatible classes (the project's original convention for
  `radio`/`checkbox`) — superseded because it does not reuse the already-installed
  PrimeNG dependency and requires hand-rolled switch semantics that PrimeNG already
  provides. PrimeNG `ToggleSwitch` (`primeng/toggleswitch`, `p-toggleswitch`) — a purely
  visual on/off switch without built-in `onLabel`/`offLabel` text rendering — rejected
  because it would still require custom label markup next to the control, whereas
  `ToggleButton` renders the label inside the control directly.
- **Follow-up**: `src/app/survey/components/toggle-button-question/toggle-button-question.ts`
  (already implemented against the native-checkbox decision) and
  `specs/002-toggle-button-question/tasks.md` need a follow-up implementation pass to
  swap in `p-togglebutton`; this is implementation work for `/speckit-tasks` and
  `/speckit-implement`, not part of this planning update.

## Decision: Required + default value interaction

- **Decision**: A toggle question's `defaultValue` (or the implicit `false` when
  `required` is `false` and no default is set) counts as a valid answer. `required`
  only blocks page/submission validation when no value is present at all (no default,
  no interaction).
- **Rationale**: This matches the existing `valueIsEmpty` helper in
  `response.validator.ts`, which already treats `false` as non-empty (only `null`,
  `undefined`, blank strings, and empty arrays are "empty"). Introducing toggle-specific
  "has the user touched this control" tracking would be a new validation concept not
  used by any other question type and was not resolved as a formal clarification
  (session ended after one question); it is recorded here as the lowest-risk,
  convention-consistent default and can be revisited if stakeholders disagree.
- **Alternatives considered**: Require explicit user interaction before a required
  toggle validates — deferred; would need new "touched" state per answer, unlike any
  existing question type, and was not confirmed as a hard requirement.
