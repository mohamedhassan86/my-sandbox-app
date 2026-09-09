import { Injectable, signal } from '@angular/core';
import { PersistenceService, persistedKeys } from './persistence.service';
import type { CollectionKey } from '../models/entities.models';
import type { DataView, FilterChip, SortState, ColumnSetting, Density } from '../models/state.models';

export interface ViewDefinition {
  name: string;
  searchText: string;
  filters: FilterChip[];
  sort: SortState | null;
  columns: ColumnSetting[];
  density: Density;
}

@Injectable({ providedIn: 'root' })
export class ViewsService {
  readonly views = signal<DataView[]>([]);

  constructor(private readonly persistence: PersistenceService) {
    this.views.set(this.persistence.read(persistedKeys().views, []));
  }

  forCollection(key: CollectionKey): DataView[] {
    return this.views()
      .filter((v) => v.collectionKey === key)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  find(id: string): DataView | undefined {
    return this.views().find((v) => v.id === id);
  }

  save(collectionKey: CollectionKey, definition: ViewDefinition): DataView {
    const trimmed = definition.name.trim();
    const now = new Date().toISOString();
    const existing = this.forCollection(collectionKey).find((v) => v.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      const updated: DataView = {
        ...existing,
        ...definition,
        name: trimmed,
        updatedAt: now,
      };
      this.persist(this.views().map((v) => (v.id === updated.id ? updated : v)));
      return updated;
    }
    const created: DataView = {
      id: `view-${Date.now()}`,
      collectionKey,
      ...definition,
      name: trimmed,
      createdAt: now,
      updatedAt: now,
    };
    this.persist([...this.views(), created]);
    return created;
  }

  rename(id: string, name: string): void {
    this.persist(this.views().map((v) => (v.id === id ? { ...v, name: name.trim(), updatedAt: new Date().toISOString() } : v)));
  }

  delete(id: string): void {
    this.persist(this.views().filter((v) => v.id !== id));
  }

  private persist(next: DataView[]): void {
    this.views.set(next);
    this.persistence.write(persistedKeys().views, next);
  }
}
