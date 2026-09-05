import { describe, expect, it } from 'vitest';
import { SurveyNavigationComponent } from './survey-navigation';

describe('SurveyNavigationComponent', () => {
  it('reports completed-page progress for a four-page survey', () => {
    expect(SurveyNavigationComponent.progressFor(0, 4)).toBe(0);
    expect(SurveyNavigationComponent.progressFor(1, 4)).toBe(25);
    expect(SurveyNavigationComponent.progressFor(2, 4)).toBe(50);
    expect(SurveyNavigationComponent.progressFor(3, 4)).toBe(75);
    expect(SurveyNavigationComponent.progressFor(3, 4, true)).toBe(100);
  });

  it('returns zero progress for an empty survey', () => {
    expect(SurveyNavigationComponent.progressFor(0, 0)).toBe(0);
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