import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { PersistenceService } from './persistence.service';
import { ActivityService } from './activity.service';
import { NotificationsService, NOTIFICATION_POOL } from './notifications.service';
import type { AppNotification } from '../models/entities.models';

function item(id: string, createdAt = '2026-09-09T08:00:00Z', title = `Notification ${id}`): AppNotification {
  return { id, category: 'response', severity: 'info', title, body: 'body', deepLink: '/enterprise/responses', createdAt };
}

function setup(): NotificationsService {
  return new NotificationsService(new PersistenceService(), new ActivityService(new PersistenceService()));
}

describe('NotificationsService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('seeds notifications newest-first from the fixture', () => {
    const service = setup();
    service.seed([item('ntf-1', '2026-09-09T09:00:00Z'), item('ntf-2', '2026-09-09T10:00:00Z')]);
    expect(service.notifications().map((n) => n.id)).toEqual(['ntf-2', 'ntf-1']);
  });

  it('computes the unread badge count', () => {
    const service = setup();
    service.seed([item('ntf-1'), item('ntf-2')]);
    expect(service.unreadCount()).toBe(2);
    service.markRead('ntf-1');
    expect(service.unreadCount()).toBe(1);
  });

  it('marks all as read and clears with confirmation state', () => {
    const service = setup();
    service.seed([item('ntf-1'), item('ntf-2')]);
    service.markAllRead();
    expect(service.unreadCount()).toBe(0);
    service.clear('ntf-1');
    expect(service.notifications().map((n) => n.id)).toEqual(['ntf-2']);
    service.clearAll();
    expect(service.notifications()).toHaveLength(0);
  });

  it('persists read/clear state across instances', () => {
    const service = setup();
    service.seed([item('ntf-1'), item('ntf-2')]);
    service.markRead('ntf-1');
    service.clear('ntf-2');
    const second = setup();
    second.seed([item('ntf-1'), item('ntf-2')]);
    expect(second.isUnread('ntf-1')).toBe(false); // read state restored
    expect(second.notifications().map((n) => n.id)).toEqual(['ntf-1']); // cleared stays hidden
  });

  it('push prepends a live item', () => {
    const service = setup();
    service.seed([item('ntf-1', '2026-09-09T09:00:00Z')]);
    service.push(item('ntf-live', '2026-09-09T12:00:00Z'));
    expect(service.notifications()[0].id).toBe('ntf-live');
  });

  it('emits a pooled notification when the demo scheduler ticks', () => {
    const service = setup();
    service.seed([item('ntf-1', '2026-09-09T09:00:00Z')]);
    service.startScheduler(45000);
    vi.advanceTimersByTime(45000);
    const live = service.notifications().filter((n) => n.id.startsWith('ntf-live-'));
    expect(live).toHaveLength(1);
    expect(NOTIFICATION_POOL.map((pool) => pool.title)).toContain(live[0].title);
    service.stopScheduler();
    vi.advanceTimersByTime(45000);
    expect(service.notifications().filter((n) => n.id.startsWith('ntf-live-'))).toHaveLength(1);
  });

  it('exposes a synchronous tick for deterministic tests', () => {
    const service = setup();
    const live = service.tick();
    expect(live?.id.startsWith('ntf-live-')).toBe(true);
  });
});
