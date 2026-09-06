import type { Answer, ResponseAttachment } from '../models/response.models';
import type { Question, Survey, SurveyPage } from '../models/survey.models';

export interface ResponseIssue {
  questionId: string;
  message: string;
}

const valueIsEmpty = (value: Answer['value']): boolean =>
  value === null || value === undefined || (typeof value === 'string' && value.trim().length === 0) || (Array.isArray(value) && value.length === 0);

const validateQuestion = (question: Question, answer: Answer | undefined, attachments: ResponseAttachment[]): ResponseIssue[] => {
  const issues: ResponseIssue[] = [];
  const value = answer?.value ?? (question.type === 'toggle_button' ? question.defaultValue ?? null : null);
  if (question.required && valueIsEmpty(value)) issues.push({ questionId: question.questionId, message: 'This question is required.' });

  if (question.type === 'toggle_button' && value !== null && typeof value !== 'boolean') {
    issues.push({ questionId: question.questionId, message: 'This question requires a true/false answer.' });
  }

  if (question.type === 'checkbox' && Array.isArray(value)) {
    if (question.minSelections !== undefined && value.length < question.minSelections) issues.push({ questionId: question.questionId, message: `Select at least ${question.minSelections} option(s).` });
    if (question.maxSelections !== undefined && value.length > question.maxSelections) issues.push({ questionId: question.questionId, message: `Select no more than ${question.maxSelections} option(s).` });
  }

  if ((question.type === 'textbox' || question.type === 'textarea') && typeof value === 'string') {
    if (question.minLength !== undefined && value.length < question.minLength) issues.push({ questionId: question.questionId, message: `Enter at least ${question.minLength} characters.` });
    if (question.maxLength !== undefined && value.length > question.maxLength) issues.push({ questionId: question.questionId, message: `Enter no more than ${question.maxLength} characters.` });
  }

  const questionAttachments = attachments.filter((attachment) => attachment.questionId === question.questionId);
  if (questionAttachments.length < question.attachmentsRequired) issues.push({ questionId: question.questionId, message: `Attach ${question.attachmentsRequired} file(s).` });
  if (questionAttachments.length > 3) issues.push({ questionId: question.questionId, message: 'No more than 3 files may be attached.' });
  questionAttachments.forEach((attachment) => {
    if (question.acceptedFileTypes?.length && !question.acceptedFileTypes.includes(attachment.mediaType)) issues.push({ questionId: question.questionId, message: `${attachment.fileName} has an unsupported file type.` });
    if (question.maxFileSizeBytes !== undefined && attachment.sizeBytes > question.maxFileSizeBytes) issues.push({ questionId: question.questionId, message: `${attachment.fileName} exceeds the permitted size.` });
  });
  return issues;
};

export function validatePageResponse(page: SurveyPage, answers: Answer[], attachments: ResponseAttachment[]): ResponseIssue[] {
  return page.questions.flatMap((question) => validateQuestion(question, answers.find((answer) => answer.questionId === question.questionId), attachments));
}

export function validateSurveyResponse(survey: Survey, answers: Answer[], attachments: ResponseAttachment[]): ResponseIssue[] {
  return survey.pages.flatMap((page) => validatePageResponse(page, answers, attachments));
}
