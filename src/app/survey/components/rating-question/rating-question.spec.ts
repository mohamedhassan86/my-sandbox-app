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

  it('reads out the score without a descriptor on non-5-step scales', () => {
    expect(RatingQuestionComponent.ratingReadout('7', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toBe(
      '7 / 10',
    );
  });

  it('adds a Poor…Excellent descriptor on 5-step scales only', () => {
    const scale = [1, 2, 3, 4, 5];
    expect(RatingQuestionComponent.ratingReadout('1', scale)).toBe('1 / 5 — Poor');
    expect(RatingQuestionComponent.ratingReadout('2', scale)).toBe('2 / 5 — Fair');
    expect(RatingQuestionComponent.ratingReadout('3', scale)).toBe('3 / 5 — Satisfactory');
    expect(RatingQuestionComponent.ratingReadout('4', scale)).toBe('4 / 5 — Good');
    expect(RatingQuestionComponent.ratingReadout('5', scale)).toBe('5 / 5 — Excellent');
  });

  it('stays silent without a selection', () => {
    expect(RatingQuestionComponent.ratingReadout(null, [1, 2, 3, 4, 5])).toBeNull();
    expect(RatingQuestionComponent.ratingReadout('', [1, 2, 3, 4, 5])).toBeNull();
  });
});
