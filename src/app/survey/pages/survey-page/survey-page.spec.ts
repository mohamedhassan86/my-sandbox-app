import { describe, expect, it } from 'vitest';
import { SurveyPageComponent } from './survey-page';

describe('SurveyPageComponent', () => {
  it('detects answered questions by string value', () => {
    expect(SurveyPageComponent.isAnsweredValue('hello')).toBe(true);
    expect(SurveyPageComponent.isAnsweredValue(null)).toBe(false);
  });

  it('detects answered questions by array value', () => {
    expect(SurveyPageComponent.isAnsweredValue(['a', 'b'])).toBe(true);
  });

  it('treats empty array as unanswered', () => {
    expect(SurveyPageComponent.isAnsweredValue([])).toBe(false);
  });

  it('treats empty string as unanswered', () => {
    expect(SurveyPageComponent.isAnsweredValue('')).toBe(false);
  });

  it('treats whitespace-only string as unanswered', () => {
    expect(SurveyPageComponent.isAnsweredValue('   ')).toBe(false);
  });

  it('returns null for missing answer', () => {
    expect(SurveyPageComponent.findAnswerValue([], 'Q1')).toBeNull();
  });

  it('returns answer value for existing answer', () => {
    const answers = [{ questionId: 'Q1', value: 'yes' }];
    expect(SurveyPageComponent.findAnswerValue(answers, 'Q1')).toBe('yes');
  });

  it('treats a boolean answer (including false) as answered', () => {
    expect(SurveyPageComponent.isAnsweredValue(true)).toBe(true);
    expect(SurveyPageComponent.isAnsweredValue(false)).toBe(true);
  });

  it('returns a boolean answer value for a toggle question', () => {
    const answers = [{ questionId: 'T1', value: false }];
    expect(SurveyPageComponent.findAnswerValue(answers, 'T1')).toBe(false);
  });

  it('filters attachments by question ID', () => {
    const attachments = [
      { questionId: 'Q1', fileName: 'a.pdf', mediaType: 'application/pdf', sizeBytes: 100 },
      { questionId: 'Q2', fileName: 'b.pdf', mediaType: 'application/pdf', sizeBytes: 200 },
    ];
    const result = SurveyPageComponent.filterAttachments(attachments, 'Q1');
    expect(result).toHaveLength(1);
    expect(result[0].fileName).toBe('a.pdf');
  });
});