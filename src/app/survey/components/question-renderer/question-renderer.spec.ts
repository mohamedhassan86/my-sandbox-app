import { describe, expect, it } from 'vitest';
import { CheckboxQuestionComponent } from '../checkbox-question/checkbox-question';
import { RadioQuestionComponent } from '../radio-question/radio-question';
import { RatingQuestionComponent } from '../rating-question/rating-question';
import { SatisfactionQuestionComponent } from '../satisfaction-question/satisfaction-question';
import { QuestionRendererComponent } from './question-renderer';

const question = {
  questionId: 'Q1',
  type: 'radio' as const,
  label: 'Satisfied?',
  required: true,
  options: [{ label: 'Yes', value: 'yes' }],
  attachmentsRequired: 0 as const,
};

describe('QuestionRendererComponent', () => {
  it('supports every configured question type', () => {
    expect(QuestionRendererComponent.componentFor(question.type)).toBe('radio');
    expect(QuestionRendererComponent.componentFor('checkbox')).toBe('checkbox');
    expect(QuestionRendererComponent.componentFor('textbox')).toBe('text');
    expect(QuestionRendererComponent.componentFor('textarea')).toBe('text');
    expect(QuestionRendererComponent.componentFor('rating')).toBe('rating');
    expect(QuestionRendererComponent.componentFor('satisfaction')).toBe('satisfaction');
  });

  it('keeps selected-state rules consistent across all choice controls', () => {
    expect(RadioQuestionComponent.isSelected('yes', 'yes')).toBe(true);
    expect(RadioQuestionComponent.isSelected('yes', 'no')).toBe(false);
    expect(CheckboxQuestionComponent.isSelected(['a', 'b'], 'b')).toBe(true);
    expect(CheckboxQuestionComponent.isSelected(['a'], 'b')).toBe(false);
    expect(RatingQuestionComponent.isSelected('8', 8)).toBe(true);
    expect(RatingQuestionComponent.isSelected('8', 9)).toBe(false);
    expect(SatisfactionQuestionComponent.isSelected('satisfied', 'satisfied')).toBe(true);
    expect(SatisfactionQuestionComponent.isSelected('satisfied', 'neutral')).toBe(false);
  });
});
