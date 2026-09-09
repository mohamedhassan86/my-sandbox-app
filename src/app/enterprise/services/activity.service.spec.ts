import { describe, expect, it, beforeEach } from 'vitest';
import { PersistenceService } from './persistence.service';
import { ActivityService, ACTIVITY_CAP } from './activity.service';

function entry(id: string, occurredAt: string, title = 'Visit') {
  return { id, targetType: 'page' as const, targetRef: '/enterprise/home', title, occurredAt };
}

describe('ActivityService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it('records entries newest-first', () => {
    const service = new ActivityService(new PersistenceService());
    service.record('survey', '/enterprise/surveys/svy-001', 'Opened Pulse');
    service.record('page', '/enterprise/home', 'Home');
    const entries = service.entries();
    expect(entries[0].title).toBe('Home');
    expect(entries[1].targetType).toBe('survey');
  });

  it('caps the store at ACTIVITY_CAP entries', () => {
    const service = new ActivityService(new PersistenceService());
    for (let index = 0; index < ACTIVITY_CAP + 5; index++) {
      service.record('page', '/enterprise/home', `Visit ${index}`);
    }
    expect(service.entries()).toHaveLength(ACTIVITY_CAP);
  });

  it('seeds fixture entries by merging and deduping, newest first, capped', () => {
    const service = new ActivityService(new PersistenceService());
    service.record('page', '/enterprise/home', 'Mine');
    const seed = Array.from({ length: ACTIVITY_CAP + 2 }, (_, index) => entry(`seed-${index}`, new Date(2026, 0, 1, 0, index).toISOString(), `Seed ${index}`));
    service.seed(seed);
    expect(service.entries()).toHaveLength(ACTIVITY_CAP);
    const titles = service.entries().map((e) => e.title);
    expect(titles[0]).toBe('Mine'); // recent user activity stays newest-first
    expect(titles).toContain(`Seed ${ACTIVITY_CAP - 1}`);
  });

  it('persists activity across service instances', () => {
    const service = new ActivityService(new PersistenceService());
    service.record('page', '/enterprise/help', 'Help');
    const second = new ActivityService(new PersistenceService());
    expect(second.entries().map((e) => e.title)).toContain('Help');
  });
});
