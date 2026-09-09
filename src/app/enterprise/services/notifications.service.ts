import { Injectable, computed, signal } from '@angular/core';
import { PersistenceService, persistedKeys } from './persistence.service';
import type { AppNotification } from '../models/entities.models';
import type { NotificationReadState } from '../models/state.models';
import { ActivityService } from './activity.service';

/** Live notification templates used by the demo scheduler (FR-037). */
export const NOTIFICATION_POOL: Array<Pick<AppNotification, 'category' | 'severity' | 'title' | 'body'> & { deepLink?: string }> = [
  { category: 'response', severity: 'info', title: 'New response received', body: 'A participant just completed Customer Satisfaction Pulse.', deepLink: '/enterprise/responses' },
  { category: 'response', severity: 'success', title: 'Response milestone', body: 'Employee Engagement Survey crossed 400 responses.', deepLink: '/enterprise/surveys/svy-002' },
  { category: 'survey', severity: 'warning', title: 'Draft survey paused', body: 'Quarterly Executive Briefing is awaiting review.', deepLink: '/enterprise/surveys/svy-004' },
  { category: 'participant', severity: 'info', title: 'Participant re-engaged', body: 'Maya Lindqvist submitted a new response today.', deepLink: '/enterprise/participants/prt-002' },
];

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly store = signal<AppNotification[]>([]);
  readonly readState = signal<NotificationReadState>({ readIds: [], clearedIds: [] });

  readonly notifications = computed(() =>
    this.store().filter((n) => !this.readState().clearedIds.includes(n.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
  readonly unreadCount = computed(() => this.notifications().filter((n) => !this.readState().readIds.includes(n.id)).length);

  private scheduler: ReturnType<typeof setInterval> | null = null;
  private poolIndex = 0;

  constructor(
    private readonly persistence: PersistenceService,
    private readonly activity: ActivityService,
  ) {
    this.readState.set(this.persistence.read(persistedKeys().notificationsReadState, { readIds: [], clearedIds: [] }));
  }

  seed(items: AppNotification[]): void {
    this.store.set(items);
  }

  push(item: AppNotification): void {
    this.store.set([item, ...this.store()]);
  }

  /** Demo event scheduler: emits a pooled notification on an interval (FR-037). */
  startScheduler(intervalMs = 45000): void {
    this.stopScheduler();
    this.scheduler = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      const template = NOTIFICATION_POOL[this.poolIndex % NOTIFICATION_POOL.length];
      this.poolIndex += 1;
      this.push({ ...template, id: `ntf-live-${Date.now()}`, createdAt: new Date().toISOString() });
      this.activity.record('page', template.deepLink ?? '/enterprise/notifications', `New notification: ${template.title}`);
    }, intervalMs);
  }

  stopScheduler(): void {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
  }

  markRead(id: string): void {
    this.updateRead({ readIds: [...new Set([...this.readState().readIds, id])] });
  }

  markAllRead(): void {
    this.updateRead({ readIds: [...new Set([...this.readState().readIds, ...this.notifications().map((n) => n.id)])] });
  }

  clear(id: string): void {
    this.updateRead({ clearedIds: [...new Set([...this.readState().clearedIds, id])] });
  }

  clearAll(): void {
    const ids = this.notifications().map((n) => n.id);
    this.updateRead({ clearedIds: [...new Set([...this.readState().clearedIds, ...ids])] });
  }

  isUnread(id: string): boolean {
    return !this.readState().readIds.includes(id);
  }

  /** Testable scheduler tick: emits the next pooled notification immediately. */
  tick(): AppNotification | null {
    const template = NOTIFICATION_POOL[this.poolIndex % NOTIFICATION_POOL.length];
    this.poolIndex += 1;
    if (!template) return null;
    const item: AppNotification = { ...template, id: `ntf-live-${Date.now()}`, createdAt: new Date().toISOString() };
    this.push(item);
    return item;
  }

  private updateRead(next: Partial<NotificationReadState>): void {
    const merged: NotificationReadState = { ...this.readState(), ...next };
    this.readState.set(merged);
    this.persistence.write(persistedKeys().notificationsReadState, merged);
  }
}
