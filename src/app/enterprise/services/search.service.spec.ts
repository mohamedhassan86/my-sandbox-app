import { describe, expect, it } from 'vitest';
import { SearchService, editDistance } from './search.service';
import type { PageEntry } from './search.service';
import type { SurveyRecord } from '../models/entities.models';

const pages: PageEntry[] = [
  { id: 'home', title: 'Home', subtitle: 'Dashboard', target: '/enterprise/home' },
  { id: 'surveys', title: 'Surveys', subtitle: 'Enterprise page', target: '/enterprise/surveys' },
  { id: 'action:launch', title: 'Launch a survey', subtitle: 'Quick action', target: '/enterprise/launch' },
];

const surveys: SurveyRecord[] = [
  { id: 'svy-001', title: 'Customer Satisfaction Pulse', status: 'active', owner: 'Alex', questionCount: 8, responseCount: 12, createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-09-08T11:20:00Z' },
  { id: 'svy-002', title: 'Employee Engagement Survey', status: 'active', owner: 'Priya', questionCount: 14, responseCount: 30, createdAt: '2026-06-10T09:00:00Z', updatedAt: '2026-09-07T15:40:00Z' },
];

function seeded(): SearchService {
  const service = new SearchService();
  service.seed(pages, { surveys, responses: [], participants: [] });
  return service;
}

describe('editDistance', () => {
  it('is 0 for identical terms', () => {
    expect(editDistance('survey', 'survey')).toBe(0);
  });

  it('counts single-character substitutions', () => {
    expect(editDistance('survey', 'survry')).toBe(1);
  });

  it('returns small distances for short typos', () => {
    expect(editDistance('sat', 'cat')).toBe(1);
  });
});

describe('SearchService', () => {
  it('returns no groups below the two-character minimum', () => {
    expect(seeded().search('s')).toEqual([]);
  });

  it('groups page, record, and action matches with typed targets', () => {
    const groups = seeded().search('surve');
    const keys = groups.map((group) => group.key);
    expect(keys).toContain('pages');
    expect(keys).toContain('records');
    const surveyItem = groups.find((g) => g.key === 'records')!.items.find((item) => item.target === '/enterprise/surveys/svy-001');
    expect(surveyItem).toBeDefined();
  });

  it('matches actions only when their label matches', () => {
    const groups = seeded().search('launch');
    const actions = groups.find((group) => group.key === 'actions');
    expect(actions?.items[0].target).toBe('/enterprise/launch');
  });

  it('returns an empty array for no matches', () => {
    expect(seeded().search('zzzzzz')).toEqual([]);
  });

  it('suggests a confident correction when a single close term exists', () => {
    const service = seeded();
    expect(service.suggestion('survy', ['Surveys', 'Responses', 'Participants'])).toBe('Surveys');
  });

  it('returns null when no confident correction exists', () => {
    const service = seeded();
    expect(service.suggestion('kwyjibo', ['Surveys', 'Responses'])).toBeNull();
  });
});
