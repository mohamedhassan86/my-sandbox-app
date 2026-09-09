import { Injectable, signal } from '@angular/core';
import { PersistenceService, persistedKeys } from './persistence.service';
import type { RecentActivityEntry, ActivityTargetType, RouteRef } from '../models/entities.models';

export const ACTIVITY_CAP = 12;

@Injectable({ providedIn: 'root' })
export class ActivityService {
  readonly entries = signal<RecentActivityEntry[]>([]);

  constructor(private readonly persistence: PersistenceService) {
    this.entries.set(this.persistence.read(persistedKeys().activity, []));
  }

  record(targetType: ActivityTargetType, targetRef: RouteRef, title: string): void {
    const entry: RecentActivityEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      targetType,
      targetRef,
      title,
      occurredAt: new Date().toISOString(),
    };
    const next = [entry, ...this.entries()].slice(0, ACTIVITY_CAP);
    this.entries.set(next);
    this.persistence.write(persistedKeys().activity, next);
  }

  seed(entries: RecentActivityEntry[]): void {
    if (entries.length === 0) return;
    const merged = [...entries, ...this.entries()];
    const next = merged
      .filter((e, i, arr) => arr.findIndex((x) => x.id === e.id) === i)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .slice(0, ACTIVITY_CAP);
    this.entries.set(next);
    this.persistence.write(persistedKeys().activity, next);
  }
}
