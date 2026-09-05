import { Component, computed, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { RatingQuestion } from '../../../core/models/survey.models';

@Component({
  selector: 'app-rating-question',
  standalone: true,
  template: `
    <fieldset class="rating-question">
      <legend class="form-label">{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      <div class="rating-labels" aria-hidden="true">
        <span>{{ question().leftLabel ?? 'Not at all' }}</span>
        <span>{{ question().rightLabel ?? 'Extremely' }}</span>
      </div>
      <div class="rating-options" role="radiogroup" [attr.aria-label]="question().label">
        @for (rating of ratings(); track rating) {
          <button
            type="button"
            class="rating-option"
            [class.selected]="value() === rating.toString()"
            [attr.aria-checked]="value() === rating.toString()"
            role="radio"
            (click)="select(rating)"
            (keydown)="handleKeydown($event, rating)"
          >{{ rating }}</button>
        }
      </div>
    </fieldset>
  `,
  styleUrl: './rating-question.css',
})
export class RatingQuestionComponent {
  readonly question = input.required<RatingQuestion>();
  readonly value = input<string | null>(null);
  readonly answerChange = output<Answer>();

  static isSelected(value: string | null, rating: number): boolean {
    return value === rating.toString();
  }

  readonly ratings = computed(() => RatingQuestionComponent.ratingsFor(this.question()));

  static ratingsFor(question: RatingQuestion): number[] {
    const min = question.minValue ?? 1;
    const max = question.maxValue ?? 10;
    const step = question.step ?? 1;
    return Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, index) => min + index * step);
  }

  select(value: number): void {
    this.answerChange.emit({ questionId: this.question().questionId, value: String(value) });
  }

  handleKeydown(event: KeyboardEvent, current: number): void {
    const index = this.ratings().indexOf(current);
    const nextIndex = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? index + 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? index - 1 : -1;
    if (nextIndex >= 0 && nextIndex < this.ratings().length) {
      event.preventDefault();
      this.select(this.ratings()[nextIndex]);
    }
  }
}
