import { Injectable, signal } from '@angular/core';
import { PersistenceService, persistedKeys } from './persistence.service';
import type { Draft } from '../models/state.models';

@Injectable({ providedIn: 'root' })
export class DraftsService {
  readonly drafts = signal<Record<string, Draft>>({});

  constructor(private readonly persistence: PersistenceService) {
    this.drafts.set(this.persistence.read(persistedKeys().drafts, {}));
  }

  get(taskKey: string): Draft | undefined {
    return this.drafts()[taskKey];
  }

  has(taskKey: string): boolean {
    return this.drafts()[taskKey] != null;
  }

  save(draft: Draft): void {
    const next = { ...this.drafts(), [draft.taskKey]: draft };
    this.drafts.set(next);
    this.persistence.write(persistedKeys().drafts, next);
  }

  clear(taskKey: string): void {
    const next = { ...this.drafts() };
    delete next[taskKey];
    this.drafts.set(next);
    this.persistence.write(persistedKeys().drafts, next);
  }
}
