import { Injectable } from '@angular/core';
import type { CollectionRow, RouteRef } from '../models/entities.models';
import { COLLECTIONS } from './simulation.service';

export interface SearchGroup {
  key: 'pages' | 'records' | 'views' | 'actions';
  label: string;
  items: SearchResult[];
}

export interface SearchResult {
  id: string;
  group: SearchGroup['key'];
  title: string;
  subtitle: string;
  target: RouteRef;
  action?: string;
}

export interface PageEntry {
  id: string;
  title: string;
  subtitle: string;
  target: string;
}

/** Simple edit distance for confident-suggestion detection (≤2 for short terms). */
export function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[m][n];
}

/**
 * Client-side global search over fixtures + app structure (FR-016–FR-020).
 * Pure matching helper is exported for tests.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private pages: PageEntry[] = [];
  private records: SearchResult[] = [];

  seed(pages: PageEntry[], collections: Partial<Record<'surveys' | 'responses' | 'participants', CollectionRow[]>>): void {
    this.pages = pages;
    const toResult = (rows: CollectionRow[], groupTitle: string, path: string): SearchResult[] =>
      rows.map((row) => ({
        id: `${path}-${row.id}`,
        group: 'records' as const,
        title: String((row as unknown as Record<string, unknown>)['title'] ?? (row as unknown as Record<string, unknown>)['name'] ?? row.id),
        subtitle: groupTitle,
        target: `${path}/${row.id}`,
      }));
    this.records = [
      ...toResult(collections.surveys ?? [], COLLECTIONS.surveys.label, COLLECTIONS.surveys.route),
      ...toResult(collections.responses ?? [], COLLECTIONS.responses.label, COLLECTIONS.responses.route),
      ...toResult(collections.participants ?? [], COLLECTIONS.participants.label, COLLECTIONS.participants.route),
    ];
  }

  search(query: string): SearchGroup[] {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return [];
    const match = (text: string) => text.toLowerCase().includes(term);

    const pageItems = this.pages.filter((p) => match(p.title) || match(p.subtitle)).map((p) => ({ id: `page-${p.id}`, group: 'pages' as const, title: p.title, subtitle: p.subtitle, target: p.target }));
    const recordItems = this.records.filter((r) => match(r.title) || match(r.subtitle)).slice(0, 12);
    const actionItems = this.pages
      .filter((p) => p.id.startsWith('action:') && (match(p.title) || match(p.subtitle)))
      .map((p) => ({ id: `action-${p.id}`, group: 'actions' as const, title: p.title, subtitle: p.subtitle, target: p.target, action: p.id.replace('action:', '') }));

    const groups: SearchGroup[] = [];
    if (pageItems.length) groups.push({ key: 'pages', label: 'Pages', items: pageItems });
    if (recordItems.length) groups.push({ key: 'records', label: 'Records', items: recordItems });
    if (actionItems.length) groups.push({ key: 'actions', label: 'Actions', items: actionItems });
    return groups;
  }

  /** Confident correction only when a single close known term exists. */
  suggestion(query: string, knownTerms: string[]): string | null {
    const term = query.trim().toLowerCase();
    if (term.length < 2) return null;
    let best: { term: string; dist: number } | null = null;
    for (const known of knownTerms) {
      const dist = editDistance(term, known.toLowerCase());
      if (dist <= 2 && dist > 0 && (best === null || dist < best.dist)) best = { term: known, dist };
    }
    return best?.term ?? null;
  }
}
