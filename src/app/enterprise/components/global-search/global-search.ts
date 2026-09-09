import { Component, computed, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { copy, interpolate } from '../../copy/copy';
import { SearchService } from '../../services/search.service';
import type { SearchGroup } from '../../services/search.service';

@Component({
  selector: 'app-ent-global-search',
  standalone: true,
  template: `
    @if (open()) {
      <div class="e-search-overlay" role="dialog" aria-modal="true" aria-label="Global search" (click)="close()">
        <div class="e-search-panel" role="search" (click)="$event.stopPropagation()">
          <input
            class="e-search-input"
            type="search"
            [placeholder]="copy.header.searchPlaceholder"
            [value]="query()"
            (input)="onInput($any($event.target).value)"
            (keydown)="onKey($event)"
            #queryInput
            autofocus
          />
          @if (groups().length === 0 && query().trim().length >= 2) {
            <div class="e-state">
              <p>{{ interpolate(copy.search.emptyTitle, { query: query().trim() }) }}</p>
              <p class="e-muted">{{ copy.search.emptyBody }}</p>
              @if (suggestion()) {
                <button type="button" class="e-btn e-btn-sm" (click)="useSuggestion()">
                  {{ interpolate(copy.search.suggestion, { suggestion: suggestion()! }) }}
                </button>
              }
            </div>
          } @else {
            @for (group of groups(); track group.key) {
              <section>
                <h2 class="e-label" style="padding: 8px 12px 4px; text-transform: uppercase">{{ group.label }}</h2>
                <ul class="e-search-results" role="listbox" (keydown)="onKey($event)">
                  @for (item of group.items; track item.id) {
                    <li
                      role="option"
                      [attr.aria-selected]="$index === activeIndex()"
                      [class.active]="$index === activeIndex()"
                      (mouseenter)="activeIndex.set($index)"
                      (click)="activate(group)"
                    >
                      <span class="e-li-main">
                        <strong>{{ item.title }}</strong>
                        <span class="e-li-sub">{{ item.subtitle }}</span>
                      </span>
                    </li>
                  }
                </ul>
              </section>
            }
            <p class="e-muted" style="padding: 8px 12px">{{ copy.search.openHint }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .e-search-overlay {
        position: fixed; inset: 0; z-index: 400;
        background: rgb(0 0 0 / 35%);
        padding-top: 12vh;
        display: flex; justify-content: center; align-items: flex-start;
      }
      .e-search-panel {
        width: min(620px, 92vw);
        background: var(--e-surface-raised);
        color: var(--e-text);
        border-radius: var(--e-radius-lg);
        box-shadow: var(--e-shadow-2);
        padding: var(--e-sp-1-5);
        max-height: 70vh; overflow-y: auto;
      }
      .e-search-input {
        width: 100%;
        border: 1px solid var(--e-stroke-strong);
        border-radius: var(--e-radius-sm);
        padding: 12px 14px;
        font: inherit; font-size: 16px;
        background: var(--e-surface-raised); color: var(--e-text);
      }
      .e-search-results { list-style: none; margin: 0; padding: 0; }
      .e-search-results li {
        display: flex; gap: var(--e-sp-1);
        padding: 8px 12px; border-radius: var(--e-radius-sm);
        cursor: pointer; align-items: center;
      }
      .e-search-results li.active, .e-search-results li:hover { background: var(--e-brand-tint); }
    `,
  ],
})
export class GlobalSearchComponent {
  readonly copy = copy;
  readonly interpolate = interpolate;
  readonly open = model(false);
  readonly query = signal('');
  readonly activeIndex = signal(0);
  readonly groups = computed(() => this.searchService.search(this.query()));
  readonly suggestion = computed(() => this.searchService.suggestion(this.query(), this.knownTerms));
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private knownTerms: string[] = [];

  /** Records all indexed record/page titles for suggestion matching. */
  setKnownTerms(terms: string[]): void {
    this.knownTerms = terms;
  }

  openDialog(): void {
    this.query.set('');
    this.activeIndex.set(0);
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
  }

  onInput(value: string): void {
    this.query.set(value);
    this.activeIndex.set(0);
  }

  onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(i + 1, this.totalItems() - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const flat = this.flatten();
      const item = flat[Math.min(this.activeIndex(), flat.length - 1)];
      if (item) this.openTarget(item.target);
    }
  }

  private totalItems(): number {
    return this.flatten().length;
  }

  private flatten(): { target: string }[] {
    return this.groups().flatMap((g) => g.items.map((i) => ({ target: i.target })));
  }

  activate(group: SearchGroup, index = this.activeIndex()): void {
    const item = group.items[index];
    if (item) this.openTarget(item.target);
  }

  useSuggestion(): void {
    const s = this.suggestion();
    if (s) this.query.set(s);
  }

  private openTarget(target: string): void {
    this.close();
    if (target.startsWith('action:')) {
      // Action results are registered by the shell via keyboard actions.
      return;
    }
    this.router.navigateByUrl(target);
  }
}
