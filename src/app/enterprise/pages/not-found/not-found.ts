import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { copy } from '../../copy/copy';
import { ActivityService } from '../../services/activity.service';

@Component({
  selector: 'app-ent-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="e-state" style="padding-top: var(--e-sp-6)">
      <span class="e-state-glyph" aria-hidden="true">404</span>
      <h1 style="font-size: 20px">{{ copy.states.notFoundTitle }}</h1>
      <p>{{ copy.states.notFoundBody }}</p>
      <a class="e-btn e-btn-primary" routerLink="/enterprise/home" (click)="track()">{{ copy.states.backHome }}</a>
    </div>
  `,
})
export class NotFoundPageComponent {
  readonly copy = copy;
  private readonly activity = inject(ActivityService);
  track(): void {
    this.activity.record('page', '/enterprise/home', 'Returned home from a missing page');
  }
}
