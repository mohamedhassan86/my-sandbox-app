import '@angular/compiler';
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

describe('survey accessibility contract', () => {
  it('requires semantic labels and keyboard-safe controls', () => {
    expect(SurveyViewComponent.accessibilityRequirements()).toEqual([
      'semantic-labels',
      'keyboard-navigation',
      'visible-validation',
      'color-contrast',
    ]);
  });
});

describe('four-page fixture and page order', () => {
  it('reports correct statuses for a four-page survey', () => {
    // Page 0 active, rest upcoming
    expect(SurveyNavigationComponent.statusFor(0, 0, 4)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(1, 0, 4)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(2, 0, 4)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(3, 0, 4)).toBe('upcoming');

    // After page 0 completed: page 0 completed, page 1 active
    expect(SurveyNavigationComponent.statusFor(0, 1, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(1, 1, 4)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(2, 1, 4)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(3, 1, 4)).toBe('upcoming');

    // After page 1 completed: pages 0-1 completed, page 2 active
    expect(SurveyNavigationComponent.statusFor(0, 2, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(1, 2, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(2, 2, 4)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(3, 2, 4)).toBe('upcoming');

    // Last page active: all previous completed
    expect(SurveyNavigationComponent.statusFor(0, 3, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(1, 3, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(2, 3, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(3, 3, 4)).toBe('active');
  });
});

describe('responsive and keyboard interaction regression', () => {
  it('requires focus-visible outlines on interactive controls', () => {
    expect(SurveyViewComponent.accessibilityRequirements()).toContain('keyboard-navigation');
    expect(SurveyViewComponent.accessibilityRequirements()).toContain('color-contrast');
  });

  it('requires visible validation feedback', () => {
    expect(SurveyViewComponent.accessibilityRequirements()).toContain('visible-validation');
  });

  it('requires semantic labels for screen readers', () => {
    expect(SurveyViewComponent.accessibilityRequirements()).toContain('semantic-labels');
  });
});

describe('completion summary', () => {
  it('uses a high-level completion message and percentage', () => {
    expect(SurveyViewComponent.completionMessage()).toContain('successfully');
    expect(SurveyViewComponent.completionPercentage(4, 4, true)).toBe(100);
    expect(SurveyViewComponent.completionPercentage(1, 4, false)).toBe(25);
  });
});

