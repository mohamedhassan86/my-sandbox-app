import { Injectable, signal } from '@angular/core';
import type { CollectionKey, CollectionRow } from '../models/entities.models';
import type { FilterChip, SortState } from '../models/state.models';

export interface CollectionQuery {
  searchText?: string;
  /** field names searched by the free-text search box. */
  searchFields?: string[];
  filters?: FilterChip[];
  sort?: SortState | null;
  page?: number; // 1-based
  pageSize?: number;
}

export interface QueryResult<T> {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function asRecord(row: CollectionRow): Record<string, unknown> {
  return row as unknown as Record<string, unknown>;
}

function matchesFilter(row: CollectionRow, filter: FilterChip): boolean {
  const value = asRecord(row)[filter.field];
  switch (filter.op) {
    case 'eq':
      return value === filter.value;
    case 'contains': {
      if (value == null) return false;
      return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
    }
    case 'in': {
      const list = Array.isArray(filter.value) ? filter.value : [filter.value];
      return list.includes(value as never);
    }
    case 'gte':
      return typeof value === 'number' && typeof filter.value === 'number' && value >= filter.value;
    case 'lte':
      return typeof value === 'number' && typeof filter.value === 'number' && value <= filter.value;
    default:
      return true;
  }
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Pure read-only query over a row array (FR-022/FR-023): search ∧ filters ∧ sort ∧ paginate. */
export function queryCollection<T extends CollectionRow = CollectionRow>(rows: T[], query: CollectionQuery = {}): QueryResult<T> {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 10);
  const searchText = query.searchText?.trim().toLowerCase() ?? '';
  const searchFields = query.searchFields ?? ['title', 'name', 'email', 'id', 'owner'];

  let result = rows;
  if (searchText.length > 0) {
    result = result.filter((row) => searchFields.some((field) => {
      const value = asRecord(row)[field];
      return value != null && String(value).toLowerCase().includes(searchText);
    }));
  }
  for (const filter of query.filters ?? []) {
    result = result.filter((row) => matchesFilter(row, filter));
  }
  if (query.sort) {
    const { field, order } = query.sort;
    const dir = order === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => dir * compareValues(asRecord(a)[field], asRecord(b)[field]));
  }
  const total = result.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return { rows: result.slice(start, start + pageSize), total, page: safePage, pageSize, totalPages };
}

/**
 * Read-only collection service. Loads fixtures once and answers queries without
 * mutating data (FR-026).
 */
@Injectable({ providedIn: 'root' })
export class CollectionsService {
  private readonly rowsByKey = signal<Partial<Record<CollectionKey, CollectionRow[]>>>({});
  readonly ready = signal(false);

  seed(rows: Record<CollectionKey, CollectionRow[]>): void {
    this.rowsByKey.set(rows);
    this.ready.set(true);
  }

  all(key: CollectionKey): CollectionRow[] {
    return this.rowsByKey()[key] ?? [];
  }

  count(key: CollectionKey): number {
    return this.all(key).length;
  }

  query<T extends CollectionRow = CollectionRow>(key: CollectionKey, query: CollectionQuery = {}): QueryResult<T> {
    return queryCollection(this.all(key) as T[], query);
  }

  find<T extends CollectionRow = CollectionRow>(key: CollectionKey, id: string): T | undefined {
    return this.all(key).find((row) => row.id === id) as T | undefined;
  }
}
