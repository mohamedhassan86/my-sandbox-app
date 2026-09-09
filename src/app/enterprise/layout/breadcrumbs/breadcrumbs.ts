import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_AREAS } from '../side-nav/enterprise-nav';

export interface Crumb {
  label: string;
  route?: string;
  current: boolean;
}

/** Builds a breadcrumb trail from the current URL path (FR-009). */
export function crumbsFor(url: string): Crumb[] {
  const clean = url.split('?')[0].split('#')[0];
  const parts = clean.replace(/^\/enterprise\/?/, '').split('/').filter(Boolean);
  const trail: Crumb[] = [{ label: NAV_AREAS[0].label, route: '/enterprise/home', current: parts.length === 0 }];
  if (parts.length === 0) return trail;

  const area = NAV_AREAS.find((a) => a.id === parts[0]);
  const areaRoute = area?.route ?? '/enterprise/home';
  const areaLabel = area?.label ?? parts[0];
  trail.push({ label: areaLabel, route: parts.length > 1 ? areaRoute : undefined, current: parts.length === 1 && parts[0] !== 'surveys' });

  if (parts.length > 1) {
    const label = parts[1] === 'launch' ? 'Launch a survey' : parts[1];
    trail.push({ label: `${areaLabel} \u00B7 ${label}`, route: undefined, current: true });
  }
  return trail;
}

@Component({
  selector: 'app-ent-breadcrumbs',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="e-breadcrumbs" aria-label="Breadcrumb">
      @for (crumb of trail(); track $index) {
        @if (!$first) {
          <span class="sep" aria-hidden="true">/</span>
        }
        @if (crumb.route) {
          <a [routerLink]="crumb.route">{{ crumb.label }}</a>
        } @else {
          <span [attr.aria-current]="crumb.current ? 'page' : null">{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
})
export class BreadcrumbsComponent {
  readonly url = input('');
  readonly trail = computed(() => crumbsFor(this.url()));
}
