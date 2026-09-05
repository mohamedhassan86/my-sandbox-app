import { describe, expect, it } from 'vitest';
import { SurveySessionService } from './survey-session.service';

const survey = {
  surveyId: 'SV001',
  title: 'Survey',
  version: '1.0',
  pages: [
    { pageId: 'P1', title: 'One', questions: [{ questionId: 'Q1', type: 'textbox' as const, label: 'Name', required: true, attachmentsRequired: 0 as const }] },
    { pageId: 'P2', title: 'Two', questions: [{ questionId: 'Q2', type: 'textarea' as const, label: 'Notes', required: false, attachmentsRequired: 0 as const }] },
  ],
};

describe('SurveySessionService', () => {
  it('blocks invalid page navigation and preserves answers', () => {
    const session = new SurveySessionService();
    session.start(survey);
    expect(session.next()).toBe(false);
    session.setAnswer({ questionId: 'Q1', value: 'Ada' });
    expect(session.next()).toBe(true);
    expect(session.pageIndex()).toBe(1);
    expect(session.currentPage()?.pageId).toBe('P2');
    expect(session.previous()).toBe(true);
    expect(session.pageIndex()).toBe(0);
    expect(session.currentAnswers()).toEqual([{ questionId: 'Q1', value: 'Ada' }]);
  });

  it('builds a response only after all validation passes', () => {
    const session = new SurveySessionService();
    session.start(survey);
    expect(session.buildResponse()).toBeNull();
    session.setAnswer({ questionId: 'Q1', value: 'Ada' });
    expect(session.buildResponse()?.surveyId).toBe('SV001');
  });

  it('reports completed-page progress and reaches 100% after submission', () => {
    const session = new SurveySessionService();
    session.start(survey);
    expect(session.completionPercentage()).toBe(0);
    session.setAnswer({ questionId: 'Q1', value: 'Ada' });
    session.next();
    expect(session.completionPercentage()).toBe(50);
    session.markSubmitted();
    expect(session.isSubmitted()).toBe(true);
    expect(session.completionPercentage()).toBe(100);
  });

  it('supports a 100-page, 500-question configuration', () => {
    const session = new SurveySessionService();
    const largeSurvey = {
      surveyId: 'LARGE',
      title: 'Large Survey',
      version: '1.0',
      pages: Array.from({ length: 100 }, (_, pageIndex) => ({
        pageId: `P${pageIndex + 1}`,
        title: `Page ${pageIndex + 1}`,
        questions: Array.from({ length: 5 }, (_, questionIndex) => ({
          questionId: `Q${pageIndex * 5 + questionIndex + 1}`,
          type: 'textbox' as const,
          label: `Question ${questionIndex + 1}`,
          required: false,
          attachmentsRequired: 0 as const,
        })),
      })),
    };
    session.start(largeSurvey);
    expect(session.pageCount()).toBe(100);
    expect(session.validateAll()).toHaveLength(0);
  });

  it('goToPage navigates backward without validation', () => {
    const session = new SurveySessionService();
    session.start(survey);
    // Advance to page 1
    session.setAnswer({ questionId: 'Q1', value: 'Ada' });
    session.next();
    expect(session.pageIndex()).toBe(1);
    // Go back to page 0
    expect(session.goToPage(0)).toBe(true);
    expect(session.pageIndex()).toBe(0);
  });

  it('goToPage blocks forward navigation when current page is invalid', () => {
    const session = new SurveySessionService();
    session.start(survey);
    // Q1 is required but not answered
    expect(session.goToPage(1)).toBe(false);
    expect(session.pageIndex()).toBe(0);
  });

  it('goToPage allows forward navigation when current page is valid', () => {
    const session = new SurveySessionService();
    session.start(survey);
    session.setAnswer({ questionId: 'Q1', value: 'Ada' });
    expect(session.goToPage(1)).toBe(true);
    expect(session.pageIndex()).toBe(1);
  });

  it('goToPage rejects out-of-range indices', () => {
    const session = new SurveySessionService();
    session.start(survey);
    expect(session.goToPage(-1)).toBe(false);
    expect(session.goToPage(2)).toBe(false);
    expect(session.pageIndex()).toBe(0);
  });

  it('goToPage returns false when navigating to the same page', () => {
    const session = new SurveySessionService();
    session.start(survey);
    expect(session.goToPage(0)).toBe(false);
  });
});
