import { Component, computed, inject, signal } from '@angular/core';
import { copy, interpolate } from '../../copy/copy';
import { LAUNCH_TASK, defaultLaunchDate } from './launch-task';
import type { TaskStep, FieldSpec, FieldValue } from '../../models/state.models';
import { DraftsService } from '../../services/drafts.service';
import { SimulationService } from '../../services/simulation.service';
import { ToastService } from '../../services/toast.service';
import { ActivityService } from '../../services/activity.service';
import { ValidatedFieldComponent } from '../../components/validated-field/validated-field';

interface StepValues {
  [fieldKey: string]: FieldValue;
}

const DEFAULT_DRAFT_VALUES: StepValues = {
  audience: 'customers',
  region: 'global',
  closeAfterDays: 14,
  anonymous: true,
  reminderDays: ['2', '5'],
  notifyOwner: true,
};

function buildErrors(step: TaskStep, values: StepValues): Partial<Record<string, string>> {
  const errors: Partial<Record<string, string>> = {};
  for (const field of step.fields) {
    const value = values[field.key];
    if (field.required && (value == null || value === '' || (Array.isArray(value) && value.length === 0))) {
      errors[field.key] = 'This field is required.';
      continue;
    }
    if (field.kind === 'email' && typeof value === 'string' && value.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.key] = 'Enter a valid email address.';
    }
    if (field.kind === 'number' && typeof value === 'number') {
      if (field.min != null && value < field.min) errors[field.key] = `Enter a value of at least ${field.min}.`;
      if (field.max != null && value > field.max) errors[field.key] = `Enter a value of at most ${field.max}.`;
    }
  }
  return errors;
}

function stepHasError(errors: Partial<Record<string, string>>): boolean {
  return Object.keys(errors).length > 0;
}

@Component({
  selector: 'app-ent-launch-survey',
  standalone: true,
  imports: [ValidatedFieldComponent],
  template: `
    <div class="e-command-bar">
      <h1 class="e-page-title">{{ copy.task.launchTitle }}</h1>
      <span class="e-pill e-pill-active">Guided task</span>
    </div>

    @if (done()) {
      <section class="e-card e-state" style="text-align: center; max-width: 560px; margin: var(--e-sp-6) auto">
        <span class="e-state-glyph" aria-hidden="true">\u2713</span>
        <h2 style="font-size: 20px">{{ copy.task.successTitle }}</h2>
        <p class="e-muted">{{ copy.task.successBody }}</p>
        <p class="e-muted">{{ summary() }}</p>
        <div class="e-row" style="justify-content: center; margin-top: var(--e-sp-2)">
          <button type="button" class="e-btn e-btn-primary" (click)="restart()">{{ copy.task.draftSaved }}</button>
        </div>
      </section>
    } @else {
      <nav class="e-stepper" aria-label="Launch survey progress">
        @for (step of steps; track step.id; let i = $index) {
          <button
            type="button"
            class="e-step"
            [class.e-step-current]="currentIndex() === i"
            [class.e-step-done]="i < currentIndex()"
            (click)="jumpTo(i)"
            [attr.aria-current]="currentIndex() === i ? 'step' : null"
          >
            <span class="e-step-num" aria-hidden="true">{{ i < currentIndex() ? '\u2713' : i + 1 }}</span>
            <span>{{ step.title }}</span>
          </button>
        }
      </nav>

      <div class="e-card" style="max-width: 720px">
        <h2 class="e-label" style="font-size: 16px; text-transform: none">{{ currentStep().title }}</h2>
        @for (field of currentStep().fields; track field.key) {
          <app-ent-validated-field
            [field]="field"
            [value]="values()[field.key]"
            [error]="errors()[field.key] ?? null"
            (valueChange)="onValue(field, $event)"
          />
        }

        <div class="e-row" style="justify-content: space-between; margin-top: var(--e-sp-3)">
          <button type="button" class="e-btn" [disabled]="currentIndex() === 0" (click)="back()">{{ copy.task.back }}</button>
          @if (lastStep()) {
            <button type="button" class="e-btn e-btn-primary" [disabled]="submitting()" (click)="submit()">
              {{ submitting() ? copy.task.submitting : copy.task.submit }}
            </button>
          } @else {
            <button type="button" class="e-btn e-btn-primary" (click)="next()">{{ copy.task.next }}</button>
          }
        </div>
      </div>

      @if (invalidNotice()) {
        <p class="e-muted" style="color: var(--e-error); margin-top: var(--e-sp-1-5)">{{ copy.task.stepInvalid }}</p>
      }
    }

    @if (resumePrompt()) {
      <div class="e-confirm-backdrop">
        <div class="e-card e-tour" role="dialog" aria-modal="true" aria-labelledby="resume-title">
          <h2 id="resume-title" style="font-size: 18px">{{ copy.task.resumeTitle }}</h2>
          <p class="e-muted">{{ resumeBody() }}</p>
          <div class="e-row" style="justify-content: flex-end; margin-top: var(--e-sp-2)">
            <button type="button" class="e-btn" (click)="discardDraft()">{{ copy.task.discard }}</button>
            <button type="button" class="e-btn e-btn-primary" (click)="resumeDraft()">{{ copy.task.resume }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .e-stepper { display: flex; gap: var(--e-sp-1-5); margin-bottom: var(--e-sp-3); flex-wrap: wrap; }
      .e-step { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 0; color: var(--e-text-secondary); cursor: pointer; font: inherit; }
      .e-step-num { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--e-stroke); display: grid; place-items: center; font-size: 12px; }
      .e-step-done .e-step-num { background: var(--e-brand); color: var(--e-on-accent); border-color: var(--e-brand); }
      .e-step-current { color: var(--e-text); font-weight: 700; }
      .e-confirm-backdrop { position: fixed; inset: 0; z-index: 500; background: rgb(0 0 0 / 45%); display: grid; place-items: center; padding: var(--e-sp-2); }
      .e-tour { max-width: 460px; width: 100%; }
    `,
  ],
})
export class LaunchSurveyPageComponent {
  readonly copy = copy;
  readonly interpolate = interpolate;
  readonly steps = LAUNCH_TASK.steps;
  readonly currentIndex = signal(0);
  readonly values = signal<StepValues>({});
  readonly errors = signal<Partial<Record<string, string>>>({});
  readonly invalidNotice = signal(false);
  readonly submitting = signal(false);
  readonly done = signal(false);
  readonly resumePrompt = signal(false);
  readonly draftUpdatedAt = signal('');
  private readonly drafts = inject(DraftsService);
  private readonly simulation = inject(SimulationService);
  private readonly toast = inject(ToastService);
  private readonly activity = inject(ActivityService);

  readonly currentStep = computed(() => this.steps[Math.min(this.currentIndex(), this.steps.length - 1)]);
  readonly lastStep = computed(() => this.currentIndex() === this.steps.length - 1);
  readonly resumeBody = computed(() => {
    const time = this.draftUpdatedAt() ? new Date(this.draftUpdatedAt()).toLocaleTimeString() : '';
    return this.interpolate(copy.task.resumeBody, { time });
  });

  constructor() {
    const draft = this.drafts.get(LAUNCH_TASK.taskKey);
    if (draft) {
      this.resumePrompt.set(true);
      this.draftUpdatedAt.set(draft.updatedAt);
      this.values.set(draft.values as StepValues);
      this.currentIndex.set(draft.currentStepIndex);
    } else {
      this.values.set({ launchDate: defaultLaunchDate(), ...DEFAULT_DRAFT_VALUES });
    }
    this.autosave();
  }

  private autosave(): void {
    this.drafts.save({ taskKey: LAUNCH_TASK.taskKey, currentStepIndex: this.currentIndex(), values: this.values(), updatedAt: new Date().toISOString() });
  }

  currentStepValues(): StepValues {
    const values = this.values();
    const out: StepValues = {};
    for (const step of this.steps) {
      for (const field of step.fields) {
        if (field.key in values) out[field.key] = values[field.key];
      }
    }
    return out;
  }

  onValue(field: FieldSpec, value: FieldValue): void {
    this.values.update((current) => ({ ...current, [field.key]: value }));
    this.errors.update((current) => {
      if (!(field.key in current)) return current;
      const next = { ...current };
      delete next[field.key];
      return next;
    });
    this.invalidNotice.set(false);
    this.autosave();
  }

  next(): void {
    const step = this.currentStep();
    const errors = buildErrors(step, this.currentStepValues());
    this.errors.set(errors);
    if (stepHasError(errors)) {
      this.invalidNotice.set(true);
      return;
    }
    this.invalidNotice.set(false);
    this.currentIndex.update((i) => Math.min(i + 1, this.steps.length - 1));
    this.autosave();
  }

  back(): void {
    this.currentIndex.update((i) => Math.max(i - 1, 0));
    this.errors.set({});
    this.autosave();
  }

  jumpTo(index: number): void {
    // Only allow jumping backwards (forwards is gated by validation).
    if (index < this.currentIndex()) {
      this.currentIndex.set(index);
      this.errors.set({});
    }
  }

  async submit(): Promise<void> {
    if (this.submitting()) return;
    const step = this.currentStep();
    const errors = buildErrors(step, this.currentStepValues());
    this.errors.set(errors);
    if (stepHasError(errors)) {
      this.invalidNotice.set(true);
      return;
    }
    this.submitting.set(true);
    const outcome = await this.simulation.runAction('launch-survey', this.currentStepValues() as unknown as Record<string, unknown>);
    this.submitting.set(false);
    if (outcome.ok) {
      this.drafts.clear(LAUNCH_TASK.taskKey);
      this.done.set(true);
      this.toast.success(outcome.message ?? copy.task.successTitle);
      this.activity.record('task', '/enterprise/launch', `Launched survey "${String(this.values()['title'] ?? 'Untitled')}"`);
    } else {
      this.toast.error(outcome.error ?? 'Launch failed. Please try again.');
    }
  }

  summary(): string {
    const values = this.values();
    return `Survey "${String(values['title'] ?? 'Untitled')}" will open for ${String(values['audience'] ?? '')} on ${String(values['launchDate'] ?? '')}.`;
  }

  restart(): void {
    this.done.set(false);
    this.currentIndex.set(0);
    this.values.set({ launchDate: defaultLaunchDate(), ...DEFAULT_DRAFT_VALUES });
    this.errors.set({});
    this.autosave();
  }

  resumeDraft(): void {
    this.resumePrompt.set(false);
  }

  discardDraft(): void {
    this.drafts.clear(LAUNCH_TASK.taskKey);
    this.resumePrompt.set(false);
    this.values.set({ launchDate: defaultLaunchDate(), ...DEFAULT_DRAFT_VALUES });
    this.currentIndex.set(0);
    this.autosave();
  }
}
