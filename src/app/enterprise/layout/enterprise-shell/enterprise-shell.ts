import { Component, computed, inject, OnInit, OnDestroy, signal, viewChild } from '@angular/core';
import { Router, RouterOutlet, EventType } from '@angular/router';
import { copy } from '../../copy/copy';
import { FixtureService } from '../../services/fixture.service';
import { NotificationsService } from '../../services/notifications.service';
import { ActivityService } from '../../services/activity.service';
import { SearchService } from '../../services/search.service';
import { KeyboardService } from '../../services/keyboard.service';
import { PreferencesService } from '../../services/preferences.service';
import { PersistenceService, persistedKeys } from '../../services/persistence.service';
import { ThemeService } from '../../tokens/theme.service';
import type { NavState } from '../../models/state.models';
import { NAV_AREAS } from '../side-nav/enterprise-nav';
import { SideNavComponent } from '../side-nav/side-nav';
import { TopHeaderComponent } from '../top-header/top-header';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs';
import { ToastHostComponent } from '../../components/toast-host/toast-host';
import { GlobalSearchComponent } from '../../components/global-search/global-search';
import { NotificationCenterComponent } from '../../components/notification-center/notification-center';
import { OnboardingTourComponent } from '../../components/onboarding-tour/onboarding-tour';
import { ErrorStateComponent, SkeletonRowsComponent } from '../../components/state-views/state-views';

@Component({
  selector: 'app-enterprise-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    SideNavComponent,
    TopHeaderComponent,
    BreadcrumbsComponent,
    ToastHostComponent,
    GlobalSearchComponent,
    NotificationCenterComponent,
    OnboardingTourComponent,
    ErrorStateComponent,
    SkeletonRowsComponent,
  ],
  template: `
    <div class="e-app">
      <app-ent-top-header
        (menu)="navOpen.set(!navOpen())"
        (search)="openGlobalSearch()"
        (notifications)="notificationOpen.set(true)"
      />

      <nav
        class="e-nav"
        [class.e-rail]="!mobile() && rail()"
        [class.e-open]="mobile() && navOpen()"
        aria-label="Main"
      >
        <div class="e-rail-toggle-row">
          @if (!mobile()) {
            <button
              type="button"
              class="e-btn e-btn-ghost e-btn-sm"
              [attr.aria-label]="rail() ? copy.nav.expand : copy.nav.collapse"
              (click)="toggleRail()"
            >
              <span aria-hidden="true">{{ rail() ? '\u25B8' : '\u25C2' }}</span>
              <span class="e-nav-label">{{ rail() ? copy.nav.expand : copy.nav.collapse }}</span>
            </button>
          }
        </div>
        <app-ent-side-nav
          [rail]="!mobile() && rail()"
          [drawerOpen]="mobile() && navOpen()"
          [activeArea]="activeArea()"
          (navigate)="navOpen.set(false)"
        />
      </nav>

      <main class="e-main" id="enterprise-main" tabindex="-1">
        <div class="e-main-inner">
          @if (error()) {
            <app-ent-error-state [title]="'Enterprise demo could not load'" [message]="error()!" (retry)="load()" />
          } @else if (loading()) {
            <app-ent-skeleton-rows [rowCount]="7" />
          } @else {
            @if (!mobile()) {
              <app-ent-breadcrumbs [url]="url()" />
            }
            <router-outlet />
          }
        </div>
      </main>
    </div>

    <app-ent-global-search />
    <app-ent-notification-center [(open)]="notificationOpen" />
    <app-ent-toast-host />
    <app-ent-onboarding-tour />
  `,
  styles: [
    `
      .e-rail-toggle-row { padding: var(--e-sp-1); border-bottom: 1px solid var(--e-stroke); }
      .e-rail-toggle-row .e-btn { width: 100%; justify-content: flex-start; }
      .e-nav.e-rail .e-rail-toggle-row .e-btn { justify-content: center; }
      .e-nav.e-rail .e-rail-toggle-row .e-nav-label { display: none; }
    `,
  ],
})
export class EnterpriseShellComponent implements OnInit, OnDestroy {
  readonly copy = copy;
  readonly error = signal<string | null>(null);
  readonly loading = computed(() => this.fixtureService.loading());
  readonly navOpen = signal(false);
  readonly url = signal('');
  readonly activeArea = signal<string | null>(null);
  readonly notificationOpen = signal(false);
  readonly rail = signal(false);
  readonly mobile = signal(typeof window !== 'undefined' ? window.innerWidth < 768 : false);

  readonly search = viewChild.required(GlobalSearchComponent);
  readonly tour = viewChild.required(OnboardingTourComponent);

  private readonly fixtureService = inject(FixtureService);
  private readonly notifications = inject(NotificationsService);
  private readonly activity = inject(ActivityService);
  private readonly searchService = inject(SearchService);
  private readonly keyboard = inject(KeyboardService);
  private readonly preferences = inject(PreferencesService);
  private readonly persistence = inject(PersistenceService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private mediaQuery: MediaQueryList | null = null;

  ngOnInit(): void {
    this.theme.apply();
    const saved = this.persistence.read<NavState>(persistedKeys().nav, { railCollapsed: false });
    this.rail.set(saved.railCollapsed);
    this.syncRoute();
    this.router.events.subscribe((event) => {
      if (event.type === EventType.NavigationEnd) this.syncRoute();
    });
    if (typeof window !== 'undefined') {
      this.mediaQuery = window.matchMedia('(max-width: 767px)');
      this.mobile.set(this.mediaQuery.matches);
      this.mediaQuery.addEventListener('change', (event) => {
        this.mobile.set(event.matches);
        if (!event.matches) this.navOpen.set(false);
      });
    }
    this.registerShortcuts();
    void this.load();
  }

  ngOnDestroy(): void {
    this.notifications.stopScheduler();
    this.keyboard.stop();
    this.theme.clear();
  }

  async load(): Promise<void> {
    try {
      const fixtures = await this.fixtureService.load();
      this.notifications.seed(fixtures.notifications);
      this.notifications.startScheduler();
      this.activity.seed(fixtures.activity);
      const pages = NAV_AREAS.map((area) => ({ id: area.id, title: area.label, subtitle: 'Enterprise page', target: area.route }));
      this.searchService.seed(pages, { surveys: fixtures.surveys, responses: fixtures.responses, participants: fixtures.participants });
      this.keyboard.indexShortcuts(fixtures.shortcuts);
      const onboarding = this.persistence.read<{ completed: boolean }>(persistedKeys().onboarding, { completed: false });
      if (!onboarding.completed) {
        setTimeout(() => this.tour().show(), 600);
      }
    } catch {
      this.error.set('Could not load the enterprise demo content. Check the console and retry.');
    }
  }

  private syncRoute(): void {
    const current = this.router.url;
    this.url.set(current);
    const area = NAV_AREAS.find((a) => current.startsWith(a.route)) ?? NAV_AREAS[0];
    this.activeArea.set(area.id);
  }

  toggleRail(): void {
    const next = !this.rail();
    this.rail.set(next);
    this.persistence.write(persistedKeys().nav, { railCollapsed: next } satisfies NavState);
  }

  openGlobalSearch(): void {
    this.search().openDialog();
  }

  private registerShortcuts(): void {
    this.keyboard.register('open-search', () => this.search().openDialog());
    this.keyboard.register('open-notifications', () => this.notificationOpen.set(true));
    this.keyboard.register('toggle-dark', () => this.preferences.setAppearance(this.preferences.appearance() === 'dark' ? 'light' : 'dark'));
    this.keyboard.register('toggle-a11y', () => this.preferences.toggleAccessibilityMode());
    this.keyboard.register('open-help', () => this.router.navigateByUrl('/enterprise/help'));
    this.keyboard.register('go-home', () => this.router.navigateByUrl('/enterprise/home'));
    this.keyboard.register('next-area', () => this.stepArea(1));
    this.keyboard.register('prev-area', () => this.stepArea(-1));
    this.keyboard.start();
  }

  private stepArea(direction: 1 | -1): void {
    const index = NAV_AREAS.findIndex((area) => area.id === this.activeArea());
    const next = NAV_AREAS[(index + direction + NAV_AREAS.length) % NAV_AREAS.length];
    this.router.navigateByUrl(next.route);
  }
}
