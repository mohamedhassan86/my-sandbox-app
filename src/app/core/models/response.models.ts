import type { Survey } from './survey.models';

export interface Answer {
  questionId: string;
  value: string | string[] | boolean | null;
}

export interface ResponseAttachment {
  questionId: string;
  fileName: string;
  mediaType: string;
  sizeBytes: number;
  file?: File;
}

export interface SurveyResponse {
  surveyId: string;
  surveyVersion: string;
  answers: Answer[];
  attachments: ResponseAttachment[];
  submittedAt?: string;
}

export interface SubmissionSuccess {
  status: 'submitted';
  submissionId: string;
}

export interface SubmissionFailure {
  status: 'failed';
  message: string;
}

export type SubmissionResult = SubmissionSuccess | SubmissionFailure;

export type ResponseState =
  | { status: 'loading' }
  | { status: 'ready'; survey: Survey }
  | { status: 'editing'; survey: Survey }
  | { status: 'validation-error'; survey: Survey; issues: string[] }
  | { status: 'submitting'; survey: Survey }
  | { status: 'submitted'; survey: Survey; result: SubmissionSuccess }
  | { status: 'submission-error'; survey: Survey; message: string }
  | { status: 'configuration-error'; message: string };
