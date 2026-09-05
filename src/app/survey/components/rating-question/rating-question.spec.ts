import { describe, expect, it } from 'vitest';
import { RatingQuestionComponent } from './rating-question';

const question = {
  questionId: 'R1',
  type: 'rating' as const,
  label: 'How likely are you to recommend us?',
  required: true,
  minValue: 1,
  maxValue: 10,
  attachmentsRequired: 0 as const,
};

describe('RatingQuestionComponent', () => {
  it('creates the configured rating scale', () => {
    expect(RatingQuestionComponent.ratingsFor(question)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });
});