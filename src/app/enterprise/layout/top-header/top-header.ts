import { Component, inject, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { copy } from '../../copy/copy';
import { NotificationsService } from '../../services/notifications.service';
import { ProfileMenuComponent } from '../../components/profile-menu/profile-menu';

@Component({
  selector: 'app-ent-top-header',
  standalone: true,
  imports: [RouterLink, ProfileMenuComponent],
  template: `
    <button type="button" class="e-btn e-btn-icon e-menu-btn" [attr.aria-label]="copy.nav.toggleNav" (click)="menu.emit()">
      <span aria-hidden="true">\u2630</span>
    </button>
    <a class="e-brand" [routerLink]="'/enterprise/home'">
      <span class="e-brand-mark" aria-hidden="true">SH</span>
      <span>{{ copy.brand.name }}</span>
    </a>
    <button type="button" class="e-header-search" (click)="search.emit()">
      <span aria-hidden="true">\u2315</span>
      <span class="e-search-text">{{ copy.header.searchPlaceholder }}</span>
      <kbd>{{ copy.header.searchShortcut }}</kbd>
    </button>
    <span class="e-header-spacer"></span>
    <div class="e-header-actions">
      <button type="button" class="e-btn e-btn-icon e-notif-btn" [attr.aria-label]="copy.header.notifications" (click)="notifications.emit()">
        <span aria-hidden="true">\uD83D\uDD14</span>
        @if (unreadCount() > 0) {
          <span class="e-bell-count" [attr.aria-label]="unreadCount() + ' unread notifications'">{{ unreadCount() }}</span>
        }
      </button>
      <app-ent-profile-menu />
    </div>
  `,
  styles: [
    `
      .e-notif-btn { position: relative; }
      .e-bell-count {
        position: absolute; top: 0; right: 0;
        min-width: 16px; height: 16px;
        border-radius: 999px;
        background: var(--e-error);
        color: #fff;
        font-size: 10px; font-weight: 700;
        display: grid; place-items: center;
        padding: 0 4px;
      }
      .e-menu-btn { display: none; }
      @media (max-width: 767px) {
        .e-menu-btn { display: inline-flex; }
        .e-brand span:last-child { display: none; }
      }
    `,
  ],
  host: { class: 'e-top-header' },
})
export class TopHeaderComponent {
  readonly copy = copy;
  readonly menu = output();
  readonly search = output();
  readonly notifications = output();
  private readonly notificationsService = inject(NotificationsService);
  readonly unreadCount = this.notificationsService.unreadCount;
}
