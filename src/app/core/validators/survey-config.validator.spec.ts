import { describe, expect, it } from 'vitest';
import { isValidSurveyConfig, validateSurveyConfig } from './survey-config.validator';

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

describe('validateSurveyConfig', () => {
  it('accepts a valid survey', () => {
    expect(isValidSurveyConfig(validSurvey)).toBe(true);
    expect(validateSurveyConfig(validSurvey)).toEqual([]);
  });

  it('accepts a valid toggle_button question with defaults applied when options are omitted', () => {
    const survey = {
      ...validSurvey,
      pages: [{
        ...validSurvey.pages[0],
        questions: [{
          questionId: 'T1',
          type: 'toggle_button',
          label: 'Enable notifications?',
          required: false,
          defaultValue: false,
          attachmentsRequired: 0,
        }],
      }],
    };
    expect(validateSurveyConfig(survey)).toEqual([]);
  });

  it('rejects a toggle_button question with a non-boolean defaultValue', () => {
    const survey = {
      ...validSurvey,
      pages: [{
        ...validSurvey.pages[0],
        questions: [{
          questionId: 'T1',
          type: 'toggle_button',
          label: 'Enable notifications?',
          defaultValue: 'yes',
          attachmentsRequired: 0,
        }],
      }],
    };
    const issues = validateSurveyConfig(survey);
    expect(issues.some((issue) => issue.path.endsWith('.defaultValue'))).toBe(true);
  });

  it('accepts a valid dropdown question', () => {
    const survey = {
      ...validSurvey,
      pages: [{
        ...validSurvey.pages[0],
        questions: [{
          questionId: 'D1',
          type: 'dropdown',
          label: 'Country of residence',
          required: true,
          options: [{ label: 'United Arab Emirates', value: 'ae' }, { label: 'Qatar', value: 'qa' }],
          attachmentsRequired: 0,
        }],
      }],
    };
    expect(validateSurveyConfig(survey)).toEqual([]);
  });

  it('rejects a dropdown question with missing or empty options', () => {
    const missing = {
      ...validSurvey,
      pages: [{ ...validSurvey.pages[0], questions: [{ questionId: 'D1', type: 'dropdown', label: 'Country', attachmentsRequired: 0 }] }],
    };
    expect(validateSurveyConfig(missing).some((issue) => issue.path.endsWith('.options'))).toBe(true);

    const empty = {
      ...validSurvey,
      pages: [{ ...validSurvey.pages[0], questions: [{ questionId: 'D1', type: 'dropdown', label: 'Country', options: [], attachmentsRequired: 0 }] }],
    };
    expect(validateSurveyConfig(empty).some((issue) => issue.path.endsWith('.options'))).toBe(true);
  });

  it('rejects a dropdown question with duplicate option values', () => {
    const survey = {
      ...validSurvey,
      pages: [{
        ...validSurvey.pages[0],
        questions: [{
          questionId: 'D1',
          type: 'dropdown',
          label: 'Country',
          options: [{ label: 'UAE', value: 'ae' }, { label: 'UAE duplicate', value: 'ae' }],
          attachmentsRequired: 0,
        }],
      }],
    };
    const issues = validateSurveyConfig(survey);
    expect(issues.some((issue) => issue.message.includes('unique'))).toBe(true);
  });

  it('rejects a dropdown question with options missing label or value', () => {
    const survey = {
      ...validSurvey,
      pages: [{
        ...validSurvey.pages[0],
        questions: [{
          questionId: 'D1',
          type: 'dropdown',
          label: 'Country',
          options: [{ label: '', value: 'ae' }, { label: 'Qatar', value: '' }],
          attachmentsRequired: 0,
        }],
      }],
    };
    const issues = validateSurveyConfig(survey);
    expect(issues.some((issue) => issue.message.includes('Option label and value are required'))).toBe(true);
  });

  it('rejects missing pages and unsupported questions', () => {
    const issues = validateSurveyConfig({ ...validSurvey, pages: [] });
    expect(issues.some((issue) => issue.path === '$.pages')).toBe(true);

    const invalidQuestion = {
      ...validSurvey,
      pages: [{ ...validSurvey.pages[0], questions: [{ questionId: 'Q1', type: 'date', label: 'Date' }] }],
    };
    expect(validateSurveyConfig(invalidQuestion).some((issue) => issue.path.endsWith('.type'))).toBe(true);
  });

  it('rejects duplicate page and question IDs', () => {
    const duplicate = {
      ...validSurvey,
      pages: [validSurvey.pages[0], validSurvey.pages[0]],
    };
    const issues = validateSurveyConfig(duplicate);
    expect(issues.some((issue) => issue.message.includes('Page IDs'))).toBe(true);
    expect(issues.some((issue) => issue.message.includes('Question IDs'))).toBe(true);
  });
});
