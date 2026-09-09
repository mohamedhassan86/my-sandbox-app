import { describe, expect, it } from 'vitest';
import { queryCollection } from './collections.service';
import type { SurveyRecord, ParticipantRecord } from '../models/entities.models';

const surveys: SurveyRecord[] = [
  { id: 'svy-001', title: 'Customer Satisfaction Pulse', status: 'active', owner: 'Alex Rivera', questionCount: 8, responseCount: 214, createdAt: '2026-06-02T09:00:00Z', updatedAt: '2026-09-08T11:20:00Z' },
  { id: 'svy-002', title: 'Employee Engagement Survey', status: 'active', owner: 'Priya Nair', questionCount: 14, responseCount: 431, createdAt: '2026-06-10T09:00:00Z', updatedAt: '2026-09-07T15:40:00Z' },
  { id: 'svy-003', title: 'Product Onboarding Feedback', status: 'draft', owner: 'Sam Okafor', questionCount: 6, responseCount: 0, createdAt: '2026-06-20T09:00:00Z', updatedAt: '2026-09-01T10:00:00Z' },
  { id: 'svy-004', title: 'Quarterly Executive Briefing', status: 'paused', owner: 'Alex Rivera', questionCount: 10, responseCount: 88, createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-08-30T09:00:00Z' },
  { id: 'svy-005', title: 'Event Satisfaction', status: 'archived', owner: 'Priya Nair', questionCount: 5, responseCount: 302, createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-07-15T09:00:00Z' },
];

describe('queryCollection', () => {
  it('returns everything when no query is provided', () => {
    expect(queryCollection(surveys).total).toBe(5);
  });

  it('filters free-text search across the named fields', () => {
    const result = queryCollection(surveys, { searchText: 'priya', searchFields: ['title', 'owner'] });
    expect(result.rows.map((row) => row.id)).toEqual(['svy-002', 'svy-005']);
  });

  it('combines search and filters by intersection', () => {
    const result = queryCollection(surveys, {
      searchText: 'satisfaction',
      searchFields: ['title'],
      filters: [{ id: 'f1', field: 'status', op: 'eq', value: 'active', label: 'Active' }],
    });
    expect(result.rows.map((row) => row.id)).toEqual(['svy-001']);
  });

  it('sorts ascending and descending by field', () => {
    const asc = queryCollection(surveys, { sort: { field: 'responseCount', order: 'asc' }, pageSize: 100 });
    expect(asc.rows[0].id).toBe('svy-003');
    const desc = queryCollection(surveys, { sort: { field: 'responseCount', order: 'desc' }, pageSize: 100 });
    expect(desc.rows[0].id).toBe('svy-002');
  });

  it('paginates with 1-based pages and clamps out-of-range pages', () => {
    const page = queryCollection(surveys, { page: 2, pageSize: 2 });
    expect(page.page).toBe(2);
    expect(page.rows).toHaveLength(2);
    expect(page.totalPages).toBe(3);
    const clamped = queryCollection(surveys, { page: 99, pageSize: 2 });
    expect(clamped.page).toBe(3);
    expect(clamped.rows).toHaveLength(1);
  });

  it('preserves the applied filter context across pages', () => {
    const participants: ParticipantRecord[] = Array.from({ length: 12 }, (_, index) => ({
      id: `prt-${String(index + 1).padStart(3, '0')}`,
      name: `Person ${index + 1}`,
      email: `p${index + 1}@example.com`,
      region: index % 2 === 0 ? 'Europe' : 'North America',
      optedIn: true,
      totalResponses: 1,
      createdAt: '2026-01-01T09:00:00Z',
      updatedAt: '2026-01-01T09:00:00Z',
    }));
    const filter = { id: 'region', field: 'region', op: 'eq' as const, value: 'Europe', label: 'Europe' };
    const page1 = queryCollection(participants, { filters: [filter], page: 1, pageSize: 2 });
    const page2 = queryCollection(participants, { filters: [filter], page: 2, pageSize: 2 });
    expect(page1.rows[0].region).toBe('Europe');
    expect(page2.rows[0].region).toBe('Europe');
    expect(page1.total).toBe(6);
    expect(page2.total).toBe(6);
  });

  it('matches null-safe comparisons for date-ish string columns', () => {
    const rows = surveys.filter((survey) => survey.status !== 'archived');
    const result = queryCollection(rows, { sort: { field: 'updatedAt', order: 'desc' }, pageSize: 100 });
    expect(result.rows[0].id).toBe('svy-001');
  });

  it('supports contains and in operators on filters', () => {
    const contains = queryCollection(surveys, { filters: [{ id: 'x', field: 'owner', op: 'contains', value: 'priya', label: 'P' }] });
    expect(contains.total).toBe(2);
    const inList = queryCollection(surveys, {
      filters: [{ id: 'y', field: 'status', op: 'in', value: ['draft', 'archived'], label: 'Inactive' }],
    });
    expect(inList.total).toBe(2);
  });
});
