import { describe, expect, it } from 'vitest';
import {
  PANEL_GAP,
  listViewportHeight,
  panelCeiling,
  shouldOpenAbove,
} from './dropdown-panel-placement';

describe('dropdown option panel placement', () => {
  it('opens downwards while the panel fits below the field', () => {
    // 1440 x 900, field at 490, 312-tall panel: plenty of room below.
    expect(shouldOpenAbove({ top: 437, bottom: 490 }, 312, 900)).toBe(false);
    // 320 x 640, field high on the page: still fits below.
    expect(shouldOpenAbove({ top: 52, bottom: 105 }, 261, 640)).toBe(false);
  });

  it('opens upwards when the field sits too close to the bottom', () => {
    // 800 x 420 landscape, field low in the viewport: 44px below, 300px above.
    expect(shouldOpenAbove({ top: 300, bottom: 376 }, 189, 420)).toBe(true);
    // 720 x 450 (a 1440 desktop at 200% zoom): field near the bottom edge.
    expect(shouldOpenAbove({ top: 199, bottom: 252 }, 200, 450)).toBe(true);
  });

  it('keeps the downwards direction when neither side fits the panel', () => {
    expect(shouldOpenAbove({ top: 30, bottom: 83 }, 400, 420)).toBe(false);
  });

  it('falls back to the downwards direction without usable measurements', () => {
    expect(shouldOpenAbove({ top: 0, bottom: 0 }, 0, 0)).toBe(false);
    expect(shouldOpenAbove({ top: 10, bottom: 20 }, 100, 0)).toBe(false);
  });

  it('leaves the ceiling to the design token when the panel fits', () => {
    expect(panelCeiling({ top: 437, bottom: 490 }, 312, 900, false)).toBeNull();
    expect(panelCeiling({ top: 52, bottom: 105 }, 261, 640, false)).toBeNull();
  });

  it('trims the ceiling to the room available on the chosen side', () => {
    // 800 x 420 landscape, panel below the field, only 44px of room minus the gap.
    expect(panelCeiling({ top: 300, bottom: 376 }, 189, 420, false)).toBe(42);
    // Flipped upwards in the same viewport: the room above the field is used instead.
    expect(panelCeiling({ top: 120, bottom: 196 }, 300, 420, true)).toBe(118);
  });

  it('never returns a negative ceiling', () => {
    expect(panelCeiling({ top: 0, bottom: 418 }, 189, 420, false)).toBe(0);
    expect(panelCeiling({ top: 0, bottom: 418 }, 189, 420, true)).toBe(0);
  });

  it('keeps a hairline gap between the field and the panel', () => {
    expect(PANEL_GAP).toBe(2);
  });

  it('drives the option-list viewport from the sizing token, never a literal', () => {
    const viewport = listViewportHeight();
    expect(viewport).toBe('var(--ds-select-list-max-height)');
    expect(viewport).not.toMatch(/\d+px/);
  });
});
