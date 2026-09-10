import { describe, expect, it } from 'vitest';
import { SurveyNavigationComponent } from './survey-navigation';

describe('SurveyNavigationComponent', () => {
  it('reports answered-over-total progress for the dock ring', () => {
    expect(SurveyNavigationComponent.overallPercentage(0, 8)).toBe(0);
    expect(SurveyNavigationComponent.overallPercentage(4, 8)).toBe(50);
    expect(SurveyNavigationComponent.overallPercentage(8, 8)).toBe(100);
    expect(SurveyNavigationComponent.overallPercentage(0, 8, true)).toBe(100);
  });

  it('returns zero progress for an empty survey', () => {
    expect(SurveyNavigationComponent.overallPercentage(0, 0)).toBe(0);
  });

  it('reports per-step answered percentages', () => {
    expect(SurveyNavigationComponent.stepPercentage(0, 3)).toBe(0);
    expect(SurveyNavigationComponent.stepPercentage(1, 3)).toBe(33);
    expect(SurveyNavigationComponent.stepPercentage(3, 3)).toBe(100);
    expect(SurveyNavigationComponent.stepPercentage(0, 0)).toBe(0);
  });

  it('maps percentages to ring arc offsets', () => {
    expect(SurveyNavigationComponent.ringOffset(0)).toBe(150.8);
    expect(SurveyNavigationComponent.ringOffset(50)).toBe(75.4);
    expect(SurveyNavigationComponent.ringOffset(100)).toBe(0);
  });

  it('labels steps with position, counts, and state', () => {
    expect(SurveyNavigationComponent.stepAriaLabel('About You', 0, 3, 1, 2, 'active')).toBe(
      'About You, step 1 of 3, 1 of 2 answered, active',
    );
  });

  it('keeps completed steps visible but disables navigation', () => {
    expect(SurveyNavigationComponent.canNavigate(false)).toBe(true);
    expect(SurveyNavigationComponent.canNavigate(true)).toBe(false);
  });

  it('computes progress percentage correctly', () => {
    // 3 pages, on page 0 => 33%, page 1 => 66%, page 2 => 100%
    expect(SurveyNavigationComponent.statusFor(0, 0, 3)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(0, 1, 3)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(2, 1, 3)).toBe('upcoming');
  });

  it('marks first page active, second as upcoming, third as upcoming', () => {
    expect(SurveyNavigationComponent.statusFor(0, 0, 3)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(1, 0, 3)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(2, 0, 3)).toBe('upcoming');
  });

  it('marks completed pages correctly after advancing', () => {
    expect(SurveyNavigationComponent.statusFor(0, 2, 3)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(1, 2, 3)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(2, 2, 3)).toBe('active');
  });

  it('handles single-page survey', () => {
    expect(SurveyNavigationComponent.statusFor(0, 0, 1)).toBe('active');
  });

  it('handles four-page navigation states', () => {
    // Page 0 active, rest upcoming
    expect(SurveyNavigationComponent.statusFor(0, 0, 4)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(1, 0, 4)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(2, 0, 4)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(3, 0, 4)).toBe('upcoming');

    // After page 0 completed: page 0 completed, page 1 active, rest upcoming
    expect(SurveyNavigationComponent.statusFor(0, 1, 4)).toBe('completed');
    expect(SurveyNavigationComponent.statusFor(1, 1, 4)).toBe('active');
    expect(SurveyNavigationComponent.statusFor(2, 1, 4)).toBe('upcoming');
    expect(SurveyNavigationComponent.statusFor(3, 1, 4)).toBe('upcoming');

    // After page 1 completed: pages 0-1 completed, page 2 active, page 3 upcoming
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
