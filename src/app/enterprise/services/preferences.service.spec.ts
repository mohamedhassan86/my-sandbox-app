import { describe, expect, it, beforeEach } from 'vitest';
import { PersistenceService } from './persistence.service';
import { PreferencesService, resolveAppearance } from './preferences.service';

describe('resolveAppearance', () => {
  it('honors the system preference for system mode', () => {
    expect(resolveAppearance('system', true)).toBe('dark');
    expect(resolveAppearance('system', false)).toBe('light');
  });

  it('returns the explicit choice for light/dark', () => {
    expect(resolveAppearance('dark', false)).toBe('dark');
    expect(resolveAppearance('light', true)).toBe('light');
  });
});

describe('PreferencesService', () => {
  beforeEach(() => {
    globalThis.localStorage?.clear();
  });

  it('defaults to system appearance, standard accessibility, comfortable density', () => {
    const service = new PreferencesService(new PersistenceService());
    expect(service.appearance()).toBe('system');
    expect(service.accessibilityMode()).toBe(false);
    expect(service.tableDensity()).toBe('comfortable');
  });

  it('applies and persists an explicit appearance choice', () => {
    const service = new PreferencesService(new PersistenceService());
    service.setAppearance('dark');
    expect(service.appearance()).toBe('dark');
    const reloaded = new PreferencesService(new PersistenceService());
    expect(reloaded.appearance()).toBe('dark');
  });

  it('toggles accessibility mode and persists it', () => {
    const service = new PreferencesService(new PersistenceService());
    service.setAccessibilityMode(true);
    service.toggleAccessibilityMode();
    expect(service.accessibilityMode()).toBe(false);
    service.toggleAccessibilityMode();
    expect(service.accessibilityMode()).toBe(true);
    const reloaded = new PreferencesService(new PersistenceService());
    expect(reloaded.accessibilityMode()).toBe(true);
  });

  it('persists table density', () => {
    const service = new PreferencesService(new PersistenceService());
    service.setTableDensity('compact');
    const reloaded = new PreferencesService(new PersistenceService());
    expect(reloaded.tableDensity()).toBe('compact');
  });
});
