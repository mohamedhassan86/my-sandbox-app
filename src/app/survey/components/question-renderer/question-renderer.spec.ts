import { describe, expect, it } from 'vitest';
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
  });
});
