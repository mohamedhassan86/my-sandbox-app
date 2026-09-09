import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { EmptyStateComponent } from '../state-views/state-views';
import { copy, interpolate, formatDateTime } from '../../copy/copy';
import { CollectionsService } from '../../services/collections.service';
import { ViewsService } from '../../services/views.service';
import { PreferencesService } from '../../services/preferences.service';
import { SimulationService } from '../../services/simulation.service';
import { ToastService } from '../../services/toast.service';
import { FavoritesService } from '../../services/favorites.service';
import { ActivityService } from '../../services/activity.service';
import type { CollectionKey, CollectionRow } from '../../models/entities.models';
import type { DataView, FilterChip, SortState, ColumnSetting } from '../../models/state.models';
import { ConfirmDialogComponent, type ConfirmRequest } from '../confirm-dialog/confirm-dialog';

export interface TableColumn {
  key: string;
  header: string;
  kind: 'text' | 'number' | 'status' | 'date' | 'score' | 'boolean' | 'link';
  sortable?: boolean;
  defaultVisible?: boolean;
}

export interface CollectionConfig {
  key: CollectionKey;
  title: string;
  detailRoute: string;
  columns: TableColumn[];
  searchFields: string[];
  rowTitle: (row: CollectionRow) => string;
  bulkArchiveLabel: string;
}

const STATUS_PILL: Record<string, string> = {
  active: 'e-pill-active',
  draft: 'e-pill-draft',
  paused: 'e-pill-paused',
  archived: 'e-pill-archived',
  complete: 'e-pill-complete',
  partial: 'e-pill-paused',
  abandoned: 'e-pill-abandoned',
};

function fieldOf(row: CollectionRow, key: string): unknown {
  return (row as unknown as Record<string, unknown>)[key];
}

function cfg(key: CollectionKey, title: string, detailRoute: string, rowTitle: (row: CollectionRow) => string, bulk: string): Omit<CollectionConfig, 'columns'> {
  return { key, title, detailRoute, rowTitle, bulkArchiveLabel: bulk, searchFields: ['title', 'name', 'email', 'owner', 'id', 'region'] };
}

const CONFIGS: Record<CollectionKey, CollectionConfig> = {
  surveys: {
    ...cfg('surveys', 'Surveys', '/enterprise/surveys', (r) => String(fieldOf(r, 'title') ?? r.id), 'Archive surveys'),
    columns: [
      { key: 'title', header: 'Title', kind: 'link', sortable: true },
      { key: 'status', header: 'Status', kind: 'status', sortable: true },
      { key: 'owner', header: 'Owner', kind: 'text', sortable: true },
      { key: 'questionCount', header: 'Questions', kind: 'number', sortable: true },
      { key: 'responseCount', header: 'Responses', kind: 'number', sortable: true },
      { key: 'rating', header: 'Rating', kind: 'score', sortable: true },
      { key: 'updatedAt', header: 'Updated', kind: 'date', sortable: true, defaultVisible: false },
    ],
  },
  responses: {
    ...cfg('responses', 'Responses', '/enterprise/responses', (r) => `Response ${r.id}`, 'Delete responses'),
    columns: [
      { key: 'id', header: 'Response', kind: 'link', sortable: true },
      { key: 'surveyId', header: 'Survey', kind: 'text', sortable: true },
      { key: 'participantId', header: 'Participant', kind: 'text', sortable: true },
      { key: 'score', header: 'Score', kind: 'score', sortable: true },
      { key: 'completion', header: 'Completion', kind: 'status', sortable: true },
      { key: 'device', header: 'Device', kind: 'text', sortable: true },
      { key: 'durationMinutes', header: 'Minutes', kind: 'number', sortable: true, defaultVisible: false },
    ],
  },
  participants: {
    ...cfg('participants', 'Participants', '/enterprise/participants', (r) => String(fieldOf(r, 'name') ?? r.id), 'Delete participants'),
    columns: [
      { key: 'name', header: 'Name', kind: 'link', sortable: true },
      { key: 'email', header: 'Email', kind: 'text', sortable: true, defaultVisible: false },
      { key: 'region', header: 'Region', kind: 'text', sortable: true },
      { key: 'optedIn', header: 'Opted in', kind: 'boolean', sortable: true },
      { key: 'totalResponses', header: 'Responses', kind: 'number', sortable: true },
      { key: 'lastActiveAt', header: 'Last active', kind: 'date', sortable: true },
    ],
  },
};

@Component({
  selector: 'app-ent-data-table',
  standalone: true,
  imports: [ConfirmDialogComponent, RouterLink, EmptyStateComponent],
  template: `
    <div class="e-table-wrap">
      <div class="e-toolbar">
        <label class="e-search-box">
          <span aria-hidden="true">\u2315</span>
          <input type="search" [value]="searchText()" (input)="onSearch($any($event.target).value)" [placeholder]="copy.collections.search" />
        </label>
        <label class="e-muted" style="margin-left: auto">
          <span class="e-sr-only">{{ copy.collections.views }}</span>
          <select class="e-input" style="width: auto" [value]="activeViewId() ?? ''" (change)="selectView($any($event.target).value)">
            <option value="">{{ copy.collections.views }} \u2014 {{ copy.collections.clearFilters }}</option>
            @for (view of savedViews(); track view.id) {
              <option [value]="view.id">{{ view.name }}</option>
            }
          </select>
        </label>
        <button type="button" class="e-btn e-btn-sm" (click)="savingView.set(!savingView())">{{ copy.collections.saveView }}</button>
        <button type="button" class="e-btn e-btn-sm" (click)="showPersonalize.set(!showPersonalize())">{{ copy.collections.personalize }}</button>
        <button type="button" class="e-btn e-btn-sm" (click)="exportMenu.set(!exportMenu())">{{ copy.collections.export }}</button>
      </div>

      @if (savingView()) {
        <div class="e-chip-row">
          <input class="e-input" style="max-width: 260px" [value]="newViewName()" (input)="newViewName.set($any($event.target).value)" [placeholder]="copy.collections.viewName" />
          <button type="button" class="e-btn e-btn-primary e-btn-sm" (click)="saveCurrentView()">{{ copy.collections.saveView }}</button>
          <button type="button" class="e-btn e-btn-sm" (click)="savingView.set(false)">{{ copy.dialog.cancel }}</button>
        </div>
      }

      @if (exportMenu()) {
        <div class="e-chip-row">
          <button type="button" class="e-btn e-btn-sm" (click)="exportRows('page', 'csv')">{{ copy.collections.exportCsv }}</button>
          <button type="button" class="e-btn e-btn-sm" (click)="exportRows('all', 'csv')">{{ copy.collections.exportAllCsv }}</button>
          <button type="button" class="e-btn e-btn-sm" (click)="exportRows('all', 'json')">{{ copy.collections.exportJson }}</button>
        </div>
      }

      @if (showPersonalize()) {
        <div class="e-chip-row">
          <span class="e-label">{{ copy.collections.columnPicker }}</span>
          @for (column of config().columns; track column.key) {
            <label class="e-chip" style="cursor: pointer">
              <input type="checkbox" [checked]="columnVisible(column.key)" (change)="toggleColumn(column.key)" style="accent-color: var(--e-brand)" />
              {{ column.header }}
            </label>
          }
          <span class="e-label" style="margin-left: var(--e-sp-2)">{{ copy.collections.density }}</span>
          @for (option of ['comfortable', 'compact']; track option) {
            <button type="button" class="e-btn e-btn-sm" [class.e-btn-primary]="density() === option" (click)="applyDensity(option)">{{ option }}</button>
          }
        </div>
      }

      @if (activeFilters().length > 0) {
        <div class="e-chip-row">
          @for (filter of activeFilters(); track filter.id) {
            <span class="e-chip">
              {{ filter.label }}
              <button type="button" [attr.aria-label]="'Remove filter ' + filter.label" (click)="removeFilter(filter.id)">\u2715</button>
            </span>
          }
          <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="clearFilters()">{{ copy.collections.clearFilters }}</button>
        </div>
      }

      @if (selectedIds().length > 0) {
        <div class="e-chip-row" style="background: var(--e-brand-tint)">
          <strong>{{ interpolate(copy.collections.bulkBar, { count: selectedIds().length }) }}</strong>
          <button type="button" class="e-btn e-btn-sm e-btn-danger" (click)="askBulkArchive()">{{ config().bulkArchiveLabel }}</button>
          <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="clearSelection()">{{ copy.collections.clearSelection }}</button>
        </div>
      }

      <div class="e-table-scroll">
        <table class="e-table" [class.e-table-compact]="density() === 'compact'">
          <thead>
            <tr>
              <th>
                <input type="checkbox" [checked]="allPageSelected()" (change)="toggleSelectAllPage()" [attr.aria-label]="copy.collections.selectAll" style="accent-color: var(--e-brand)" />
              </th>
              @for (column of visibleColumns(); track column.key) {
                <th class="e-sortable" [attr.aria-sort]="ariaSort(column.key)" (click)="cycleSort(column.key)">
                  {{ column.header }}
                  <span aria-hidden="true">{{ sortGlyph(column.key) }}</span>
                </th>
              }
              <th><span class="e-sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            @for (row of pageRows(); track row.id) {
              <tr [class.e-table-row-selected]="isSelected(row.id)">
                <td>
                  <input type="checkbox" [checked]="isSelected(row.id)" (change)="toggleSelected(row.id)" [attr.aria-label]="'Select row ' + rowTitle(row)" style="accent-color: var(--e-brand)" />
                </td>
                @for (column of visibleColumns(); track column.key) {
                  <td>
                    @if (column.kind === 'link') {
                      <a [routerLink]="detailRoute(row)">{{ cellValue(row, column) }}</a>
                    } @else if (column.kind === 'status') {
                      <span class="e-pill" [class]="statusPill(cellValue(row, column))">{{ cellValue(row, column) }}</span>
                    } @else if (column.kind === 'date') {
                      {{ formatDate(cellValue(row, column)) }}
                    } @else if (column.kind === 'score') {
                      <span class="e-score" [class.e-score-low]="numberValue(cellValue(row, column)) < 65">{{ numberValue(cellValue(row, column)) }}</span>
                    } @else if (column.kind === 'boolean') {
                      {{ cellValue(row, column) ? '\u2713' : '\u2013' }}
                    } @else {
                      {{ cellValue(row, column) }}
                    }
                  </td>
                }
                <td>
                  <a class="e-btn e-btn-ghost e-btn-sm" [routerLink]="detailRoute(row)">View</a>
                  <button type="button" class="e-favorite-btn" [class.on]="isFavorite(row)" [attr.aria-label]="(isFavorite(row) ? 'Remove ' : 'Add ') + rowTitle(row) + ' to favorites'" (click)="toggleFavorite(row)">
                    {{ isFavorite(row) ? '\u2605' : '\u2606' }}
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (loading()) {
        <div class="e-skeleton-row">
          @for (row of [1, 2, 3]; track row) {
            <div style="height: 2rem; border-radius: 8px; background: var(--e-surface-hover)"></div>
          }
        </div>
      } @else if (result().total === 0) {
        <app-ent-empty-state glyph="\u2630" [title]="copy.collections.noRows" [body]="copy.collections.noRowsHint" actionLabel="Clear filters" (action)="clearFilters()" />
      }

      <div class="e-table-footer">
        <span class="e-muted">{{ interpolate(copy.collections.resultsSummary, { start: resultStart(), end: resultEnd(), total: result().total }) }}</span>
        <div class="e-pager">
          <button type="button" [disabled]="result().page === 1" (click)="goTo(result().page - 1)">\u2039</button>
          @for (page of pageWindow(); track page) {
            <button type="button" [class.active]="page === result().page" (click)="goTo(page)">{{ page }}</button>
          }
          <button type="button" [disabled]="result().page >= result().totalPages" (click)="goTo(result().page + 1)">\u203A</button>
        </div>
      </div>
    </div>
    <app-ent-confirm-dialog [request]="confirmRequest()" [(open)]="confirmOpen" (confirmed)="runBulkArchive()" />
  `,
  styles: [
    `
      .e-score { font-weight: 700; color: var(--e-success); }
      .e-score-low { color: var(--e-error); }
      a { color: var(--e-brand-strong); text-decoration: none; }
      a:hover { text-decoration: underline; }
      .e-empty-cell { color: var(--e-text-disabled); }
    `,
  ],
})
export class DataTableComponent {
  readonly copy = copy;
  readonly interpolate = interpolate;
  readonly collectionKey = input.required<CollectionKey>();
  readonly loading = input(false);
  readonly confirmOpen = signal(false);

  private readonly collections = inject(CollectionsService);
  private readonly views = inject(ViewsService);
  private readonly preferences = inject(PreferencesService);
  private readonly simulation = inject(SimulationService);
  private readonly toast = inject(ToastService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly activity = inject(ActivityService);
  private readonly router = inject(Router);

  readonly config = computed(() => CONFIGS[this.collectionKey()]);

  readonly searchText = signal('');
  readonly filters = signal<FilterChip[]>([]);
  readonly sort = signal<SortState | null>(null);
  readonly page = signal(1);
  readonly pageSize = signal(8);
  readonly density = this.preferences.tableDensity;
  readonly columnVis = signal<Record<string, boolean>>({});
  readonly activeViewId = signal<string | null>(null);
  readonly selectedIds = signal<string[]>([]);
  readonly savingView = signal(false);
  readonly newViewName = signal('');
  readonly showPersonalize = signal(false);
  readonly exportMenu = signal(false);
  readonly rowsCache = signal<CollectionRow[]>([]);

  readonly savedViews = computed(() => this.views.forCollection(this.collectionKey()));

  readonly result = computed(() => {
    const cfg = this.config();
    return this.collections.query(this.collectionKey(), {
      searchText: this.searchText(),
      searchFields: cfg.searchFields,
      filters: this.filters(),
      sort: this.sort(),
      page: this.page(),
      pageSize: this.pageSize(),
    });
  });

  readonly pageRows = computed(() => this.result().rows);
  readonly activeFilters = this.filters;
  readonly totalPages = computed(() => this.result().totalPages);

  readonly visibleColumns = computed(() =>
    this.config().columns.filter((column) => {
      const state = this.columnVis()[column.key];
      return state ?? column.defaultVisible ?? true;
    }),
  );

  constructor() {
    // Reset local query state when the collection changes.
    this.columnVis.set({});
  }

  // --- cell helpers ---------------------------------------------------------
  cellValue(row: CollectionRow, column: TableColumn): unknown {
    const value = fieldOf(row, column.key);
    if (value == null) return '\u2013';
    return value;
  }

  numberValue(value: unknown): number {
    return typeof value === 'number' ? value : Number.NaN;
  }

  formatDate(value: unknown): string {
    return typeof value === 'string' ? formatDateTime(value) : String(value ?? '');
  }

  statusPill(value: unknown): string {
    return STATUS_PILL[String(value)] ?? '';
  }

  rowTitle(row: CollectionRow): string {
    return this.config().rowTitle(row);
  }

  detailRoute(row: CollectionRow): string {
    return `${this.config().detailRoute}/${row.id}`;
  }

  // --- search / filter / sort ----------------------------------------------
  onSearch(value: string): void {
    this.searchText.set(value);
    this.page.set(1);
  }

  addFilter(filter: FilterChip): void {
    this.filters.set([...this.filters(), filter]);
    this.page.set(1);
  }

  removeFilter(id: string): void {
    this.filters.set(this.filters().filter((filter) => filter.id !== id));
    this.page.set(1);
  }

  clearFilters(): void {
    this.filters.set([]);
    this.searchText.set('');
    this.sort.set(null);
    this.page.set(1);
    this.activeViewId.set(null);
  }

  cycleSort(key: string): void {
    const current = this.sort();
    if (!current || current.field !== key) {
      this.sort.set({ field: key, order: 'asc' });
    } else if (current.order === 'asc') {
      this.sort.set({ field: key, order: 'desc' });
    } else {
      this.sort.set(null);
    }
    this.page.set(1);
  }

  ariaSort(key: string): string {
    const sort = this.sort();
    if (sort?.field !== key) return 'none';
    return sort.order === 'asc' ? 'ascending' : 'descending';
  }

  sortGlyph(key: string): string {
    const sort = this.sort();
    if (sort?.field !== key) return '';
    return sort.order === 'asc' ? '\u2191' : '\u2193';
  }

  // --- pagination -----------------------------------------------------------
  goTo(page: number): void {
    this.page.set(Math.max(1, Math.min(page, this.result().totalPages)));
  }

  pageWindow(): number[] {
    const total = this.result().totalPages;
    const current = this.result().page;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  resultStart(): number {
    const total = this.result().total;
    return total === 0 ? 0 : (this.result().page - 1) * this.result().pageSize + 1;
  }

  resultEnd(): number {
    return Math.min(this.result().page * this.result().pageSize, this.result().total);
  }

  // --- selection & bulk -----------------------------------------------------
  isSelected(id: string): boolean {
    return this.selectedIds().includes(id);
  }

  toggleSelected(id: string): void {
    this.selectedIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  allPageSelected(): boolean {
    const page = this.pageRows();
    return page.length > 0 && page.every((row) => this.isSelected(row.id));
  }

  toggleSelectAllPage(): void {
    const page = this.pageRows();
    if (this.allPageSelected()) {
      const pageIds = new Set(page.map((row) => row.id));
      this.selectedIds.update((ids) => ids.filter((id) => !pageIds.has(id)));
    } else {
      const ids = new Set(this.selectedIds());
      page.forEach((row) => ids.add(row.id));
      this.selectedIds.set([...ids]);
    }
  }

  clearSelection(): void {
    this.selectedIds.set([]);
  }

  confirmRequest(): ConfirmRequest {
    return {
      title: interpolate(copy.collections.confirmBulkTitle, { count: this.selectedIds().length }),
      body: copy.collections.confirmBulkBody,
      confirmLabel: this.configLabel(),
      destructive: true,
    };
  }

  configLabel(): string {
    return this.config().bulkArchiveLabel;
  }

  askBulkArchive(): void {
    this.confirmOpen.set(true);
  }

  async runBulkArchive(): Promise<void> {
    const outcome = await this.simulation.runAction('bulk-archive', this.selectedIds().length);
    if (outcome.ok) {
      this.toast.success(outcome.message ?? 'Done');
      this.activity.record('task', '', `Bulk action: ${this.selectedIds().length} ${this.config().key}`);
      this.clearSelection();
    } else {
      this.toast.error(outcome.error ?? 'Failed');
    }
  }

  // --- personalize ----------------------------------------------------------
  columnVisible(key: string): boolean {
    return this.columnVis()[key] ?? true;
  }

  toggleColumn(key: string): void {
    this.columnVis.update((state) => {
      const next = { ...state };
      next[key] = !(next[key] ?? true);
      return next;
    });
  }

  setDensity(density: 'comfortable' | 'compact'): void {
    this.preferences.setTableDensity(density);
  }

  applyDensity(value: string): void {
    this.setDensity(value === 'compact' ? 'compact' : 'comfortable');
  }

  // --- favorites ------------------------------------------------------------
  isFavorite(row: CollectionRow): boolean {
    return this.favoritesService.isFavorite('record', this.detailRoute(row));
  }

  toggleFavorite(row: CollectionRow): void {
    const isNowFav = this.favoritesService.toggle('record', this.detailRoute(row), this.rowTitle(row));
    this.toast.info(isNowFav ? 'Added to favorites' : 'Removed from favorites');
  }

  // --- saved views ----------------------------------------------------------
  selectView(id: string): void {
    if (!id) {
      this.activeViewId.set(null);
      return;
    }
    const view = this.views.find(id);
    if (!view) return;
    this.activeViewId.set(id);
    this.searchText.set(view.searchText);
    this.filters.set(view.filters);
    this.sort.set(view.sort);
    this.columnVis.set(Object.fromEntries(view.columns.map((c) => [c.key, c.visible])));
    this.preferences.setTableDensity(view.density);
    this.page.set(1);
  }

  saveCurrentView(): void {
    const name = this.newViewName().trim();
    if (!name) return;
    const cfg = this.config();
    const columns: ColumnSetting[] = cfg.columns.map((column) => ({ key: column.key, visible: this.columnVisible(column.key), order: 0 }));
    const view = this.views.save(this.collectionKey(), {
      name,
      searchText: this.searchText(),
      filters: this.filters(),
      sort: this.sort(),
      columns,
      density: this.density(),
    });
    this.activeViewId.set(view.id);
    this.savingView.set(false);
    this.newViewName.set('');
    this.toast.success(copy.toast.saved, name);
    this.activity.record('view', '', `Saved view "${name}"`);
  }

  // --- export ---------------------------------------------------------------
  async exportRows(scope: 'page' | 'all', format: 'csv' | 'json'): Promise<void> {
    this.exportMenu.set(false);
    const cfg = this.config();
    const query = {
      searchText: this.searchText(),
      searchFields: cfg.searchFields,
      filters: this.filters(),
      sort: this.sort(),
      page: scope === 'page' ? this.page() : 1,
      pageSize: scope === 'page' ? this.pageSize() : 10_000,
    };
    const data = this.collections.query(this.collectionKey(), query);
    try {
      if (format === 'json') {
        const content = JSON.stringify(data.rows, null, 2);
        downloadFile(`survey-hub-${this.collectionKey()}.json`, 'application/json', content);
      } else {
        const { fileName, content } = await this.simulation.exportCsv(data.rows.map((row) => row as unknown as Record<string, unknown>), null);
        downloadFile(fileName, 'text/csv', content);
      }
      this.toast.success(copy.collections.exportSuccess);
    } catch {
      this.toast.error(copy.collections.exportError);
    }
  }
}

function downloadFile(name: string, type: string, content: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
