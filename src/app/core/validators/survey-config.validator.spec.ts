import { describe, expect, it } from 'vitest';
import { isValidSurveyConfig, validateSurveyConfig } from './survey-config.validator';

const validSurvey = {
  surveyId: 'SV001',
  title: 'Customer Feedback',
  version: '1.0',
  pages: [
    {
      pageId: 'P1',
      title: 'General',
      questions: [
        {
          questionId: 'Q1',
          type: 'radio',
          label: 'Satisfied?',
          required: true,
          options: [{ label: 'Yes', value: 'yes' }],
          attachmentsRequired: 0,
        },
      ],
    },
  ],
};

describe('validateSurveyConfig', () => {
  it('accepts a valid survey', () => {
    expect(isValidSurveyConfig(validSurvey)).toBe(true);
    expect(validateSurveyConfig(validSurvey)).toEqual([]);
  });

  it('accepts a valid toggle_button question with defaults applied when options are omitted', () => {
    const survey = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            {
              questionId: 'T1',
              type: 'toggle_button',
              label: 'Enable notifications?',
              required: false,
              defaultValue: false,
              attachmentsRequired: 0,
            },
          ],
        },
      ],
    };
    expect(validateSurveyConfig(survey)).toEqual([]);
  });

  it('rejects a toggle_button question with a non-boolean defaultValue', () => {
    const survey = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            {
              questionId: 'T1',
              type: 'toggle_button',
              label: 'Enable notifications?',
              defaultValue: 'yes',
              attachmentsRequired: 0,
            },
          ],
        },
      ],
    };
    const issues = validateSurveyConfig(survey);
    expect(issues.some((issue) => issue.path.endsWith('.defaultValue'))).toBe(true);
  });

  it('accepts a valid dropdown question', () => {
    const survey = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            {
              questionId: 'D1',
              type: 'dropdown',
              label: 'Country of residence',
              required: true,
              options: [
                { label: 'United Arab Emirates', value: 'ae' },
                { label: 'Qatar', value: 'qa' },
              ],
              attachmentsRequired: 0,
            },
          ],
        },
      ],
    };
    expect(validateSurveyConfig(survey)).toEqual([]);
  });

  it('rejects a dropdown question with missing or empty options', () => {
    const missing = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            { questionId: 'D1', type: 'dropdown', label: 'Country', attachmentsRequired: 0 },
          ],
        },
      ],
    };
    expect(validateSurveyConfig(missing).some((issue) => issue.path.endsWith('.options'))).toBe(
      true,
    );

    const empty = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            {
              questionId: 'D1',
              type: 'dropdown',
              label: 'Country',
              options: [],
              attachmentsRequired: 0,
            },
          ],
        },
      ],
    };
    expect(validateSurveyConfig(empty).some((issue) => issue.path.endsWith('.options'))).toBe(true);
  });

  it('rejects a dropdown question with duplicate option values', () => {
    const survey = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            {
              questionId: 'D1',
              type: 'dropdown',
              label: 'Country',
              options: [
                { label: 'UAE', value: 'ae' },
                { label: 'UAE duplicate', value: 'ae' },
              ],
              attachmentsRequired: 0,
            },
          ],
        },
      ],
    };
    const issues = validateSurveyConfig(survey);
    expect(issues.some((issue) => issue.message.includes('unique'))).toBe(true);
  });

  it('rejects a dropdown question with options missing label or value', () => {
    const survey = {
      ...validSurvey,
      pages: [
        {
          ...validSurvey.pages[0],
          questions: [
            {
              questionId: 'D1',
              type: 'dropdown',
              label: 'Country',
              options: [
                { label: '', value: 'ae' },
                { label: 'Qatar', value: '' },
              ],
              attachmentsRequired: 0,
            },
          ],
        },
      ],
    };
    const issues = validateSurveyConfig(survey);
    expect(
      issues.some((issue) => issue.message.includes('Option label and value are required')),
    ).toBe(true);
  });

  it('rejects missing pages and unsupported questions', () => {
    const issues = validateSurveyConfig({ ...validSurvey, pages: [] });
    expect(issues.some((issue) => issue.path === '$.pages')).toBe(true);

    const invalidQuestion = {
      ...validSurvey,
      pages: [
        { ...validSurvey.pages[0], questions: [{ questionId: 'Q1', type: 'date', label: 'Date' }] },
      ],
    };
    expect(
      validateSurveyConfig(invalidQuestion).some((issue) => issue.path.endsWith('.type')),
    ).toBe(true);
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

  it('accepts the optional dock chrome fields when they satisfy their bounds', () => {
    const survey = {
      ...validSurvey,
      estimatedMinutes: 4,
      pages: [
        {
          ...validSurvey.pages[0],
          description: 'Tell us a little about yourself.',
          icon: 'id-card',
        },
      ],
    };
    expect(validateSurveyConfig(survey)).toEqual([]);
  });

  it('accepts an unknown page icon key (forward-compatible fallback)', () => {
    const survey = {
      ...validSurvey,
      pages: [{ ...validSurvey.pages[0], icon: 'not-yet-an-icon' }],
    };
    expect(validateSurveyConfig(survey)).toEqual([]);
  });

  it('rejects out-of-bounds dock chrome fields', () => {
    expect(
      validateSurveyConfig({ ...validSurvey, estimatedMinutes: 0 }).some(
        (issue) => issue.path === '$.estimatedMinutes',
      ),
    ).toBe(true);
    expect(
      validateSurveyConfig({ ...validSurvey, estimatedMinutes: 121 }).some(
        (issue) => issue.path === '$.estimatedMinutes',
      ),
    ).toBe(true);
    expect(
      validateSurveyConfig({ ...validSurvey, estimatedMinutes: 2.5 }).some(
        (issue) => issue.path === '$.estimatedMinutes',
      ),
    ).toBe(true);

    const emptyDescription = {
      ...validSurvey,
      pages: [{ ...validSurvey.pages[0], description: '  ' }],
    };
    expect(
      validateSurveyConfig(emptyDescription).some((issue) => issue.path.endsWith('.description')),
    ).toBe(true);
    const longDescription = {
      ...validSurvey,
      pages: [{ ...validSurvey.pages[0], description: 'x'.repeat(281) }],
    };
    expect(
      validateSurveyConfig(longDescription).some((issue) => issue.path.endsWith('.description')),
    ).toBe(true);

    const emptyIcon = { ...validSurvey, pages: [{ ...validSurvey.pages[0], icon: '' }] };
    expect(validateSurveyConfig(emptyIcon).some((issue) => issue.path.endsWith('.icon'))).toBe(
      true,
    );
    const longIcon = { ...validSurvey, pages: [{ ...validSurvey.pages[0], icon: 'x'.repeat(33) }] };
    expect(validateSurveyConfig(longIcon).some((issue) => issue.path.endsWith('.icon'))).toBe(true);
  });
});
