import { describe, expect, it } from 'vitest';
import { SurveyConfigService, SurveyConfigurationError } from './survey-config.service';

const validSurvey = {
  surveyId: 'SV001',
  title: 'Customer Feedback',
  version: '1.0',
  pages: [{
    pageId: 'P1',
    title: 'General',
    questions: [{
      questionId: 'Q1',
      type: 'radio',
      label: 'Satisfied?',
      required: true,
      options: [{ label: 'Yes', value: 'yes' }],
      attachmentsRequired: 0,
    }],
  }],
};

describe('SurveyConfigService', () => {
  it('parses a valid configuration', () => {
    const service = new SurveyConfigService();
    expect(service.parse(validSurvey).surveyId).toBe('SV001');
  });

  it('rejects an invalid configuration before rendering', () => {
    const service = new SurveyConfigService();
    expect(() => service.parse({ ...validSurvey, pages: [] })).toThrow(SurveyConfigurationError);
  });
});
