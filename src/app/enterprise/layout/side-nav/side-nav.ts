import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { copy } from '../../copy/copy';
import { FavoritesService } from '../../services/favorites.service';
import { NAV_AREAS } from './enterprise-nav';
import { PersistenceService, persistedKeys } from '../../services/persistence.service';
import type { NavState } from '../../models/state.models';

@Component({
  selector: 'app-ent-side-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <div class="e-nav-inner">
      <p class="e-nav-section-label">{{ copy.nav.favorites }}</p>
      @for (favorite of favorites(); track favorite.id) {
        <a class="e-nav-item" [routerLink]="favorite.targetRef" (click)="closeDrawer()">
          <span class="e-nav-icon" aria-hidden="true">\u2605</span>
          <span class="e-nav-label">{{ favorite.title }}</span>
        </a>
      } @empty {
        @if (!rail()) {
          <p class="e-nav-section-label e-muted">{{ copy.nav.favoritesEmpty }}</p>
        }
      }
      <p class="e-nav-section-label" style="margin-top: var(--e-sp-1)">Areas</p>
      @for (area of areas; track area.id) {
        <a
          class="e-nav-item"
          [routerLink]="area.route"
          routerLinkActive="active"
          [attr.aria-current]="activeArea() === area.id ? 'page' : null"
          (click)="closeDrawer()"
          [attr.aria-label]="area.label"
        >
          <span class="e-nav-icon" aria-hidden="true">{{ area.glyph }}</span>
          <span class="e-nav-label">{{ area.label }}</span>
        </a>
      }
    </div>
  `,
})
export class SideNavComponent {
  readonly copy = copy;
  readonly areas = NAV_AREAS;
  readonly rail = input(false);
  readonly drawerOpen = input(false);
  readonly activeArea = input<string | null>(null);
  readonly navigate = output<void>();
  private readonly favoritesService = inject(FavoritesService);
  private readonly persistence = inject(PersistenceService);

  readonly favorites = this.favoritesService.favorites;

  closeDrawer(): void {
    if (this.drawerOpen()) this.navigate.emit();
  }

  static toggleRail(state: NavState): NavState {
    return { railCollapsed: !state.railCollapsed };
  }

  static isActive(path: string, url: string): string | null {
    return url.startsWith(path) ? (path.split('/').pop() ?? null) : null;
  }

  persistRail(collapsed: boolean): void {
    this.persistence.write(persistedKeys().nav, { railCollapsed: collapsed } satisfies NavState);
  }
}
