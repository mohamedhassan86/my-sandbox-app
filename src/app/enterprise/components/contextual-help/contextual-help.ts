import { Component, computed, inject, input, model } from '@angular/core';
import { FixtureService } from '../../services/fixture.service';

/**
 * Anchored contextual help: question glyph that reveals the help topic summary
 * for a location key (FR-042).
 */
@Component({
  selector: 'app-ent-contextual-help',
  standalone: true,
  template: `
    <span style="position: relative; display: inline-block">
      <button
        type="button"
        class="e-btn e-btn-icon e-btn-ghost"
        [attr.aria-label]="'Help: ' + (topic()?.title ?? locationKey())"
        [attr.aria-expanded]="open()"
        (click)="open.set(!open())"
      >
        <span aria-hidden="true">\u003F</span>
      </button>
      @if (open()) {
        <span class="e-help-pop" role="tooltip">
          <strong>{{ topic()?.title ?? locationKey() }}</strong>
          <span class="e-muted" style="display: block; margin-top: 4px">{{ topic()?.summary ?? 'No help topic is available for this area yet.' }}</span>
        </span>
      }
    </span>
  `,
  styles: [
    `
      .e-help-pop {
        position: absolute; left: 0; top: calc(100% + 6px);
        width: 260px; z-index: 130;
        background: var(--e-surface-raised); color: var(--e-text);
        border: 1px solid var(--e-stroke);
        border-radius: var(--e-radius-md);
        box-shadow: var(--e-shadow-2);
        padding: var(--e-sp-1-5);
        font-size: 13px;
      }
    `,
  ],
})
export class ContextualHelpComponent {
  readonly locationKey = input('home');
  readonly open = model(false);
  private readonly fixtures = inject(FixtureService);
  readonly topic = computed(() =>
    this.fixtures.fixtures()?.helpContent?.helpTopics.find((topic) => topic.locationKey === this.locationKey()),
  );
}
