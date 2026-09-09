import { Injectable, signal } from '@angular/core';
import type { Favorite, RecentActivityEntry } from '../models/entities.models';
import type {
  AppPreferences,
  DataView,
  Draft,
  NavState,
  NotificationReadState,
  OnboardingState,
} from '../models/state.models';

export const PERSISTENCE_PREFIX = 'enterprise.demo.v1.';

export interface PersistedState {
  preferences: AppPreferences;
  views: DataView[];
  favorites: Favorite[];
  drafts: Draft[];
  activity: RecentActivityEntry[];
  notificationsReadState: NotificationReadState;
  onboarding: OnboardingState;
  nav: NavState;
}

/**
 * Namespaced localStorage persistence for user-created state only (contracts/
 * persisted-state.md). Defensive: corrupt entries are dropped, never thrown.
 */
@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private storage: Storage | null = typeof localStorage !== 'undefined' ? localStorage : null;
  readonly changed = signal(0);

  read<T>(key: string, fallback: T): T {
    try {
      const raw = this.storage?.getItem(PERSISTENCE_PREFIX + key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[enterprise] dropping corrupt persisted state for "${key}"`);
      this.remove(key);
      return fallback;
    }
  }

  write(key: string, value: unknown): void {
    try {
      this.storage?.setItem(PERSISTENCE_PREFIX + key, JSON.stringify(value));
      this.changed.update((n) => n + 1);
    } catch (error) {
      console.error('[enterprise] could not persist state (quota or private mode)', error);
      throw new Error('Could not save on this device. Try "Reset demo data" to clear space.');
    }
  }

  remove(key: string): void {
    try {
      this.storage?.removeItem(PERSISTENCE_PREFIX + key);
    } catch {
      /* ignore */
    }
  }

  /** Clears every enterprise demo key (FR-047). */
  resetAll(): void {
    if (!this.storage) return;
    const toRemove: string[] = [];
    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(PERSISTENCE_PREFIX)) toRemove.push(key);
    }
    toRemove.forEach((key) => this.storage?.removeItem(key));
    this.changed.update((n) => n + 1);
  }

  hasAny(key: string): boolean {
    return this.storage?.getItem(PERSISTENCE_PREFIX + key) != null;
  }
}

/** Type helpers for per-store keys. */
export function persistedKeys() {
  return {
    preferences: 'preferences',
    views: 'views',
    favorites: 'favorites',
    drafts: 'drafts',
    activity: 'activity',
    notificationsReadState: 'notifications.readState',
    onboarding: 'onboarding',
    nav: 'nav',
  } as const;
}
