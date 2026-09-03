import { Component, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { TextareaQuestion, TextboxQuestion } from '../../../core/models/survey.models';

type TextQuestion = TextboxQuestion | TextareaQuestion;

@Component({
  selector: 'app-text-question',
  standalone: true,
  template: `
    <label class="text-question">
      <span>{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</span>
      @if (question().type === 'textarea') {
        <textarea [value]="value()" [attr.maxlength]="question().maxLength ?? null" (input)="update($any($event.target).value)"></textarea>
      } @else {
        <input type="text" [value]="value()" [attr.maxlength]="question().maxLength ?? null" (input)="update($any($event.target).value)" />
      }
    </label>
  `,
})
export class TextQuestionComponent {
  readonly question = input.required<TextQuestion>();
  readonly value = input('');
  readonly answerChange = output<Answer>();

  update(value: string): void {
    this.answerChange.emit({ questionId: this.question().questionId, value });
  }
}
