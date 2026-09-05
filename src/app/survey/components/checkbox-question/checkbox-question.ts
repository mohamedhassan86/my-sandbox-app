import { Component, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { CheckboxQuestion } from '../../../core/models/survey.models';

@Component({
  selector: 'app-checkbox-question',
  standalone: true,
  template: `
    <fieldset class="question-fieldset">
      <legend class="form-label">{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      @for (option of question().options; track option.value) {
        <label class="form-check choice">
          <input class="form-check-input" type="checkbox" [checked]="value().includes(option.value)" (change)="toggle(option.value, $any($event.target).checked)" />
          <span class="form-check-label">{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
})
export class CheckboxQuestionComponent {
  readonly question = input.required<CheckboxQuestion>();
  readonly value = input<string[]>([]);
  readonly answerChange = output<Answer>();

  static isSelected(value: string[], option: string): boolean {
    return value.includes(option);
  }

  toggle(option: string, checked: boolean): void {
    const next = checked ? [...new Set([...this.value(), option])] : this.value().filter((value) => value !== option);
    this.answerChange.emit({ questionId: this.question().questionId, value: next });
  }
}
