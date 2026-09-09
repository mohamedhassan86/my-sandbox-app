import { Injectable } from '@angular/core';
import type { ShortcutEntry } from '../models/entities.models';

export type ShortcutAction =
  | 'open-search'
  | 'open-notifications'
  | 'toggle-dark'
  | 'toggle-a11y'
  | 'open-help'
  | 'go-home'
  | 'next-area'
  | 'prev-area';

const ACTION_IDS: ShortcutAction[] = ['open-search', 'open-notifications', 'toggle-dark', 'toggle-a11y', 'open-help', 'go-home', 'next-area', 'prev-area'];

const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"], .p-inputtext';

/** Parses a shortcut like "mod+k", "ctrl+alt+arrowright" into a matcher. */
export interface ParsedShortcut {
  ctrl: boolean;
  meta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

export function parseShortcut(pattern: string): ParsedShortcut {
  const parts = pattern.toLowerCase().split('+');
  return {
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('mod') || parts.includes('meta'),
    alt: parts.includes('alt'),
    shift: parts.includes('shift'),
    key: parts[parts.length - 1] ?? '',
  };
}

export function shortcutMatches(parsed: ParsedShortcut, event: KeyboardEvent): boolean {
  if (parsed.key === 'arrowright' && event.key !== 'ArrowRight') return false;
  if (parsed.key === 'arrowleft' && event.key !== 'ArrowLeft') return false;
  if (parsed.key === 'arrowup' && event.key !== 'ArrowUp') return false;
  if (parsed.key === 'arrowdown' && event.key !== 'ArrowDown') return false;
  if (!['arrowright', 'arrowleft', 'arrowup', 'arrowdown'].includes(parsed.key) && event.key.toLowerCase() !== parsed.key) return false;
  if (event.ctrlKey !== parsed.ctrl) return false;
  if (event.metaKey !== parsed.meta) return false;
  if (event.altKey !== parsed.alt) return false;
  if (event.shiftKey !== parsed.shift) return false;
  return true;
}

/**
 * Central shortcut registry + guard (FR-043/FR-044). Bindings never fire while
 * focus is inside an editable control.
 */
@Injectable({ providedIn: 'root' })
export class KeyboardService {
  private handlers = new Map<ShortcutAction, () => void>();
  private shortcutEntries: ShortcutEntry[] = [];
  private active = false;

  start(): void {
    if (this.active) return;
    this.active = true;
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.onKeyDown);
    }
  }

  stop(): void {
    if (!this.active) return;
    this.active = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.onKeyDown);
    }
  }

  /** Index from fixture entries; must be called after start for bindings to apply. */
  indexShortcuts(entries: ShortcutEntry[]): void {
    this.shortcutEntries = entries;
  }

  register(action: ShortcutAction, handler: () => void): void {
    this.handlers.set(action, handler);
  }

  unregister(action: ShortcutAction): void {
    this.handlers.delete(action);
  }

  entries(): ShortcutEntry[] {
    return this.shortcutEntries;
  }

  knownActions(): ShortcutAction[] {
    return ACTION_IDS;
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.isEditableTarget(event)) return;
    for (const entry of this.shortcutEntries) {
      for (const pattern of entry.keys) {
        if (shortcutMatches(parseShortcut(pattern), event)) {
          const action = entry.action as ShortcutAction;
          const handler = this.handlers.get(action);
          if (handler) {
            event.preventDefault();
            handler();
            return;
          }
        }
      }
    }
  };

  private isEditableTarget(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement | null;
    if (!target) return false;
    if (target.closest?.(EDITABLE_SELECTOR)) return true;
    return false;
  }
}
