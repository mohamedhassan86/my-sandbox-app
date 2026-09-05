import { describe, expect, it, vi } from 'vitest';
import { ResponseSubmissionService } from './response-submission.service';

const response = {
  surveyId: 'SV001',
  surveyVersion: '1.0',
  answers: [{ questionId: 'Q1', value: 'yes' }],
  attachments: [],
};

describe('ResponseSubmissionService', () => {
  it('simulates an accepted response by default for local survey demos', async () => {
    await expect(new ResponseSubmissionService().submit(response)).resolves.toMatchObject({ status: 'submitted' });
  });

  it('returns a submission identifier on success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ submissionId: 'SUB001' }), { status: 201 })));
    const service = new ResponseSubmissionService();
    service.simulateApi = false;
    await expect(service.submit(response)).resolves.toEqual({ status: 'submitted', submissionId: 'SUB001' });
  });

  it('returns a safe failure without discarding the response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    const service = new ResponseSubmissionService();
    service.simulateApi = false;
    await expect(service.submit(response)).resolves.toEqual({ status: 'failed', message: expect.any(String) });
  });
});