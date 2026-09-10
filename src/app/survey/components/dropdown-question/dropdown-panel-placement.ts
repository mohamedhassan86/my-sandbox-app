/**
 * Dropdown option-panel placement rules.
 *
 * Pure functions (no Angular, no rendering) that answer the two questions the dropdown
 * question has to ask when its option panel opens, so they can be unit tested without a
 * browser:
 *
 * 1. Does the panel fit below the field, or should it open upwards?
 * 2. Does the design-system ceiling fit on the chosen side, or must it be trimmed to the
 *    room that is actually available?
 *
 * The sizes themselves stay in the design system (`--ds-select-panel-max-height`,
 * `--ds-select-list-max-height`); the viewport only ever lowers the ceiling, never raises it.
 * See `specs/005-dropdown-menu-sizing/contracts/ui-sizes.md`.
 */

/** Gap kept between the field and the panel (one field border plus one hairline). */
export const PANEL_GAP = 2;

export interface FieldRect {
  readonly top: number;
  readonly bottom: number;
}

/**
 * The panel opens upwards only when it does not fit below the field *and* there is more room
 * above the field than below it, so a question near the top of a short viewport keeps the
 * usual downwards direction.
 */
export function shouldOpenAbove(
  field: FieldRect,
  panelHeight: number,
  viewportHeight: number,
): boolean {
  if (panelHeight <= 0 || viewportHeight <= 0) {
    return false;
  }
  const spaceBelow = viewportHeight - field.bottom;
  const spaceAbove = field.top;
  return panelHeight > spaceBelow && spaceAbove > spaceBelow;
}

/**
 * The height the panel may use on the chosen side, or `null` when the design-system ceiling
 * already fits and therefore stays in charge.
 */
export function panelCeiling(
  field: FieldRect,
  panelHeight: number,
  viewportHeight: number,
  openAbove: boolean,
): number | null {
  if (panelHeight <= 0 || viewportHeight <= 0) {
    return null;
  }
  const space = (openAbove ? field.top : viewportHeight - field.bottom) - PANEL_GAP;
  return panelHeight <= space ? null : Math.max(0, Math.floor(space));
}

/** Token reference driving the option-list viewport height inside the panel. */
export function listViewportHeight(): string {
  return 'var(--ds-select-list-max-height)';
}
