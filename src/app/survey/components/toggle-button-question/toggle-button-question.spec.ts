import { describe, expect, it } from 'vitest';
import { ToggleButtonQuestionComponent } from './toggle-button-question';

describe('ToggleButtonQuestionComponent', () => {
  it('falls back to the question default when no answer value is set', () => {
    expect(ToggleButtonQuestionComponent.isChecked(null, false)).toBe(false);
    expect(ToggleButtonQuestionComponent.isChecked(null, true)).toBe(true);
    expect(ToggleButtonQuestionComponent.isChecked(null, undefined)).toBe(false);
  });

  it('prefers the explicit answer value over the default', () => {
    expect(ToggleButtonQuestionComponent.isChecked(true, false)).toBe(true);
    expect(ToggleButtonQuestionComponent.isChecked(false, true)).toBe(false);
  });

  it('shows the configured on/off label based on the current state', () => {
    expect(ToggleButtonQuestionComponent.labelFor(true, { onLabel: 'Enabled', offLabel: 'Disabled' })).toBe('Enabled');
    expect(ToggleButtonQuestionComponent.labelFor(false, { onLabel: 'Enabled', offLabel: 'Disabled' })).toBe('Disabled');
  });

  it('falls back to On/Off when labels are not configured', () => {
    expect(ToggleButtonQuestionComponent.labelFor(true, undefined)).toBe('On');
    expect(ToggleButtonQuestionComponent.labelFor(false, undefined)).toBe('Off');
  });

  it('always resolves to a non-empty accessible label (schema validation rejects blank labels)', () => {
    expect(ToggleButtonQuestionComponent.labelFor(true, { onLabel: 'Enabled', offLabel: 'Disabled' }).length).toBeGreaterThan(0);
    expect(ToggleButtonQuestionComponent.labelFor(false, undefined).length).toBeGreaterThan(0);
  });
});
