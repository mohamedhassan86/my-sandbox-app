import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, type SelectChangeEvent } from 'primeng/select';
import type { Answer } from '../../../core/models/response.models';
import type { DropdownQuestion, Option } from '../../../core/models/survey.models';

@Component({
  selector: 'app-dropdown-question',
  standalone: true,
  imports: [FormsModule, Select],
  template: `
    <fieldset class="question-fieldset">
      <legend class="form-label">{{ question().label }} @if (question().required) { <span aria-hidden="true">*</span> }</legend>
      <p-select
        [options]="question().options"
        optionLabel="label"
        optionValue="value"
        [ariaLabel]="question().label"
        [ngModel]="value()"
        (onChange)="select($event.value)"
        (onClear)="clear()"
        [filter]="true"
        filterBy="label"
        filterMatchMode="contains"
        [showClear]="showClear()"
        emptyFilterMessage="No options match your search"
      />
    </fieldset>
  `,
})
export class DropdownQuestionComponent {
  readonly question = input.required<DropdownQuestion>();
  readonly value = input<string | null>(null);
  readonly answerChange = output<Answer>();

  readonly showClear = computed(() => DropdownQuestionComponent.isClearable(this.question().required));

  static isSelected(value: string | null | undefined, option: string): boolean {
    return value === option;
  }

  static labelForValue(options: Option[], value: string | null | undefined): string | null {
    return options.find((option) => option.value === value)?.label ?? null;
  }

  static isClearable(required: boolean): boolean {
    return !required;
  }

  static selectedAnswer(questionId: string, value: string): Answer {
    return { questionId, value };
  }

  static clearedAnswer(questionId: string): Answer {
    return { questionId, value: null };
  }

  select(value: SelectChangeEvent['value']): void {
    this.answerChange.emit(DropdownQuestionComponent.selectedAnswer(this.question().questionId, value));
  }

  clear(): void {
    this.answerChange.emit(DropdownQuestionComponent.clearedAnswer(this.question().questionId));
  }
}
