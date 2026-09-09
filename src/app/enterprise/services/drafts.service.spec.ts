import { describe, expect, it, beforeEach } from 'vitest';
import { PersistenceService } from './persistence.service';
import { DraftsService } from './drafts.service';

const draft = { taskKey: 'launch-survey', currentStepIndex: 1, values: { title: 'Pulse', audience: 'customers' }, updatedAt: '2026-09-09T10:00:00.000Z' };

describe('DraftsService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it('saves and restores a draft keyed by task', () => {
    const service = new DraftsService(new PersistenceService());
    service.save(draft);
    expect(service.has('launch-survey')).toBe(true);
    expect(service.get('launch-survey')).toEqual(draft);
  });

  it('overwrites the same task key on save', () => {
    const service = new DraftsService(new PersistenceService());
    service.save(draft);
    service.save({ ...draft, currentStepIndex: 2, values: { title: 'Pulse v2' } });
    expect(service.get('launch-survey')?.currentStepIndex).toBe(2);
    expect(service.get('launch-survey')?.values).toEqual({ title: 'Pulse v2' });
  });

  it('clears a draft on submit or discard', () => {
    const service = new DraftsService(new PersistenceService());
    service.save(draft);
    service.clear('launch-survey');
    expect(service.has('launch-survey')).toBe(false);
  });

  it('keeps distinct task drafts separate', () => {
    const service = new DraftsService(new PersistenceService());
    service.save(draft);
    service.save({ ...draft, taskKey: 'other-task', values: { region: 'emea' } });
    expect(service.get('launch-survey')).toEqual(draft);
    expect(service.get('other-task')?.values).toEqual({ region: 'emea' });
  });

  it('persists across service instances (survives a restart)', () => {
    const service = new DraftsService(new PersistenceService());
    service.save(draft);
    const second = new DraftsService(new PersistenceService());
    expect(second.get('launch-survey')).toEqual(draft);
  });
});
