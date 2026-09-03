import type {
  CheckboxQuestion,
  Question,
  Survey,
  SurveyPage,
} from '../models/survey.models';

export interface ConfigIssue {
  path: string;
  message: string;
}

const questionTypes = new Set(['radio', 'checkbox', 'textbox', 'textarea']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value);

const validateQuestion = (value: unknown, path: string, issues: ConfigIssue[]): value is Question => {
  if (!isRecord(value)) {
    issues.push({ path, message: 'Question must be an object.' });
    return false;
  }

  if (!isNonEmptyString(value['questionId'])) issues.push({ path: `${path}.questionId`, message: 'Question ID is required.' });
  if (!isNonEmptyString(value['label'])) issues.push({ path: `${path}.label`, message: 'Question label is required.' });
  if (!questionTypes.has(String(value['type']))) issues.push({ path: `${path}.type`, message: 'Question type is unsupported.' });
  if (value['required'] !== undefined && typeof value['required'] !== 'boolean') issues.push({ path: `${path}.required`, message: 'Required must be boolean.' });

  const attachmentsRequired = value['attachmentsRequired'] ?? 0;
  if (!isInteger(attachmentsRequired) || attachmentsRequired < 0 || attachmentsRequired > 3) {
    issues.push({ path: `${path}.attachmentsRequired`, message: 'Attachment count must be an integer from 0 through 3.' });
  }

  if (value['minLength'] !== undefined && (!isInteger(value['minLength']) || value['minLength'] < 0)) issues.push({ path: `${path}.minLength`, message: 'Minimum length must be non-negative.' });
  if (value['maxLength'] !== undefined && (!isInteger(value['maxLength']) || value['maxLength'] < 0)) issues.push({ path: `${path}.maxLength`, message: 'Maximum length must be non-negative.' });
  if (isInteger(value['minLength']) && isInteger(value['maxLength']) && value['minLength'] > value['maxLength']) issues.push({ path, message: 'Minimum length cannot exceed maximum length.' });

  if (value['type'] === 'radio' || value['type'] === 'checkbox') {
    if (!Array.isArray(value['options']) || value['options'].length === 0) {
      issues.push({ path: `${path}.options`, message: 'Selectable questions require options.' });
    } else {
      const optionValues = new Set<string>();
      value['options'].forEach((option, index) => {
        const optionPath = `${path}.options[${index}]`;
        if (!isRecord(option) || !isNonEmptyString(option['label']) || !isNonEmptyString(option['value'])) {
          issues.push({ path: optionPath, message: 'Option label and value are required.' });
        } else if (optionValues.has(option['value'])) {
          issues.push({ path: optionPath, message: 'Option values must be unique.' });
        } else {
          optionValues.add(option['value']);
        }
      });
    }
  }

  if (value['type'] === 'checkbox') {
    const checkbox = value as Partial<CheckboxQuestion>;
    if (checkbox.minSelections !== undefined && (!isInteger(checkbox.minSelections) || checkbox.minSelections < 0)) issues.push({ path: `${path}.minSelections`, message: 'Minimum selections must be non-negative.' });
    if (checkbox.maxSelections !== undefined && (!isInteger(checkbox.maxSelections) || checkbox.maxSelections < 0)) issues.push({ path: `${path}.maxSelections`, message: 'Maximum selections must be non-negative.' });
    if (isInteger(checkbox.minSelections) && isInteger(checkbox.maxSelections) && checkbox.minSelections > checkbox.maxSelections) issues.push({ path, message: 'Minimum selections cannot exceed maximum selections.' });
    if (Array.isArray(value['options']) && isInteger(checkbox.maxSelections) && checkbox.maxSelections > value['options'].length) issues.push({ path: `${path}.maxSelections`, message: 'Maximum selections cannot exceed option count.' });
  }

  return true;
};

const validatePage = (value: unknown, path: string, issues: ConfigIssue[]): value is SurveyPage => {
  if (!isRecord(value)) {
    issues.push({ path, message: 'Page must be an object.' });
    return false;
  }
  if (!isNonEmptyString(value['pageId'])) issues.push({ path: `${path}.pageId`, message: 'Page ID is required.' });
  if (!isNonEmptyString(value['title'])) issues.push({ path: `${path}.title`, message: 'Page title is required.' });
  if (!Array.isArray(value['questions']) || value['questions'].length === 0) {
    issues.push({ path: `${path}.questions`, message: 'Page must contain at least one question.' });
  } else {
    value['questions'].forEach((question, index) => validateQuestion(question, `${path}.questions[${index}]`, issues));
  }
  return true;
};

export function validateSurveyConfig(value: unknown): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (!isRecord(value)) {
    return [{ path: '$', message: 'Survey configuration must be an object.' }];
  }
  if (!isNonEmptyString(value['surveyId'])) issues.push({ path: '$.surveyId', message: 'Survey ID is required.' });
  if (!isNonEmptyString(value['title'])) issues.push({ path: '$.title', message: 'Survey title is required.' });
  if (!isNonEmptyString(value['version'])) issues.push({ path: '$.version', message: 'Survey version is required.' });
  if (!Array.isArray(value['pages']) || value['pages'].length === 0) {
    issues.push({ path: '$.pages', message: 'Survey must contain at least one page.' });
  } else {
    const pageIds = new Set<string>();
    const questionIds = new Set<string>();
    value['pages'].forEach((page, pageIndex) => {
      validatePage(page, `$.pages[${pageIndex}]`, issues);
      if (isRecord(page) && isNonEmptyString(page['pageId'])) {
        if (pageIds.has(page['pageId'])) issues.push({ path: `$.pages[${pageIndex}].pageId`, message: 'Page IDs must be unique.' });
        pageIds.add(page['pageId']);
      }
      if (isRecord(page) && Array.isArray(page['questions'])) {
        page['questions'].forEach((question) => {
          if (isRecord(question) && isNonEmptyString(question['questionId'])) {
            if (questionIds.has(question['questionId'])) issues.push({ path: '$.pages', message: 'Question IDs must be unique.' });
            questionIds.add(question['questionId']);
          }
        });
      }
    });
  }
  return issues;
}

export function isValidSurveyConfig(value: unknown): value is Survey {
  return validateSurveyConfig(value).length === 0;
}
