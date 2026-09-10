import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Select, type SelectChangeEvent } from 'primeng/select';
import type { Answer } from '../../../core/models/response.models';
import type { DropdownQuestion, Option } from '../../../core/models/survey.models';
import { listViewportHeight, panelCeiling, shouldOpenAbove } from './dropdown-panel-placement';

@Component({
  selector: 'app-dropdown-question',
  standalone: true,
  imports: [FormsModule, Select],
  template: `
    <fieldset class="question-fieldset">
      <legend class="form-label">
        {{ question().label }}
        @if (question().required) {
          <span aria-hidden="true">*</span>
        }
      </legend>
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
        [scrollHeight]="listViewport()"
        [class.panel-above]="openAbove()"
        [style.--ds-select-available-height]="availablePanelHeightCss()"
        (onShow)="placePanel()"
        (onHide)="resetPanelPlacement()"
      />
    </fieldset>
  `,
})
export class DropdownQuestionComponent {
  readonly question = input.required<DropdownQuestion>();
  readonly value = input<string | null>(null);
  readonly answerChange = output<Answer>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly showClear = computed(() =>
    DropdownQuestionComponent.isClearable(this.question().required),
  );

  /**
   * Whether the open option panel is drawn above the field instead of below it.
   *
   * The panel is anchored to the field, so on a short viewport — or when the question sits
   * close to the bottom edge — the space below the field is smaller than the panel and the
   * list would run off the screen. The panel then opens upwards, which keeps the whole list
   * inside the viewport.
   */
  readonly openAbove = signal(false);

  /**
   * Panel height available on the chosen side of the field, in CSS pixels, or `null` when the
   * token ceiling already fits. It only ever lowers the ceiling, never raises it: the design
   * system owns the maximum height, the viewport only trims it.
   */
  readonly availablePanelHeight = signal<number | null>(null);

  readonly availablePanelHeightCss = computed(() => {
    const height = this.availablePanelHeight();
    return height === null ? null : `${height}px`;
  });

  /**
   * Viewport of the option list inside the panel.
   *
   * The size is owned by the design system (`--ds-select-list-max-height`), so the list
   * scrolls at the documented height instead of the library default; the value is a token
   * reference, never a literal, and the panel the list sits in is capped by
   * `--ds-select-panel-max-height`.
   */
  readonly listViewport = computed(() => DropdownQuestionComponent.listViewportHeight());

  static isSelected(value: string | null | undefined, option: string): boolean {
    return value === option;
  }

  static labelForValue(options: Option[], value: string | null | undefined): string | null {
    return options.find((option) => option.value === value)?.label ?? null;
  }

  static isClearable(required: boolean): boolean {
    return !required;
  }

  /** Pure function: token reference driving the option-list viewport height. */
  static listViewportHeight(): string {
    return listViewportHeight();
  }

  /**
   * Pure function: decides the opening direction for an option panel. The rule lives in
   * `dropdown-panel-placement.ts` so it can be tested without a browser.
   */
  static shouldOpenAbove(
    field: { top: number; bottom: number },
    panelHeight: number,
    viewportHeight: number,
  ): boolean {
    return shouldOpenAbove(field, panelHeight, viewportHeight);
  }

  /**
   * Pure function: the height the panel may use on the chosen side, or `null` when the
   * design-system ceiling already fits. See `dropdown-panel-placement.ts`.
   */
  static panelCeiling(
    field: { top: number; bottom: number },
    panelHeight: number,
    viewportHeight: number,
    openAbove: boolean,
  ): number | null {
    return panelCeiling(field, panelHeight, viewportHeight, openAbove);
  }

  static selectedAnswer(questionId: string, value: string): Answer {
    return { questionId, value };
  }

  static clearedAnswer(questionId: string): Answer {
    return { questionId, value: null };
  }

  /** Measures the freshly opened panel against the field and the viewport. */
  placePanel(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const field = this.host.nativeElement.querySelector('.p-select')?.getBoundingClientRect();
    const panel = this.host.nativeElement
      .querySelector('.p-select-overlay')
      ?.getBoundingClientRect();
    if (!field || !panel) {
      return;
    }
    const rect = { top: field.top, bottom: field.bottom };
    const openAbove = shouldOpenAbove(rect, panel.height, window.innerHeight);
    this.openAbove.set(openAbove);
    this.availablePanelHeight.set(panelCeiling(rect, panel.height, window.innerHeight, openAbove));
  }

  resetPanelPlacement(): void {
    this.openAbove.set(false);
    this.availablePanelHeight.set(null);
  }

  select(value: SelectChangeEvent['value']): void {
    this.answerChange.emit(
      DropdownQuestionComponent.selectedAnswer(this.question().questionId, value),
    );
  }

  clear(): void {
    this.answerChange.emit(DropdownQuestionComponent.clearedAnswer(this.question().questionId));
  }
}
