import { Component, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { RadioQuestion } from '../../../core/models/survey.models';

@Component({
  selector: 'app-radio-question',
  standalone: true,
  template: `
    <fieldset>
      <legend>{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      @for (option of question().options; track option.value) {
        <label class="choice">
          <input type="radio" [name]="question().questionId" [value]="option.value" [checked]="value() === option.value" (change)="select(option.value)" />
          <span>{{ option.label }}</span>
        </label>
      }
    </fieldset>
  `,
})
export class RadioQuestionComponent {
  readonly question = input.required<RadioQuestion>();
  readonly value = input<string | null>(null);
  readonly answerChange = output<Answer>();

  select(value: string): void {
    this.answerChange.emit({ questionId: this.question().questionId, value });
  }
}
