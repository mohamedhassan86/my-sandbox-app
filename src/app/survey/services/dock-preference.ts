/**
 * Dock presentation preference (007-desktop-design-enhancement, FR-009).
 *
 * The single device-local value this feature persists: the desktop dock mode. No
 * Angular here — the rules are pure so the spec can inject storage and breakpoints:
 * reads/writes are refused below the desktop breakpoint, corrupt or absent values
 * normalize to `expanded`, and blocked or throwing storage degrades to session-only
 * (the toggle still works in-memory; no error ever surfaces).
 */

export type DockMode = 'expanded' | 'collapsed';

/** Device-local storage key documented in contracts/desktop-chrome.md §5. */
export const DOCK_MODE_STORAGE_KEY = 'survey.dock.mode';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

/** Anything other than the stored 'collapsed' means expanded (first visit, corruption). */
export function normalizeDockMode(value: unknown): DockMode {
  return value === 'collapsed' ? 'collapsed' : 'expanded';
}

export function readDockMode(
  storage: Pick<StorageLike, 'getItem'> | null | undefined,
  isDesktop: boolean,
): DockMode {
  if (!isDesktop || !storage) return 'expanded';
  try {
    return normalizeDockMode(storage.getItem(DOCK_MODE_STORAGE_KEY));
  } catch {
    return 'expanded';
  }
}

export function writeDockMode(
  storage: Pick<StorageLike, 'setItem'> | null | undefined,
  isDesktop: boolean,
  mode: DockMode,
): void {
  if (!isDesktop || !storage) return;
  try {
    storage.setItem(DOCK_MODE_STORAGE_KEY, mode);
  } catch {
    // Session-only degradation per FR-009: the in-memory toggle keeps working.
  }
}

/**
 * Resolves usable window.localStorage without throwing — private browsing and blocked
 * storage both resolve to `null` (session-only fallback). A probe writes and removes
 * a throwaway key so a silent quota failure fails closed rather than mid-session.
 */
export function browserLocalStorage(
  win: { localStorage?: unknown } | null | undefined,
): StorageLike | null {
  if (!win) return null;
  try {
    const storage = win.localStorage as StorageLike | undefined;
    if (!storage) return null;
    const probe = `${DOCK_MODE_STORAGE_KEY}.probe`;
    storage.setItem(probe, '1');
    storage.removeItem?.(probe);
    return storage;
  } catch {
    return null;
  }
}
