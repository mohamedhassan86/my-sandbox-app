import { describe, expect, it } from 'vitest';
import { SatisfactionQuestionComponent } from './satisfaction-question';

describe('SatisfactionQuestionComponent', () => {
  it('provides a friendly icon for each satisfaction value', () => {
    expect(SatisfactionQuestionComponent.iconForValue('very-dissatisfied')).toBe('😞');
    expect(SatisfactionQuestionComponent.iconForValue('dissatisfied')).toBe('🙁');
    expect(SatisfactionQuestionComponent.iconForValue('neutral')).toBe('😐');
    expect(SatisfactionQuestionComponent.iconForValue('satisfied')).toBe('🙂');
    expect(SatisfactionQuestionComponent.iconForValue('very-satisfied')).toBe('😊');
  });
});