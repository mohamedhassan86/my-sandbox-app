import { describe, expect, it } from 'vitest';
import { DropdownQuestionComponent } from './dropdown-question';

const options = [
  { label: 'United Arab Emirates', value: 'ae' },
  { label: 'Qatar', value: 'qa' },
];

describe('DropdownQuestionComponent', () => {
  it('starts blank with no option selected', () => {
    expect(DropdownQuestionComponent.isSelected(null, 'ae')).toBe(false);
    expect(DropdownQuestionComponent.isSelected(undefined, 'ae')).toBe(false);
    expect(DropdownQuestionComponent.labelForValue(options, null)).toBeNull();
  });

  it('detects the selected option by value', () => {
    expect(DropdownQuestionComponent.isSelected('ae', 'ae')).toBe(true);
    expect(DropdownQuestionComponent.isSelected('ae', 'qa')).toBe(false);
  });

  it('resolves the display label for a selected value', () => {
    expect(DropdownQuestionComponent.labelForValue(options, 'ae')).toBe('United Arab Emirates');
    expect(DropdownQuestionComponent.labelForValue(options, 'xx')).toBeNull();
  });

  it('allows clearing only on optional questions', () => {
    expect(DropdownQuestionComponent.isClearable(false)).toBe(true);
    expect(DropdownQuestionComponent.isClearable(true)).toBe(false);
  });

  it('emits the selected option value as the answer', () => {
    expect(DropdownQuestionComponent.selectedAnswer('D1', 'ae')).toEqual({ questionId: 'D1', value: 'ae' });
  });

  it('emits null as the answer when cleared', () => {
    expect(DropdownQuestionComponent.clearedAnswer('D1')).toEqual({ questionId: 'D1', value: null });
  });

  it('always resolves to a non-empty accessible label (schema validation rejects blank labels)', () => {
    for (const option of options) {
      const label = DropdownQuestionComponent.labelForValue(options, option.value);
      expect(label).toBe(option.label);
      expect(label?.length).toBeGreaterThan(0);
    }
  });
});
