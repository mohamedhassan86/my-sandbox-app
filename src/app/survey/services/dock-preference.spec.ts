import { describe, expect, it } from 'vitest';
import {
  DOCK_MODE_STORAGE_KEY,
  browserLocalStorage,
  normalizeDockMode,
  readDockMode,
  writeDockMode,
} from './dock-preference';

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const calls: string[] = [];
  return {
    data,
    calls,
    getItem: (key: string) => {
      calls.push(`get:${key}`);
      return data.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      calls.push(`set:${key}=${value}`);
      data.set(key, value);
    },
    removeItem: (key: string) => {
      calls.push(`remove:${key}`);
      data.delete(key);
    },
  };
}

const explodingGet = {
  getItem: () => {
    throw new Error('denied');
  },
};
const explodingSet = {
  setItem: () => {
    throw new Error('denied');
  },
};

describe('dock-preference', () => {
  describe('normalizeDockMode', () => {
    it('accepts only the stored collapsed value', () => {
      expect(normalizeDockMode('collapsed')).toBe('collapsed');
      for (const corrupt of ['expanded', 'true', '1', '', null, undefined, 3, {}]) {
        expect(normalizeDockMode(corrupt)).toBe('expanded');
      }
    });
  });

  describe('readDockMode', () => {
    it('returns the stored mode on desktop', () => {
      const storage = fakeStorage({ [DOCK_MODE_STORAGE_KEY]: 'collapsed' });
      expect(readDockMode(storage, true)).toBe('collapsed');
    });

    it('defaults to expanded for a first-time visitor or a corrupt value', () => {
      expect(readDockMode(fakeStorage(), true)).toBe('expanded');
      expect(readDockMode(fakeStorage({ [DOCK_MODE_STORAGE_KEY]: 'junk' }), true)).toBe('expanded');
    });

    it('never consults storage below the breakpoint', () => {
      const storage = fakeStorage({ [DOCK_MODE_STORAGE_KEY]: 'collapsed' });
      expect(readDockMode(storage, false)).toBe('expanded');
      expect(readDockMode(null, true)).toBe('expanded');
      expect(readDockMode(undefined, true)).toBe('expanded');
      expect(storage.calls).toEqual([]);
    });

    it('degrades to expanded when storage access throws', () => {
      expect(readDockMode(explodingGet, true)).toBe('expanded');
    });
  });

  describe('writeDockMode', () => {
    it('persists the mode on desktop', () => {
      const storage = fakeStorage();
      writeDockMode(storage, true, 'collapsed');
      expect(storage.data.get(DOCK_MODE_STORAGE_KEY)).toBe('collapsed');
      writeDockMode(storage, true, 'expanded');
      expect(storage.data.get(DOCK_MODE_STORAGE_KEY)).toBe('expanded');
    });

    it('is a complete no-op below the breakpoint or without storage', () => {
      const storage = fakeStorage();
      writeDockMode(storage, false, 'collapsed');
      writeDockMode(null, true, 'collapsed');
      writeDockMode(undefined, true, 'collapsed');
      expect(storage.calls).toEqual([]);
    });

    it('swallows storage failures (session-only, no error surfaces)', () => {
      expect(() => writeDockMode(explodingSet, true, 'collapsed')).not.toThrow();
    });
  });

  describe('browserLocalStorage', () => {
    it('returns null without a window or without localStorage', () => {
      expect(browserLocalStorage(undefined)).toBeNull();
      expect(browserLocalStorage(null)).toBeNull();
      expect(browserLocalStorage({})).toBeNull();
    });

    it('returns null when the storage accessor throws or the probe fails', () => {
      expect(
        browserLocalStorage({
          get localStorage() {
            throw new Error('denied');
          },
        }),
      ).toBeNull();
      expect(browserLocalStorage({ localStorage: explodingSet })).toBeNull();
    });

    it('returns working storage after a probe round-trip', () => {
      const storage = fakeStorage();
      expect(browserLocalStorage({ localStorage: storage })).toBe(storage);
      expect(storage.data.has(`${DOCK_MODE_STORAGE_KEY}.probe`)).toBe(false);
    });
  });
});
