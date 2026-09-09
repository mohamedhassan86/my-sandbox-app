import { describe, expect, it, beforeEach } from 'vitest';
import { PersistenceService } from './persistence.service';
import { FavoritesService, favoriteId } from './favorites.service';

function setup(): { persistence: PersistenceService; service: FavoritesService } {
  return { persistence: new PersistenceService(), service: new FavoritesService(new PersistenceService()) };
}

describe('FavoritesService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it('adds favorites in newest-first order', () => {
    const { service } = setup();
    service.add('record', '/enterprise/surveys/svy-001', 'Pulse');
    service.add('record', '/enterprise/surveys/svy-002', 'Engagement');
    expect(service.favorites().map((f) => f.targetRef)).toEqual(['/enterprise/surveys/svy-002', '/enterprise/surveys/svy-001']);
  });

  it('dedupes by stable favorite id for the same target', () => {
    const { service } = setup();
    service.add('record', '/enterprise/surveys/svy-001', 'Pulse');
    service.add('record', '/enterprise/surveys/svy-001', 'Pulse again');
    expect(service.favorites()).toHaveLength(1);
    expect(favoriteId('record', '/enterprise/surveys/svy-001')).toBe(service.favorites()[0].id);
  });

  it('toggle removes when present and adds when absent', () => {
    const { service } = setup();
    expect(service.toggle('view', '/enterprise/surveys', 'Active')).toBe(true);
    expect(service.isFavorite('view', '/enterprise/surveys')).toBe(true);
    expect(service.toggle('view', '/enterprise/surveys', 'Active')).toBe(false);
    expect(service.favorites()).toHaveLength(0);
  });

  it('removeByTarget clears only the matching target', () => {
    const { service } = setup();
    service.add('record', '/enterprise/surveys/svy-001', 'Pulse');
    service.add('record', '/enterprise/responses/rsp-001', 'Rsp');
    service.removeByTarget('record', '/enterprise/surveys/svy-001');
    expect(service.favorites().map((f) => f.targetRef)).toEqual(['/enterprise/responses/rsp-001']);
  });

  it('persists across service instances (ordering preserved)', () => {
    const { service } = setup();
    service.add('record', '/enterprise/surveys/svy-001', 'Pulse');
    const second = new FavoritesService(new PersistenceService());
    expect(second.favorites().map((f) => f.targetRef)).toEqual(['/enterprise/surveys/svy-001']);
  });
});
