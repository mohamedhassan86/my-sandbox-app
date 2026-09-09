import { Component, input, model, output } from '@angular/core';
import { copy } from '../../copy/copy';
import { interpolate } from '../../copy/copy';

export interface ConfirmRequest {
  title: string;
  body: string;
  confirmLabel: string;
  destructive: boolean;
  /** When set, the user must type this word to enable the confirm button. */
  typedWord?: string;
}

/**
 * Accessible confirm dialog (native overlay, cancel-focused by default;
 * destructive variant; optional typed confirmation for demo-data reset).
 */
@Component({
  selector: 'app-ent-confirm-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="e-confirm-backdrop" (click)="cancel()">
        <div
          class="e-confirm"
          role="dialog"
          aria-modal="true"
          [attr.aria-labelledby]="titleId"
          (click)="$event.stopPropagation()"
        >
          <h3 [id]="titleId">{{ request().title }}</h3>
          <p class="e-muted">{{ request().body }}</p>
          @if (request().typedWord) {
            <input
              class="e-input"
              type="text"
              [placeholder]="interpolate(copy.profile.resetTypedWord, {})"
              (input)="typed.set($any($event.target).value)"
              style="max-width: 180px"
            />
          }
          <div class="e-row" style="justify-content: flex-end; margin-top: var(--e-sp-2)">
            <button type="button" class="e-btn" (click)="cancel()" autofocus>{{ copy.dialog.cancel }}</button>
            <button
              type="button"
              class="e-btn"
              [class.e-btn-danger]="request().destructive"
              (click)="confirm()"
              [disabled]="request().typedWord ? typed() !== request().typedWord : false"
            >
              {{ request().confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .e-confirm-backdrop {
        position: fixed; inset: 0; z-index: 500;
        background: rgb(0 0 0 / 45%);
        display: grid; place-items: center;
        padding: var(--e-sp-2);
      }
      .e-confirm {
        background: var(--e-surface-raised);
        color: var(--e-text);
        border-radius: var(--e-radius-lg);
        box-shadow: var(--e-shadow-2);
        padding: var(--e-sp-3);
        max-width: 420px; width: 100%;
        display: flex; flex-direction: column; gap: var(--e-sp-1);
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  readonly copy = copy;
  readonly interpolate = interpolate;
  readonly request = input.required<ConfirmRequest>();
  readonly open = model(false);
  readonly confirmed = output<boolean>();
  readonly titleId = `confirm-title-${Math.random().toString(36).slice(2, 7)}`;
  readonly typed = model('');

  cancel(): void {
    this.open.set(false);
    this.typed.set('');
  }

  confirm(): void {
    this.confirmed.emit(true);
    this.cancel();
  }
}
