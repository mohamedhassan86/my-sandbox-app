import { Component, computed, inject, model, signal } from '@angular/core';
import { Router } from '@angular/router';
import { copy, formatDateTime } from '../../copy/copy';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-ent-notification-center',
  standalone: true,
  template: `
    @if (open()) {
      <div class="e-notif-backdrop" (click)="close()">
        <aside class="e-notif-drawer" role="dialog" aria-modal="true" aria-label="Notifications" (click)="$event.stopPropagation()">
          <div class="e-row" style="justify-content: space-between">
            <h2 style="font-size: 17px">{{ copy.notifications.title }}</h2>
            <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="close()" [attr.aria-label]="'Close'">\u2715</button>
          </div>
          <div class="e-row" style="gap: var(--e-sp-1)">
            <button type="button" class="e-btn e-btn-sm" [class.e-btn-primary]="filter() === 'all'" (click)="filter.set('all')">{{ copy.notifications.all }}</button>
            <button type="button" class="e-btn e-btn-sm" [class.e-btn-primary]="filter() === 'unread'" (click)="filter.set('unread')">{{ copy.notifications.unread }}</button>
            <span style="flex: 1"></span>
            <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="service.markAllRead()">{{ copy.notifications.markAllRead }}</button>
          </div>

          @if (visible().length === 0) {
            <div class="e-state">
              <p>{{ copy.notifications.emptyTitle }}</p>
              <p class="e-muted">{{ copy.notifications.emptyBody }}</p>
            </div>
          } @else {
            <div class="e-list">
              @for (item of visible(); track item.id) {
                <div class="e-notif-row" [class.unread]="service.isUnread(item.id)" [class.read]="!service.isUnread(item.id)">
                  <span class="e-notif-dot" aria-hidden="true"></span>
                  <div style="flex: 1; min-width: 0">
                    <button type="button" class="e-notif-link" (click)="activate(item.deepLink ?? '')">
                      <strong>{{ item.title }}</strong>
                    </button>
                    <p class="e-muted" style="margin: 2px 0 0">{{ item.body }}</p>
                    <span class="e-muted" style="font-size: 11px">{{ formatDateTime(item.createdAt) }}</span>
                  </div>
                  <div class="e-row" style="gap: 4px">
                    @if (service.isUnread(item.id)) {
                      <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="service.markRead(item.id)">{{ copy.notifications.markRead }}</button>
                    }
                    <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="service.clear(item.id)" [attr.aria-label]="copy.notifications.clear">\u2715</button>
                  </div>
                </div>
              }
            </div>
            <button type="button" class="e-btn e-btn-ghost e-btn-sm" style="align-self: flex-start" (click)="service.clearAll()">{{ copy.notifications.clearAll }}</button>
          }
        </aside>
      </div>
    }
  `,
  styles: [
    `
      .e-notif-backdrop { position: fixed; inset: 0; z-index: 380; background: rgb(0 0 0 / 35%); }
      .e-notif-drawer {
        position: absolute; top: 0; right: 0; bottom: 0;
        width: min(400px, 92vw);
        background: var(--e-surface-raised); color: var(--e-text);
        box-shadow: var(--e-shadow-2);
        padding: var(--e-sp-2);
        display: flex; flex-direction: column; gap: var(--e-sp-1-5);
        overflow-y: auto;
      }
      .e-notif-link { background: transparent; border: 0; padding: 0; font: inherit; color: var(--e-text); cursor: pointer; text-align: left; }
      .e-notif-link:hover { color: var(--e-brand-strong); text-decoration: underline; }
    `,
  ],
})
export class NotificationCenterComponent {
  readonly copy = copy;
  readonly formatDateTime = formatDateTime;
  readonly open = model(false);
  readonly filter = signal<'all' | 'unread'>('all');
  readonly service = inject(NotificationsService);
  private readonly router = inject(Router);

  readonly visible = computed(() => {
    const items = this.service.notifications();
    return this.filter() === 'unread' ? items.filter((n) => this.service.isUnread(n.id)) : items;
  });

  close(): void {
    this.open.set(false);
  }

  activate(deepLink: string): void {
    if (deepLink) void this.router.navigateByUrl(deepLink);
    this.open.set(false);
  }
}
