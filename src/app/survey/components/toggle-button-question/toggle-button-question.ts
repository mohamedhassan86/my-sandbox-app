import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButton, type ToggleButtonChangeEvent } from 'primeng/togglebutton';
import type { Answer } from '../../../core/models/response.models';
import type { ToggleButtonQuestion } from '../../../core/models/survey.models';

@Component({
  selector: 'app-toggle-button-question',
  standalone: true,
  imports: [FormsModule, ToggleButton],
  template: `
    <fieldset class="question-fieldset">
      <legend class="form-label">{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      @if (question().description) { <p class="form-text">{{ question().description }}</p> }
      <p-togglebutton
        [onLabel]="onLabel()"
        [offLabel]="offLabel()"
        [ariaLabel]="question().label"
        [ngModel]="checked()"
        (onChange)="toggle($event.checked)"
      />
    </fieldset>
  `,
})
export class ToggleButtonQuestionComponent {
  readonly question = input.required<ToggleButtonQuestion>();
  readonly value = input<boolean | null>(null);
  readonly answerChange = output<Answer>();

  readonly checked = computed(() => ToggleButtonQuestionComponent.isChecked(this.value(), this.question().defaultValue));

  readonly onLabel = computed(() => this.question().options?.onLabel ?? 'On');
  readonly offLabel = computed(() => this.question().options?.offLabel ?? 'Off');

  static isChecked(value: boolean | null | undefined, defaultValue: boolean | undefined): boolean {
    return value ?? defaultValue ?? false;
  }

  static labelFor(checked: boolean, options: { onLabel?: string; offLabel?: string } | undefined): string {
    return checked ? (options?.onLabel ?? 'On') : (options?.offLabel ?? 'Off');
  }

  toggle(checked: ToggleButtonChangeEvent['checked']): void {
    this.answerChange.emit({ questionId: this.question().questionId, value: checked });
  }
}
