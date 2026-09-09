import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { copy, formatDateTime } from '../../copy/copy';
import { CollectionsService } from '../../services/collections.service';
import { FavoritesService } from '../../services/favorites.service';
import { ActivityService } from '../../services/activity.service';
import { SkeletonRowsComponent } from '../../components/state-views/state-views';
import type { ResponseRecord, SurveyRecord, ParticipantRecord } from '../../models/entities.models';

@Component({
  selector: 'app-ent-response-detail',
  standalone: true,
  imports: [RouterLink, SkeletonRowsComponent],
  template: `
    @if (loading()) {
      <app-ent-skeleton-rows [rowCount]="5" />
    } @else if (response(); as rec) {
      <a class="e-muted" routerLink="/enterprise/responses">\u2190 {{ copy.nav.responses }}</a>
      <div class="e-command-bar" style="margin-top: var(--e-sp-1)">
        <div>
          <h1 class="e-page-title">Response {{ rec.id }}</h1>
          <span class="e-pill" [class]="pillClass(rec.completion)">{{ rec.completion }}</span>
        </div>
        <button type="button" class="e-favorite-btn" style="font-size: 26px" [class.on]="favorite()" (click)="toggleFavorite()" [attr.aria-label]="(favorite() ? 'Remove from' : 'Add to') + ' favorites'">
          {{ favorite() ? '\u2605' : '\u2606' }}
        </button>
      </div>

      <div class="e-kpi-row">
        <div class="e-card e-kpi">
          <span class="e-kpi-value" [class.e-score-low]="rec.score < 65">{{ rec.score }}</span>
          <span class="e-kpi-label">Score / 100</span>
        </div>
        <div class="e-card e-kpi">
          <span class="e-kpi-value">{{ rec.durationMinutes }}</span>
          <span class="e-kpi-label">Minutes to complete</span>
        </div>
        <div class="e-card e-kpi">
          <span class="e-kpi-value">{{ rec.device ?? '\u2013' }}</span>
          <span class="e-kpi-label">Device</span>
        </div>
      </div>

      <div class="e-grid-2">
        <section class="e-card">
          <h2 class="e-label" style="font-size: 15px; text-transform: none">Details</h2>
          <dl class="e-dl" style="margin-top: var(--e-sp-1-5)">
            <dt>Survey</dt>
            <dd>
              <a [routerLink]="'/enterprise/surveys/' + survey()!.id">{{ survey()!.title }}</a>
            </dd>
            <dt>Participant</dt>
            <dd>
              <a [routerLink]="'/enterprise/participants/' + participant()!.id">{{ participant()!.name }}</a>
            </dd>
            <dt>Completed</dt><dd>{{ formatDateTime(rec.createdAt) }}</dd>
          </dl>
        </section>
      </div>
    }
  `,
  styles: [
    `
      a { color: var(--e-brand-strong); text-decoration: none; }
      a:hover { text-decoration: underline; }
    `,
  ],
})
export class ResponseDetailPageComponent {
  readonly copy = copy;
  readonly formatDateTime = formatDateTime;
  readonly loading = signal(false);
  readonly response = signal<ResponseRecord | null>(null);
  readonly survey = signal<SurveyRecord | null>(null);
  readonly participant = signal<ParticipantRecord | null>(null);
  readonly favorite = signal(false);
  private readonly collections = inject(CollectionsService);
  private readonly favorites = inject(FavoritesService);
  private readonly activity = inject(ActivityService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.params['id'] as string;
    const record = this.collections.find<ResponseRecord>('responses', id);
    this.response.set(record ?? null);
    if (record) {
      this.survey.set(this.collections.find<SurveyRecord>('surveys', record.surveyId) ?? null);
      this.participant.set(this.collections.find<ParticipantRecord>('participants', record.participantId) ?? null);
      this.favorite.set(this.favorites.isFavorite('record', `/enterprise/responses/${record.id}`));
      this.activity.record('response', `/enterprise/responses/${record.id}`, `Opened response ${record.id}`);
    }
  }

  pillClass(completion: string): string {
    return `e-pill-${completion}`;
  }

  toggleFavorite(): void {
    const record = this.response();
    if (!record) return;
    this.favorite.set(this.favorites.toggle('record', `/enterprise/responses/${record.id}`, `Response ${record.id}`));
  }
}
