import { describe, expect, it } from 'vitest';
import { validateFixtures } from './fixture-validator';
import type { EnterpriseFixtures } from '../models/fixtures.models';

function validPayload(): EnterpriseFixtures {
  return {
    surveys: [
      { id: 'svy-001', title: 'Pulse', status: 'active', owner: 'Alex', questionCount: 8, responseCount: 12, rating: 8.4, createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-09-08T11:20:00Z' },
      { id: 'svy-002', title: 'Engagement', status: 'draft', owner: 'Priya', questionCount: 3, responseCount: 0, createdAt: '2026-06-10T09:00:00Z', updatedAt: '2026-09-07T15:40:00Z' },
    ],
    responses: [
      { id: 'rsp-001', surveyId: 'svy-001', participantId: 'prt-001', score: 86, durationMinutes: 4, device: 'Desktop', completion: 'complete', createdAt: '2026-09-09T06:20:00Z', updatedAt: '2026-09-09T06:20:00Z' },
    ],
    participants: [
      { id: 'prt-001', name: 'Jamie Chen', email: 'jamie@example.com', region: 'North America', optedIn: true, totalResponses: 12, createdAt: '2026-01-12T09:00:00Z', updatedAt: '2026-09-08T10:00:00Z' },
    ],
    notifications: [],
    activity: [],
    quickActions: [],
    helpContent: { helpTopics: [], tourSteps: [] },
    shortcuts: [],
  };
}

function paths(payload: unknown): string[] {
  return validateFixtures(payload).map((issue) => `${issue.collection}:${issue.path}`);
}

describe('validateFixtures', () => {
  it('accepts a fully valid fixture payload', () => {
    expect(validateFixtures(validPayload())).toEqual([]);
  });

  it('rejects non-object payloads', () => {
    expect(validateFixtures(null).map((i) => i.message)).toContain('fixture payload must be an object');
  });

  it('rejects non-array collection roots with path-specific issues', () => {
    const payload = { ...validPayload(), surveys: 'nope' } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('surveys:surveys');
  });

  it('rejects malformed ids', () => {
    const payload = { ...validPayload(), surveys: [{ ...validPayload().surveys[0], id: 'has space' }] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('surveys:id');
  });

  it('rejects duplicate ids with the duplicate path', () => {
    const [first, second] = validPayload().surveys;
    const payload = { ...validPayload(), surveys: [first, { ...second, id: 'svy-001' }] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('surveys:id:svy-001');
  });

  it('rejects malformed ISO dates', () => {
    const [row] = validPayload().surveys;
    const payload = { ...validPayload(), surveys: [{ ...row, createdAt: 'not-a-date' }] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('surveys:svy-001.createdAt');
  });

  it('rejects out-of-range response scores', () => {
    const [row] = validPayload().responses;
    const payload = { ...validPayload(), responses: [{ ...row, score: 141 }] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('responses:rsp-001.score');
  });

  it('rejects survey status values outside the closed set', () => {
    const [row] = validPayload().surveys;
    const payload = { ...validPayload(), surveys: [{ ...row, status: 'deleted' }] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('surveys:svy-001.status');
  });

  it('rejects responses that reference unknown surveys or participants', () => {
    const payload = { ...validPayload(), responses: [{ ...validPayload().responses[0], surveyId: 'svy-999' }] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('responses:rsp-001.surveyId');
  });

  it('rejects missing required participant fields', () => {
    const [row] = validPayload().participants;
    const { email: _omit, ...rest } = row;
    const payload = { ...validPayload(), participants: [rest] } as unknown as EnterpriseFixtures;
    expect(paths(payload)).toContain('participants:prt-001.email');
  });
});
