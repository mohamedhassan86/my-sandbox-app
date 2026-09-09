import { Component, input, output } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { copy } from '../../copy/copy';

/** Skeleton rows that mirror a table/list while content loads (FR-039). */
@Component({
  selector: 'app-ent-skeleton-rows',
  standalone: true,
  imports: [Skeleton],
  template: `
    <div class="e-skeleton-row" [attr.aria-label]="copy.states.loading" role="status">
      @for (row of rows(); track $index) {
        <p-skeleton width="100%" [height]="'2rem'" [style]="{ borderRadius: '8px' }" />
      }
    </div>
  `,
})
export class SkeletonRowsComponent {
  readonly copy = copy;
  readonly rowCount = input(5);

  rows(): number[] {
    return Array.from({ length: Math.max(0, this.rowCount()) }, (_, index) => index);
  }
}

/** Smart empty state: glyph + headline + explanation + next action (FR-040). */
@Component({
  selector: 'app-ent-empty-state',
  standalone: true,
  template: `
    <div class="e-state">
      <span class="e-state-glyph" aria-hidden="true">{{ glyph() }}</span>
      <h3>{{ title() }}</h3>
      <p>{{ body() }}</p>
      @if (actionLabel()) {
        <button type="button" class="e-btn e-btn-primary e-btn-sm" (click)="action.emit()">{{ actionLabel() }}</button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  readonly glyph = input('\u2726');
  readonly title = input('Nothing here yet');
  readonly body = input('');
  readonly actionLabel = input('');
  readonly action = output();
}

/** Region-level error state with Retry (FR-039/FR-040). */
@Component({
  selector: 'app-ent-error-state',
  standalone: true,
  template: `
    <div class="e-state e-state-box" role="alert">
      <span class="e-state-glyph" aria-hidden="true">!</span>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      <button type="button" class="e-btn e-btn-primary e-btn-sm" (click)="retry.emit()">{{ copy.states.retry }}</button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly copy = copy;
  readonly title = input('Something went wrong');
  readonly message = input('');
  readonly retry = output();
}
