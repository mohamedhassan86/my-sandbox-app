import { Injectable, computed, signal } from '@angular/core';
import { PersistenceService, persistedKeys } from './persistence.service';
import type { AppPreferences, Appearance, Density } from '../models/state.models';
import { DEFAULT_PREFERENCES } from '../models/state.models';

/**
 * Owns appearance / accessibility-mode / density preferences with immediate
 * application and on-device persistence (FR-003/FR-004/FR-024, SC-009).
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly prefs = signal<AppPreferences>(DEFAULT_PREFERENCES);
  readonly appearance = computed(() => this.prefs().appearance);
  readonly accessibilityMode = computed(() => this.prefs().accessibilityMode);
  readonly tableDensity = computed(() => this.prefs().tableDensity);

  constructor(private readonly persistence: PersistenceService) {
    const saved = this.persistence.read<Partial<AppPreferences>>(persistedKeys().preferences, {});
    this.prefs.set({ ...DEFAULT_PREFERENCES, ...saved });
  }

  setAppearance(appearance: Appearance): void {
    this.update({ appearance });
  }

  toggleAccessibilityMode(): void {
    this.update({ accessibilityMode: !this.prefs().accessibilityMode });
  }

  setAccessibilityMode(enabled: boolean): void {
    this.update({ accessibilityMode: enabled });
  }

  setTableDensity(density: Density): void {
    this.update({ tableDensity: density });
  }

  private update(patch: Partial<AppPreferences>): void {
    this.prefs.update((current) => ({ ...current, ...patch }));
    this.persistence.write(persistedKeys().preferences, this.prefs());
  }
}

/** Resolves the 'system' appearance option against the OS preference. */
export function resolveAppearance(appearance: Appearance, prefersDark: boolean): 'light' | 'dark' {
  if (appearance === 'system') return prefersDark ? 'dark' : 'light';
  return appearance;
}
