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

describe('desktop topbar menu and dock preference (007)', () => {
  it('branches the menu action by breakpoint with a rail-only pressed state', () => {
    expect(SurveyViewComponent.topbarMenuLabel(true, false)).toBe('Collapse survey navigation');
    expect(SurveyViewComponent.topbarMenuLabel(true, true)).toBe('Expand survey navigation');
    expect(SurveyViewComponent.topbarMenuLabel(false, false)).toBe('Open survey navigation');
    expect(SurveyViewComponent.topbarMenuLabel(false, true)).toBe('Open survey navigation');

    expect(SurveyViewComponent.topbarAriaPressed(true, true)).toBe(true);
    expect(SurveyViewComponent.topbarAriaPressed(true, false)).toBe(false);
    expect(SurveyViewComponent.topbarAriaPressed(false, true)).toBeNull();
    expect(SurveyViewComponent.topbarAriaPressed(false, false)).toBeNull();
  });

  it('maps the rail flag to the persisted dock mode, expanded by default', () => {
    expect(SurveyViewComponent.dockModeFor(true)).toBe('collapsed');
    expect(SurveyViewComponent.dockModeFor(false)).toBe('expanded');
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

describe('mobile burger menu navigation', () => {
  it('is collapsed by default', () => {
    expect(SurveyViewComponent.mobileNavDefaultOpen()).toBe(false);
  });

  it('toggles open and closed', () => {
    expect(SurveyViewComponent.mobileNavToggle(false)).toBe(true);
    expect(SurveyViewComponent.mobileNavToggle(true)).toBe(false);
  });

  it('summarizes the current page position and completion percentage', () => {
    expect(SurveyViewComponent.mobileMenuSummary(0, 4, 0)).toBe('Page 1 of 4 · 0% complete');
    expect(SurveyViewComponent.mobileMenuSummary(2, 4, 50)).toBe('Page 3 of 4 · 50% complete');
  });

  it('closes the drawer on Escape only when it is open', () => {
    expect(SurveyViewComponent.shouldCloseDrawerOnEscape(true)).toBe(true);
    expect(SurveyViewComponent.shouldCloseDrawerOnEscape(false)).toBe(false);
  });

  it('maps blocked forward navigation to an actionable toast', () => {
    expect(SurveyViewComponent.toastForNavigation(true)).toBeNull();
    expect(SurveyViewComponent.toastForNavigation(false)).toContain('required');
  });

  it('maps submission outcomes to toast copy', () => {
    expect(SurveyViewComponent.toastForSubmission('blocked', '')).toContain('required');
    expect(SurveyViewComponent.toastForSubmission('submitted', 'Response submitted (R-1).')).toBe(
      'Response submitted (R-1).',
    );
    expect(SurveyViewComponent.toastForSubmission('failed', 'Server is busy.')).toBe(
      'Server is busy.',
    );
  });

  it('splits the card header counts into required and optional', () => {
    expect(
      SurveyViewComponent.requiredOptionalCounts([{ required: true }, { required: false }]),
    ).toEqual({ required: 1, optional: 1 });
    expect(SurveyViewComponent.requiredOptionalCounts([])).toEqual({
      required: 0,
      optional: 0,
    });
  });
});

describe('completion summary', () => {
  it('uses a high-level completion message and percentage', () => {
    expect(SurveyViewComponent.completionMessage()).toContain('successfully');
    expect(SurveyViewComponent.completionPercentage(4, 4, true)).toBe(100);
    expect(SurveyViewComponent.completionPercentage(1, 4, false)).toBe(25);
  });
});
