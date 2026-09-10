# Phase 0 Research: Dropdown Question Type

## Decision: Answer value representation

- **Decision**: Dropdown answers reuse the existing `string` member of `Answer.value`
  (`string | string[] | boolean | null`); no type change is required. A selected option
  is stored as its option `value` string; an unselected/cleared optional question is
  represented as an absent answer or `value: null`.
- **Rationale**: The spec's response format (`{ "<question_id>": "<selected_value>" }`)
  is a plain string, identical in shape to `radio` answers. Unlike `toggle_button`
  (which widened the union with `boolean`), this feature introduces no new value type.
- **Alternatives considered**: None seriously — widening the union would add dead
  surface with no consumer.

## Decision: `type` literal value

- **Decision**: Use the literal string `dropdown` for the `type` field, exactly as
  specified in the feature request.
- **Rationale**: The request explicitly names the type `dropdown`; honoring the
  externally-specified discriminator keeps the JSON contract predictable for survey authors.
- **Alternatives considered**: None — renaming (e.g. `select`, `combobox`) would silently
  diverge from the explicit requirement without benefit.

## Decision: Option contract

- **Decision**: Reuse the existing `Option` interface
  (`{ label: string; value: string; icon?: string }`) shared by `radio`, `checkbox`, and
  `satisfaction`. Any attributes beyond `label`/`value` (e.g. `icon`) are ignored by the
  dropdown, per the spec assumption.
- **Rationale**: The clarified spec constrains dropdown options to `{ label, value }`
  pairs with the same non-empty/unique-value rules already enforced for other selectable
  types, so the existing schema-validation branch and authoring conventions transfer
  directly.
- **Alternatives considered**: A dropdown-specific option shape — rejected as gratuitous
  fragmentation; authors already know the shared shape.

## Decision: Rendering approach

- **Decision**: Implement `DropdownQuestionComponent` as a standalone Angular component
  that wraps PrimeNG's `Select` (`primeng/select`, selector `p-select`), binding the
  question's static `options` via `[options]` with `optionLabel="label"` and
  `optionValue="value"`, the selection via `[ngModel]`/`(onChange)`, filtering via
  `[filter]="true"` with `filterBy="label"` and `filterMatchMode="contains"`, clearing
  via `[showClear]` on optional questions only, a no-match message via
  `emptyFilterMessage="No options match your search"`, clearing via `(onClear)`, and the
  accessible name via `[ariaLabel]="question().label"` (mirroring the toggle component)
  — with no `placeholder` binding, per the clarified no-placeholder decision.
- **Rationale**: PrimeNG is already an installed project dependency and its `Select`
  component's public API maps directly onto the clarified requirements: a built-in filter
  input in the overlay [2](https://v20.primeng.org/select), a clear icon when `showClear`
  is enabled [2](https://v20.primeng.org/select), and `onChange`/`onClear` events carrying
  the value change [4](https://v18.primeng.org/select), plus consistent focus, keyboard,
  and ARIA handling out of the box. Filtering behavior itself is PrimeNG-owned and is
  verified manually via quickstart step 2 (not unit-tested, per the project's no-TestBed
  convention); component unit tests cover only project-owned helpers (selection state,
  label resolution, clearable flag, emitted answer shapes). This follows the
  `toggle_button` precedent (PrimeNG `ToggleButton` over a hand-built control) and the
  constitution's preference for reusable PrimeNG components.
- **Alternatives considered**: Native `<select>` with a hand-rolled filter input and clear
  button — rejected because it re-implements (and must then test and keep accessible)
  exactly what `p-select` already provides: overlay filtering, a clear affordance,
  keyboard navigation, and ARIA listbox semantics. Legacy `p-dropdown`
  (`primeng/dropdown`) — rejected; `Select` is the current component name in the
  installed PrimeNG major.

## Decision: No `defaultValue` / no `placeholder` fields

- **Decision**: The dropdown schema carries neither `defaultValue` nor `placeholder`;
  every dropdown starts unselected with a blank control.
- **Rationale**: Resolved via `/speckit-clarify` (Session 2026-09-10): always start
  unselected, and no placeholder text at all. If a future survey JSON contains such keys,
  the validator ignores unknown additive fields per the base contract's
  forward-compatibility rule rather than failing.
- **Alternatives considered**: None — clarification is explicit.

## Decision: Clearing semantics

- **Decision**: Clearing an optional dropdown emits `{ questionId, value: null }`,
  replacing the previous answer in session state; `null` is treated as unanswered by the
  existing `valueIsEmpty` helper, so no new "empty" concept is introduced. Required
  dropdowns render without the clear affordance (`showClear` bound to `!required`).
- **Rationale**: Keeps one uniform answer shape through `setAnswer`, `isAnsweredValue`
  (already `false` for `null`), and the submission payload ("absent/null" per spec).
- **Alternatives considered**: Removing the answer entry from state on clear — rejected;
  emitting an explicit `null` value is simpler for the component (one output shape) and
  indistinguishable downstream.

## Decision: Response validation strictness

- **Decision**: `response.validator.ts` gains a dropdown-specific check: a non-empty
  dropdown answer MUST be a string exactly matching one of the question's predefined
  option values; unknown strings and non-string values are rejected with a
  question-specific message. The check reads `options` from the `Question` already passed
  into the per-question validator — no signature change.
- **Rationale**: FR-006 explicitly requires rejecting stale/tampered values that match no
  option. (Note: this is stricter than the current `radio` handling, which enforces only
  required-emptiness; the strictness is scoped to `dropdown` only and does not change
  `radio` behavior.)
- **Alternatives considered**: Trusting the UI-selected value without an options-membership
  check — rejected; it would leave the documented tampered-payload rejection untestable
  and unimplemented.
