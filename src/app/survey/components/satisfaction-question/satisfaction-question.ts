import { Component, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { SatisfactionQuestion } from '../../../core/models/survey.models';

@Component({
  selector: 'app-satisfaction-question',
  standalone: true,
  template: `
    <fieldset class="satisfaction-question">
      <legend class="form-label">{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      <div class="satisfaction-options">
        @for (option of question().options; track option.value) {
          <label class="satisfaction-option" [class.selected]="value() === option.value">
            <input type="radio" [name]="question().questionId" [value]="option.value" [checked]="value() === option.value" (change)="select(option.value)" />
            <span class="satisfaction-icon" aria-hidden="true">{{ option.icon ?? iconFor(option.value) }}</span>
            <span>{{ option.label }}</span>
          </label>
        }
      </div>
    </fieldset>
  `,
  styleUrl: './satisfaction-question.css',
})
export class SatisfactionQuestionComponent {
  readonly question = input.required<SatisfactionQuestion>();
  readonly value = input<string | null>(null);
  readonly answerChange = output<Answer>();

  static isSelected(value: string | null, option: string): boolean {
    return value === option;
  }

  select(value: string): void {
    this.answerChange.emit({ questionId: this.question().questionId, value });
  }

  iconFor(value: string): string {
    return SatisfactionQuestionComponent.iconForValue(value);
  }

  static iconForValue(value: string): string {
    if (value.includes('very-dissatisfied')) return '😞';
    if (value.includes('dissatisfied') || value.includes('unsatisfied')) return '🙁';
    if (value.includes('neutral')) return '😐';
    if (value.includes('very-satisfied')) return '😊';
    if (value.includes('satisfied')) return '🙂';
    return '😊';
  }
}
