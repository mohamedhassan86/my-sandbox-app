import { Injectable } from '@angular/core';
import type { SubmissionResult, SurveyResponse } from '../models/response.models';

export interface ResponseSubmissionGateway {
  submit(response: SurveyResponse): Promise<SubmissionResult>;
}

@Injectable({ providedIn: 'root' })
export class ResponseSubmissionService implements ResponseSubmissionGateway {
  async submit(response: SurveyResponse): Promise<SubmissionResult> {
    const body = new FormData();
    body.append('response', JSON.stringify({
      surveyId: response.surveyId,
      surveyVersion: response.surveyVersion,
      answers: response.answers,
    }));
    response.attachments.forEach((attachment) => body.append(attachment.questionId, attachment.file, attachment.fileName));

    const result = await fetch('/api/survey-responses', { method: 'POST', body });
    if (!result.ok) return { status: 'failed', message: 'The response could not be submitted. Please try again.' };
    const payload = await result.json().catch(() => ({}));
    return { status: 'submitted', submissionId: payload.submissionId ?? crypto.randomUUID() };
  }
}
