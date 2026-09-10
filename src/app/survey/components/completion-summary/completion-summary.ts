import { Component, input, output } from '@angular/core';
import type { CompletionTile } from '../../presenters/completion-tiles';

@Component({
  selector: 'app-completion-summary',
  standalone: true,
  template: `
    <section class="completion-summary" aria-labelledby="completion-title" role="status">
      <div class="medallion" aria-hidden="true"><span class="medallion-check"></span></div>
      <p class="completion-eyebrow">Survey complete</p>
      <h2 id="completion-title">{{ message() }}</h2>
      <p class="completion-percentage">{{ percentage() }}% complete</p>
      @if (tiles().length > 0) {
        <div class="summary-panel">
          <h3 class="summary-heading">
            <span class="summary-glyph" aria-hidden="true"></span>Submission summary
          </h3>
          <ul class="summary-tiles">
            @for (tile of tiles(); track tile.label) {
              <li class="summary-tile">
                <span class="tile-label">{{ tile.label }}</span>
                <span class="tile-value">{{ tile.value }}</span>
              </li>
            }
          </ul>
        </div>
      }
      <div class="completion-actions">
        <button type="button" class="btn-new" (click)="newResponse.emit()">
          Start new response
        </button>
      </div>
    </section>
  `,
  styleUrl: './completion-summary.css',
})
export class CompletionSummaryComponent {
  readonly percentage = input.required<number>();
  readonly message = input('Thank you. Your response was submitted successfully.');
  readonly tiles = input<CompletionTile[]>([]);
  readonly newResponse = output<void>();
}
