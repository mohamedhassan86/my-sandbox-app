import { describe, expect, it } from 'vitest';
import { KeyboardService, parseShortcut, shortcutMatches } from './keyboard.service';
import type { ShortcutEntry } from '../models/entities.models';

function event(partial: Partial<KeyboardEvent>): KeyboardEvent {
  return {
    key: '',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => undefined,
    ...partial,
  } as KeyboardEvent;
}

describe('parseShortcut', () => {
  it('parses plain and chorded patterns', () => {
    expect(parseShortcut('mod+k')).toEqual({ ctrl: false, meta: true, alt: false, shift: false, key: 'k' });
    expect(parseShortcut('ctrl+alt+arrowright')).toEqual({ ctrl: true, meta: false, alt: true, shift: false, key: 'arrowright' });
  });
});

describe('shortcutMatches', () => {
  it('requires the exact modifier set', () => {
    expect(shortcutMatches(parseShortcut('mod+k'), event({ key: 'k', metaKey: true }))).toBe(true);
    expect(shortcutMatches(parseShortcut('mod+k'), event({ key: 'k', ctrlKey: true }))).toBe(false);
    expect(shortcutMatches(parseShortcut('mod+k'), event({ key: 'j', metaKey: true }))).toBe(false);
  });

  it('matches arrows without case sensitivity issues', () => {
    expect(shortcutMatches(parseShortcut('ctrl+alt+arrowright'), event({ key: 'ArrowRight', ctrlKey: true, altKey: true }))).toBe(true);
    expect(shortcutMatches(parseShortcut('ctrl+alt+arrowright'), event({ key: 'ArrowLeft', ctrlKey: true, altKey: true }))).toBe(false);
  });
});

describe('KeyboardService registry', () => {
  it('registers handlers per action and stores indexed entries', () => {
    const service = new KeyboardService();
    const entries: ShortcutEntry[] = [
      { id: 'sc-1', scope: 'global', keys: ['mod+k'], label: 'Search', action: 'open-search' },
      { id: 'sc-2', scope: 'global', keys: ['alt+h'], label: 'Home', action: 'go-home' },
    ];
    service.indexShortcuts(entries);
    expect(service.entries()).toHaveLength(2);
    expect(service.knownActions()).toContain('open-search');

    let fired = 0;
    service.register('open-search', () => (fired += 1));
    service.unregister('go-home');
    expect(fired).toBe(0);
    expect(service.entries()).toHaveLength(2);
  });
});
