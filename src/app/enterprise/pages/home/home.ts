import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { copy, formatDateTime } from '../../copy/copy';
import { FixtureService } from '../../services/fixture.service';
import { ActivityService } from '../../services/activity.service';
import { FavoritesService } from '../../services/favorites.service';
import { SkeletonRowsComponent, EmptyStateComponent } from '../../components/state-views/state-views';
import type { Favorite } from '../../models/entities.models';

@Component({
  selector: 'app-ent-home',
  standalone: true,
  imports: [RouterLink, SkeletonRowsComponent, EmptyStateComponent],
  template: `
    <div class="e-eyebrow">{{ greeting() }}</div>
    <div class="e-command-bar">
      <h1 class="e-page-title">{{ copy.demoUser.displayName }}</h1>
      <button type="button" class="e-btn e-btn-primary" (click)="router.navigate(['/enterprise/launch'])">
        {{ copy.task.launchTitle }}
      </button>
    </div>

    @if (loading()) {
      <app-ent-skeleton-rows [rowCount]="4" />
    } @else {
      <section aria-labelledby="qa-heading" style="margin-bottom: var(--e-sp-3)">
        <h2 class="e-label" id="qa-heading" style="font-size: 15px; text-transform: none; margin-bottom: var(--e-sp-1-5)">
          {{ copy.dashboard.quickActions }}
        </h2>
        <div class="e-dash-grid">
          @for (qa of quickActions(); track qa.id) {
            <a class="e-card e-quick-action" [routerLink]="qa.target" (click)="track(qa.label, qa.target)">
              <span class="e-qa-icon" aria-hidden="true">{{ iconFor(qa.icon) }}</span>
              <span style="font-weight: 600">{{ qa.label }}</span>
              <span class="e-muted">{{ qa.target.replace('/enterprise/', '') }}</span>
            </a>
          } @empty {
            <div class="e-card">
              <app-ent-empty-state glyph="+" [title]="copy.dashboard.quickActionsEmpty" [body]="''" />
            </div>
          }
        </div>
      </section>

      <div class="e-grid-2">
        <section aria-labelledby="recent-heading" class="e-card">
          <h2 class="e-label" id="recent-heading" style="font-size: 15px; text-transform: none; margin-bottom: var(--e-sp-1)">
            {{ copy.dashboard.recentActivity }}
          </h2>
          @if (activity().length === 0) {
            <app-ent-empty-state glyph="\u21BA" [title]="copy.states.emptyTitle" [body]="copy.dashboard.recentEmpty" />
          } @else {
            <div class="e-list">
              @for (entry of activity(); track entry.id) {
                <a class="e-list-item" [routerLink]="entry.targetRef || '/enterprise/home'">
                  <span class="e-li-icon" aria-hidden="true">{{ typeGlyph(entry.targetType) }}</span>
                  <span class="e-li-main">
                    <span class="e-li-title">{{ entry.title }}</span>
                    <span class="e-li-sub">{{ formatDateTime(entry.occurredAt) }}</span>
                  </span>
                </a>
              }
            </div>
          }
        </section>

        <section aria-labelledby="fav-heading" class="e-card">
          <h2 class="e-label" id="fav-heading" style="font-size: 15px; text-transform: none; margin-bottom: var(--e-sp-1)">
            {{ copy.dashboard.favorites }}
          </h2>
          @if (favorites().length === 0) {
            <app-ent-empty-state glyph="\u2606" [title]="copy.states.emptyTitle" [body]="copy.dashboard.favoritesEmpty" />
          } @else {
            <div class="e-list">
              @for (favorite of favorites(); track favorite.id) {
                <a class="e-list-item" [routerLink]="favorite.targetRef">
                  <span class="e-li-icon" aria-hidden="true">\u2605</span>
                  <span class="e-li-main">
                    <span class="e-li-title">{{ favorite.title }}</span>
                    <span class="e-li-sub">{{ favorite.targetType }}</span>
                  </span>
                  <button type="button" class="e-favorite-btn on" [attr.aria-label]="'Remove ' + favorite.title + ' from favorites'" (click)="$event.preventDefault(); removeFavorite(favorite)">\u2605</button>
                </a>
              }
            </div>
          }
        </section>
      </div>
    }
  `,
})
export class HomePageComponent {
  readonly copy = copy;
  readonly formatDateTime = formatDateTime;
  readonly router = inject(Router);
  private readonly fixtures = inject(FixtureService);
  private readonly activityService = inject(ActivityService);
  private readonly favoritesService = inject(FavoritesService);

  readonly loading = computed(() => this.fixtures.loading());
  readonly quickActions = computed(() => (this.fixtures.fixtures()?.quickActions ?? []).sort((a, b) => a.order - b.order));
  readonly activity = this.activityService.entries;
  readonly favorites: () => Favorite[] = this.favoritesService.favorites;

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    return `${prefix},`;
  });

  iconFor(icon: string): string {
    const map: Record<string, string> = { rocket: '\uD83D\uDE80', list: '\u2630', comment: '\uD83D\uDCAC', users: '\uD83D\uDC65' };
    return map[icon] ?? '\u2022';
  }

  typeGlyph(type: string): string {
    const map: Record<string, string> = { survey: '\u2630', response: '\u2606', participant: '\u25C9', view: '\u2699', task: '\u2714', page: '\uD83D\uDCC4' };
    return map[type] ?? '\u2022';
  }

  removeFavorite(favorite: Favorite): void {
    this.favoritesService.removeByTarget(favorite.targetType, favorite.targetRef);
  }

  track(title: string, target: string): void {
    this.activityService.record('page', target, title);
  }
}
