import { Injectable, effect } from '@angular/core';
import { PreferencesService, resolveAppearance } from '../services/preferences.service';

export const ENTERPRISE_MODE_CLASS = 'enterprise-mode';

/**
 * Applies the enterprise theme classes on <html> so token sets (and PrimeNG
 * overrides) only affect the enterprise subtree while it is active, and are
 * removed for the survey viewer (FR-048, scoped dual identity).
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private mediaDark: MediaQueryList | null = null;
  private mediaMotion: MediaQueryList | null = null;

  constructor(private readonly preferences: PreferencesService) {
    effect(() => {
      const prefs = this.preferences.prefs();
      void prefs; // read for reactivity
      this.apply();
    });
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      this.mediaDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaDark.addEventListener?.('change', () => this.apply());
      this.mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.mediaMotion.addEventListener?.('change', () => this.apply());
    }
    this.apply();
  }

  private resolvedDark(): boolean {
    return this.mediaDark?.matches ?? false;
  }

  private reducedMotion(): boolean {
    return this.mediaMotion?.matches ?? false;
  }

  apply(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.add(ENTERPRISE_MODE_CLASS);
    root.classList.toggle('enterprise-dark', resolveAppearance(this.preferences.appearance(), this.resolvedDark()) === 'dark');
    root.classList.toggle('enterprise-a11y', this.preferences.accessibilityMode());
    root.classList.toggle('enterprise-reduced-motion', this.reducedMotion() || this.preferences.accessibilityMode());
  }

  clear(): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove(ENTERPRISE_MODE_CLASS, 'enterprise-dark', 'enterprise-a11y', 'enterprise-reduced-motion');
  }
}
