import { describe, expect, it, beforeEach } from 'vitest';
import { PersistenceService } from './persistence.service';
import { ViewsService } from './views.service';
import type { ViewDefinition } from './views.service';

function definition(overrides: Partial<ViewDefinition> = {}): ViewDefinition {
  return {
    name: 'Active surveys',
    searchText: '',
    filters: [{ id: 's1', field: 'status', op: 'eq', value: 'active', label: 'Active' }],
    sort: { field: 'updatedAt', order: 'desc' },
    columns: [{ key: 'title', visible: true, order: 0 }],
    density: 'comfortable',
    ...overrides,
  };
}

describe('ViewsService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it('saves a view and restores its exact arrangement', () => {
    const service = new ViewsService(new PersistenceService());
    const saved = service.save('surveys', definition());
    const restored = service.find(saved.id);
    expect(restored).toEqual(saved);
    expect(restored?.filters[0].value).toBe('active');
    expect(restored?.sort).toEqual({ field: 'updatedAt', order: 'desc' });
    expect(restored?.columns).toEqual([{ key: 'title', visible: true, order: 0 }]);
  });

  it('treats names as unique per collection case-insensitively', () => {
    const service = new ViewsService(new PersistenceService());
    const first = service.save('surveys', definition({ name: 'My View' }));
    const second = service.save('surveys', definition({ name: 'my view', filters: [] }));
    expect(second.id).toBe(first.id);
    expect(service.forCollection('surveys')).toHaveLength(1);
  });

  it('keeps view lists independent per collection', () => {
    const service = new ViewsService(new PersistenceService());
    service.save('surveys', definition({ name: 'A' }));
    service.save('responses', definition({ name: 'B' }));
    expect(service.forCollection('surveys').map((view) => view.name)).toEqual(['A']);
    expect(service.forCollection('responses').map((view) => view.name)).toEqual(['B']);
  });

  it('renames and deletes views', () => {
    const service = new ViewsService(new PersistenceService());
    const saved = service.save('surveys', definition({ name: 'Original' }));
    service.rename(saved.id, 'Renamed');
    expect(service.find(saved.id)?.name).toBe('Renamed');
    service.delete(saved.id);
    expect(service.find(saved.id)).toBeUndefined();
  });

  it('persists views across service instances', () => {
    const service = new ViewsService(new PersistenceService());
    const saved = service.save('surveys', definition());
    const second = new ViewsService(new PersistenceService());
    expect(second.find(saved.id)?.name).toBe('Active surveys');
  });
});
