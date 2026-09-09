# Contract: Keyboard Shortcuts (Enterprise)

Normative companion to spec FR-043/FR-044 and the shortcut-map UI (`component-inventory.md` §E).

## Global shortcuts

| Action | Keys | Notes |
|---|---|---|
| Open global search | `Ctrl/Cmd + K` | Overlay opens, field focused (FR-016) |
| Open notification center | `Ctrl/Cmd + Shift + N` | Drawer/panel toggle |
| Toggle dark mode | `Ctrl/Cmd + Shift + D` | Cycles light → dark → system when pressed repeatedly; never fires while typing |
| Toggle accessibility mode | `Ctrl/Cmd + Shift + A` | |
| Open help / shortcut map | `Ctrl/Cmd + /` | Opens help popover (map listed) |
| Focus command bar | `Alt + 1` (or `Ctrl/Cmd + .`) | First primary action focused |
| Go to Home | `G` then `H` or `Alt + H` | Single binding chosen at implementation; must not conflict with typing |
| Next / previous area | `Ctrl/Cmd + Alt + ArrowRight/Left` | Cycles the top-level navigation areas |
| Close overlay / drawer / menu | `Escape` | Standard; returns focus to trigger |

## Guard rules (FR-044)

- Shortcuts do **not** fire when focus is inside an input, textarea, contenteditable,
  or a PrimeNG editable component, except Escape and explicit text-editing commands.
- A shortcut that toggles a setting (dark/a11y) must not toggle repeatedly when held;
  key-repeat is ignored.
- Shortcut bindings are centralized in `keyboard.service` and rendered in the
  shortcut map from the same data source (single source of truth; map entries are
  live-testable, FR-043).
- The map is discoverable: Help menu → "Keyboard shortcuts", and listed in help
  content (fixture).

## Accessibility

- All listed actions are also reachable by mouse/touch (no action is keyboard-only).
- Shortcut announcements are not required for activation feedback (the visible result
  is the feedback), but the shortcut map itself is a normal, focusable, accessible
  table.
