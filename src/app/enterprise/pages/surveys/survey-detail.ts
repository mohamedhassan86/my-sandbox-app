import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { copy, formatDateTime } from '../../copy/copy';
import { CollectionsService } from '../../services/collections.service';
import { FavoritesService } from '../../services/favorites.service';
import { ActivityService } from '../../services/activity.service';
import { SkeletonRowsComponent } from '../../components/state-views/state-views';
import type { SurveyRecord } from '../../models/entities.models';

@Component({
  selector: 'app-ent-survey-detail',
  standalone: true,
  imports: [RouterLink, SkeletonRowsComponent],
  template: `
    @if (loading()) {
      <app-ent-skeleton-rows [rowCount]="5" />
    } @else if (record(); as rec) {
      <a class="e-muted" routerLink="/enterprise/surveys">\u2190 {{ copy.nav.surveys }}</a>
      <div class="e-command-bar" style="margin-top: var(--e-sp-1)">
        <div>
          <h1 class="e-page-title">{{ rec.title }}</h1>
          <span class="e-pill" [class]="pillClass(rec.status)">{{ rec.status }}</span>
        </div>
        <button type="button" class="e-favorite-btn" style="font-size: 26px" [class.on]="favorite()" [attr.aria-label]="(favorite() ? 'Remove from' : 'Add to') + ' favorites'" (click)="toggleFavorite()">
          {{ favorite() ? '\u2605' : '\u2606' }}
        </button>
      </div>
      <div class="e-grid-2">
        <section class="e-card">
          <h2 class="e-label" style="font-size: 15px; text-transform: none">Details</h2>
          <dl class="e-dl" style="margin-top: var(--e-sp-1-5)">
            <dt>Owner</dt><dd>{{ rec.owner }}</dd>
            <dt>Status</dt><dd>{{ rec.status }}</dd>
            <dt>Audience</dt><dd>{{ rec.targetAudience ?? '\u2013' }}</dd>
            <dt>Questions</dt><dd>{{ rec.questionCount }}</dd>
            <dt>Responses</dt><dd>{{ rec.responseCount }}</dd>
            <dt>Rating</dt><dd>{{ rec.rating ?? '\u2013' }}</dd>
            <dt>Created</dt><dd>{{ formatDateTime(rec.createdAt) }}</dd>
            <dt>Updated</dt><dd>{{ formatDateTime(rec.updatedAt) }}</dd>
          </dl>
        </section>
      </div>
    }
  `,
})
export class SurveyDetailPageComponent {
  readonly copy = copy;
  readonly formatDateTime = formatDateTime;
  readonly loading = signal(false);
  readonly record = signal<SurveyRecord | null>(null);
  readonly favorite = signal(false);
  private readonly collections = inject(CollectionsService);
  private readonly favorites = inject(FavoritesService);
  private readonly activity = inject(ActivityService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.params['id'] as string;
    const record = this.collections.find<SurveyRecord>('surveys', id);
    this.record.set(record ?? null);
    if (record) {
      this.favorite.set(this.favorites.isFavorite('record', `/enterprise/surveys/${record.id}`));
      this.activity.record('survey', `/enterprise/surveys/${record.id}`, `Opened survey "${record.title}"`);
    }
  }

  pillClass(status: string): string {
    return `e-pill-${status}`;
  }

  toggleFavorite(): void {
    const record = this.record();
    if (!record) return;
    this.favorite.set(this.favorites.toggle('record', `/enterprise/surveys/${record.id}`, record.title));
  }
}
