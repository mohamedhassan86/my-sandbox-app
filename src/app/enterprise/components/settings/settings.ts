import { Component, inject } from '@angular/core';
import { copy } from '../../copy/copy';
import { PreferencesService } from '../../services/preferences.service';
import type { Appearance, Density } from '../../models/state.models';

@Component({
  selector: 'app-ent-settings',
  standalone: true,
  template: `
    <section class="e-stack">
      <div role="group" aria-labelledby="appearance-label">
        <p class="e-label" id="appearance-label">{{ copy.settings.appearanceLabel }}</p>
        <div class="e-row" style="margin-top: 6px">
          @for (option of appearanceOptions; track option.value) {
            <button
              type="button"
              class="e-btn e-btn-sm"
              [class.e-btn-primary]="appearance() === option.value"
              [attr.aria-pressed]="appearance() === option.value"
              (click)="preferences.setAppearance(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </div>

      <label class="e-row" style="cursor: pointer">
        <input
          type="checkbox"
          [checked]="preferences.accessibilityMode()"
          (change)="preferences.setAccessibilityMode($any($event.target).checked)"
        />
        <span>
          <strong>{{ copy.settings.accessibilityLabel }}</strong>
          <span class="e-muted" style="display: block">{{ copy.settings.accessibilityBody }}</span>
        </span>
      </label>

      <div role="group" aria-labelledby="density-label">
        <p class="e-label" id="density-label">{{ copy.settings.densityLabel }}</p>
        <div class="e-row" style="margin-top: 6px">
          @for (option of densityOptions; track option.value) {
            <button
              type="button"
              class="e-btn e-btn-sm"
              [class.e-btn-primary]="preferences.tableDensity() === option.value"
              [attr.aria-pressed]="preferences.tableDensity() === option.value"
              (click)="preferences.setTableDensity(option.value)"
            >
              {{ option.label }}
            </button>
          }
        </div>
      </div>
    </section>
  `,
})
export class SettingsComponent {
  readonly copy = copy;
  readonly preferences = inject(PreferencesService);
  readonly appearance = this.preferences.appearance;
  readonly appearanceOptions: { value: Appearance; label: string }[] = [
    { value: 'light', label: copy.settings.light },
    { value: 'dark', label: copy.settings.dark },
    { value: 'system', label: copy.settings.system },
  ];
  readonly densityOptions: { value: Density; label: string }[] = [
    { value: 'comfortable', label: copy.settings.comfortable },
    { value: 'compact', label: copy.settings.compact },
  ];
}
