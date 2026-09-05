import { Component, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { RadioQuestion } from '../../../core/models/survey.models';

@Component({
  selector: 'app-radio-question',
  standalone: true,
  template: `
    <fieldset class="question-fieldset">
      <legend class="form-label">{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      @for (option of question().options; track option.value) {
        <label class="form-check choice">
          <input class="form-check-input" type="radio" [name]="question().questionId" [value]="option.value" [checked]="value() === option.value" (change)="select(option.value)" />
          <span class="form-check-label">{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
})
export class RadioQuestionComponent {
  readonly question = input.required<RadioQuestion>();
  readonly value = input<string | null>(null);
  readonly answerChange = output<Answer>();

  static isSelected(value: string | null, option: string): boolean {
    return value === option;
  }

  select(value: string): void {
    this.answerChange.emit({ questionId: this.question().questionId, value });
  }
}
