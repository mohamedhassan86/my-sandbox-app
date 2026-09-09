import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { copy, formatDateTime } from '../../copy/copy';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-ent-notifications-page',
  standalone: true,
  template: `
    <div class="e-command-bar">
      <h1 class="e-page-title">{{ copy.notifications.title }}</h1>
      <div class="e-row">
        <button type="button" class="e-btn e-btn-sm" (click)="filter.set('all')" [class.e-btn-primary]="filter() === 'all'">{{ copy.notifications.all }}</button>
        <button type="button" class="e-btn e-btn-sm" (click)="filter.set('unread')" [class.e-btn-primary]="filter() === 'unread'">{{ copy.notifications.unread }}</button>
        <button type="button" class="e-btn e-btn-sm" (click)="service.markAllRead()">{{ copy.notifications.markAllRead }}</button>
      </div>
    </div>

    @if (visible().length === 0) {
      <section class="e-card e-state" style="text-align: center">
        <p style="font-size: 26px" aria-hidden="true">\uD83C\uDF89</p>
        <h2 style="font-size: 17px">{{ copy.notifications.emptyTitle }}</h2>
        <p class="e-muted">{{ copy.notifications.emptyBody }}</p>
      </section>
    } @else {
      <div class="e-list">
        @for (item of visible(); track item.id) {
          <article class="e-card e-notif-row" [class.e-unread]="service.isUnread(item.id)">
            <span class="e-notif-dot" aria-hidden="true"></span>
            <div style="flex: 1; min-width: 0">
              <button type="button" class="e-notif-link" (click)="open(item)"><strong>{{ item.title }}</strong></button>
              <p class="e-muted" style="margin: 4px 0 0">{{ item.body }}</p>
              <span class="e-muted" style="font-size: 11px">{{ formatDateTime(item.createdAt) }}</span>
            </div>
            <div class="e-row">
              @if (service.isUnread(item.id)) {
                <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="service.markRead(item.id)">{{ copy.notifications.markRead }}</button>
              }
              <button type="button" class="e-btn e-btn-ghost e-btn-sm" [attr.aria-label]="copy.notifications.clear" (click)="service.clear(item.id)">\u2715</button>
            </div>
          </article>
        }
      </div>
      <button type="button" class="e-btn e-btn-ghost e-btn-sm" style="margin-top: var(--e-sp-1)" (click)="service.clearAll()">{{ copy.notifications.clearAll }}</button>
    }
  `,
  styles: [
    `
      .e-notif-row { display: flex; gap: var(--e-sp-1-5); align-items: flex-start; }
      .e-unread { border-left: 3px solid var(--e-brand); }
      .e-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--e-brand); margin-top: 6px; flex-shrink: 0; }
      .e-notif-link { background: transparent; border: 0; padding: 0; font: inherit; color: var(--e-text); cursor: pointer; text-align: left; }
      .e-notif-link:hover { color: var(--e-brand-strong); text-decoration: underline; }
    `,
  ],
})
export class NotificationsPageComponent {
  readonly copy = copy;
  readonly formatDateTime = formatDateTime;
  readonly filter = signal<'all' | 'unread'>('all');
  readonly service = inject(NotificationsService);
  private readonly router = inject(Router);

  readonly visible = computed(() => {
    const items = this.service.notifications();
    return this.filter() === 'unread' ? items.filter((n) => this.service.isUnread(n.id)) : items;
  });

  open(item: { deepLink?: string }): void {
    if (item.deepLink) void this.router.navigateByUrl(item.deepLink);
  }
}
