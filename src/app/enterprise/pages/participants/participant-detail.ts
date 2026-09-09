import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { copy, formatDateTime } from '../../copy/copy';
import { CollectionsService } from '../../services/collections.service';
import { FavoritesService } from '../../services/favorites.service';
import { ActivityService } from '../../services/activity.service';
import { SkeletonRowsComponent } from '../../components/state-views/state-views';
import type { ParticipantRecord } from '../../models/entities.models';

@Component({
  selector: 'app-ent-participant-detail',
  standalone: true,
  imports: [RouterLink, SkeletonRowsComponent],
  template: `
    @if (loading()) {
      <app-ent-skeleton-rows [rowCount]="5" />
    } @else if (participant(); as rec) {
      <a class="e-muted" routerLink="/enterprise/participants">\u2190 {{ copy.nav.participants }}</a>
      <div class="e-command-bar" style="margin-top: var(--e-sp-1)">
        <div>
          <h1 class="e-page-title">{{ rec.name }}</h1>
          <span class="e-muted">{{ rec.email }}</span>
        </div>
        <button type="button" class="e-favorite-btn" style="font-size: 26px" [class.on]="favorite()" (click)="toggleFavorite()" [attr.aria-label]="(favorite() ? 'Remove from' : 'Add to') + ' favorites'">
          {{ favorite() ? '\u2605' : '\u2606' }}
        </button>
      </div>

      <div class="e-kpi-row">
        <div class="e-card e-kpi">
          <span class="e-kpi-value">{{ rec.totalResponses }}</span>
          <span class="e-kpi-label">Responses submitted</span>
        </div>
        <div class="e-card e-kpi">
          <span class="e-kpi-value">{{ rec.optedIn ? 'Yes' : 'No' }}</span>
          <span class="e-kpi-label">Opted into contact</span>
        </div>
        <div class="e-card e-kpi">
          <span class="e-kpi-value">{{ rec.lastActiveAt ? formatDateTime(rec.lastActiveAt) : '\u2013' }}</span>
          <span class="e-kpi-label">Last active</span>
        </div>
      </div>

      <div class="e-grid-2">
        <section class="e-card">
          <h2 class="e-label" style="font-size: 15px; text-transform: none">Profile</h2>
          <dl class="e-dl" style="margin-top: var(--e-sp-1-5)">
            <dt>Region</dt><dd>{{ rec.region }}</dd>
            <dt>Member since</dt><dd>{{ formatDateTime(rec.createdAt) }}</dd>
          </dl>
        </section>
      </div>
    }
  `,
  styles: [
    `
      .e-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: var(--e-sp-2); margin-bottom: var(--e-sp-3); }
      .e-kpi { text-align: center; }
      .e-kpi-value { display: block; font-size: 24px; font-weight: 700; }
      .e-kpi-label { color: var(--e-text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    `,
  ],
})
export class ParticipantDetailPageComponent {
  readonly copy = copy;
  readonly formatDateTime = formatDateTime;
  readonly loading = signal(false);
  readonly participant = signal<ParticipantRecord | null>(null);
  readonly favorite = signal(false);
  private readonly collections = inject(CollectionsService);
  private readonly favorites = inject(FavoritesService);
  private readonly activity = inject(ActivityService);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    const id = this.route.snapshot.params['id'] as string;
    const record = this.collections.find<ParticipantRecord>('participants', id);
    this.participant.set(record ?? null);
    if (record) {
      this.favorite.set(this.favorites.isFavorite('record', `/enterprise/participants/${record.id}`));
      this.activity.record('participant', `/enterprise/participants/${record.id}`, `Opened participant "${record.name}"`);
    }
  }

  toggleFavorite(): void {
    const record = this.participant();
    if (!record) return;
    this.favorite.set(this.favorites.toggle('record', `/enterprise/participants/${record.id}`, record.name));
  }
}
