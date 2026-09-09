import { Component, computed, inject, model, signal } from '@angular/core';
import { copy } from '../../copy/copy';
import { FixtureService } from '../../services/fixture.service';
import { PersistenceService, persistedKeys } from '../../services/persistence.service';
import type { OnboardingState } from '../../models/state.models';

export function isOnboardingComplete(state: OnboardingState | null): boolean {
  return state?.completed === true;
}

@Component({
  selector: 'app-ent-onboarding-tour',
  standalone: true,
  template: `
    @if (open()) {
      <div class="e-tour-backdrop">
        <div class="e-card e-tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
          <p class="e-eyebrow" style="margin-bottom: 0">{{ stepIndex() + 1 }} / {{ steps().length }}</p>
          <h2 id="tour-title" style="font-size: 18px">{{ steps()[stepIndex()]?.title }}</h2>
          <p class="e-muted">{{ steps()[stepIndex()]?.body }}</p>
          <div class="e-row" style="justify-content: space-between; margin-top: var(--e-sp-2)">
            <button type="button" class="e-btn e-btn-ghost e-btn-sm" (click)="dismiss()">Skip tour</button>
            <div class="e-row">
              <button type="button" class="e-btn e-btn-sm" [disabled]="stepIndex() === 0" (click)="back()">Back</button>
              @if (stepIndex() < steps().length - 1) {
                <button type="button" class="e-btn e-btn-primary e-btn-sm" (click)="next()">Next</button>
              } @else {
                <button type="button" class="e-btn e-btn-primary e-btn-sm" (click)="finish()">Done</button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .e-tour-backdrop {
        position: fixed; inset: 0; z-index: 600;
        background: rgb(0 0 0 / 30%);
        display: grid; place-items: center; padding: var(--e-sp-2);
      }
      .e-tour { max-width: 460px; width: 100%; }
    `,
  ],
})
export class OnboardingTourComponent {
  readonly copy = copy;
  readonly open = model(false);
  readonly stepIndex = signal(0);
  readonly steps = computed(() => this.fixtures.fixtures()?.helpContent?.tourSteps ?? []);
  private readonly fixtures = inject(FixtureService);
  private readonly persistence = inject(PersistenceService);

  show(): void {
    this.stepIndex.set(0);
    this.open.set(true);
  }

  next(): void {
    this.stepIndex.update((i) => Math.min(i + 1, this.steps.length - 1));
  }

  back(): void {
    this.stepIndex.update((i) => Math.max(i - 1, 0));
  }

  private persist(completed: boolean, dismissedAt?: string): void {
    this.persistence.write(persistedKeys().onboarding, { completed, dismissedAt } satisfies OnboardingState);
  }

  finish(): void {
    this.persist(true);
    this.open.set(false);
  }

  dismiss(): void {
    this.persist(false, new Date().toISOString());
    this.open.set(false);
  }
}
