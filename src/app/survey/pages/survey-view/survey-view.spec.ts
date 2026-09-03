import { describe, expect, it } from 'vitest';
import { SurveyNavigationComponent } from '../../components/survey-navigation/survey-navigation';
import { SurveyViewComponent } from './survey-view';

describe('survey navigation controls', () => {
  it('reports first, active, completed, and last page states', () => {
    expect(SurveyNavigationComponent.statusFor(0, 0, 2)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(0, 1, 2)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(2, 2, 3)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(1, 0, 2)).toBe('upcoming');
  });
});

describe('survey submission state', () => {
  it('keeps failures actionable and success explicit', () => {
    expect(SurveyViewComponent.submissionLabel('idle')).toBe('Submit response');
    expect(SurveyViewComponent.submissionLabel('submitting')).toBe('Submitting...');
    expect(SurveyViewComponent.submissionLabel('submitted')).toBe('Response submitted');
    expect(SurveyViewComponent.submissionLabel('failed')).toBe('Try submitting again');
  });

  it('provides a safe configuration error message', () => {
    expect(SurveyViewComponent.configurationErrorMessage()).toContain('unavailable');
  });
});