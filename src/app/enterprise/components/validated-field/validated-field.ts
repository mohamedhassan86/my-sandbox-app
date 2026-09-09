import { Component, input, output } from '@angular/core';
import type { FieldSpec, FieldOption } from '../../models/state.models';
import type { FieldValue } from '../../models/state.models';

/**
 * Label + control + adjacent inline message wrapper (FR-031). Wires
 * aria-invalid and aria-describedby; message clears when the value becomes valid.
 */
@Component({
  selector: 'app-ent-validated-field',
  standalone: true,
  template: `
    <div class="e-field" [class.e-field-error]="error()">
      <label class="e-label" [attr.for]="inputId">
        {{ field().label }} @if (field().required) { <span class="e-required" aria-hidden="true">*</span> }
      </label>

      @switch (field().kind) {
        @case ('select') {
          <select
            class="e-input"
            [id]="inputId"
            [value]="stringValue()"
            (change)="emitChange($any($event.target).value)"
            [attr.aria-invalid]="error() ? 'true' : null"
            [attr.aria-describedby]="error() ? errorId : null"
          >
            <option value="" disabled>{{ field().placeholder ?? 'Select\u2026' }}</option>
            @for (option of options(); track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
        }
        @case ('multiselect') {
          <div class="e-option-grid" role="group" [attr.aria-describedby]="error() ? errorId : null">
            @for (option of options(); track option.value) {
              <label class="e-chip" style="cursor: pointer">
                <input
                  type="checkbox"
                  [checked]="includes(option.value)"
                  (change)="toggleOption(option.value)"
                  style="accent-color: var(--e-brand)"
                />
                {{ option.label }}
              </label>
            }
          </div>
        }
        @case ('toggle') {
          <label class="e-row" style="gap: var(--e-sp-1); cursor: pointer">
            <input
              type="checkbox"
              [checked]="booleanValue()"
              (change)="emitChange($any($event.target).checked)"
              [attr.aria-invalid]="error() ? 'true' : null"
              style="accent-color: var(--e-brand)"
            />
            <span class="e-muted">On</span>
          </label>
        }
        @case ('textarea') {
          <textarea
            class="e-input"
            [id]="inputId"
            [value]="stringValue()"
            (input)="emitChange($any($event.target).value)"
            rows="3"
            [attr.aria-invalid]="error() ? 'true' : null"
            [attr.aria-describedby]="error() ? errorId : null"
          ></textarea>
        }
        @default {
          <input
            class="e-input"
            [id]="inputId"
            [type]="inputType()"
            [value]="stringValue()"
            [placeholder]="field().placeholder"
            (input)="emitChange($any($event.target).value)"
            [attr.aria-invalid]="error() ? 'true' : null"
            [attr.aria-describedby]="error() ? errorId : null"
          />
        }
      }

      @if (error()) {
        <p class="e-field-error-msg" [id]="errorId" role="alert">{{ error() }}</p>
      } @else if (field().helpText) {
        <p class="e-muted e-help" [id]="helpId">{{ field().helpText }}</p>
      }
    </div>
  `,
  styles: [
    `
      .e-field { display: flex; flex-direction: column; gap: 6px; }
      .e-option-grid { display: flex; flex-wrap: wrap; gap: 6px; }
      .e-required { color: var(--e-error); }
      .e-field-error-msg { color: var(--e-error); font-size: 12px; margin: 0; }
      .e-help { font-size: 12px; margin: 0; }
      .e-field:has(input[aria-invalid='true']),
      .e-field:has(select[aria-invalid='true']) { }
    `,
  ],
})
export class ValidatedFieldComponent {
  readonly field = input.required<FieldSpec>();
  readonly value = input<FieldValue>(null);
  readonly error = input<string | null>(null);
  readonly inputId = `e-field-${Math.random().toString(36).slice(2, 8)}`;
  readonly valueChange = output<FieldValue>();
  readonly helpId = `${this.inputId}-help`;
  readonly errorId = `${this.inputId}-error`;

  options(): FieldOption[] {
    return this.field().options ?? [];
  }

  stringValue(): string {
    const value = this.value();
    if (value == null) return '';
    if (Array.isArray(value)) return '';
    return String(value);
  }

  booleanValue(): boolean {
    return this.value() === true;
  }

  inputType(): string {
    const kind = this.field().kind;
    if (kind === 'email') return 'email';
    if (kind === 'number') return 'number';
    if (kind === 'date') return 'date';
    return 'text';
  }

  includes(optionValue: string): boolean {
    const value = this.value();
    return Array.isArray(value) && value.includes(optionValue);
  }

  toggleOption(optionValue: string): void {
    const current = Array.isArray(this.value()) ? [...(this.value() as string[])] : [];
    const next = current.includes(optionValue) ? current.filter((v) => v !== optionValue) : [...current, optionValue];
    this.valueChange.emit(next);
  }

  emitChange(value: FieldValue): void {
    this.valueChange.emit(value);
  }
}
