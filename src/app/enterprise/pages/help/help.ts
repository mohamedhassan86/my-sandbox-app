import { Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { copy } from '../../copy/copy';
import { FixtureService } from '../../services/fixture.service';
import { OnboardingTourComponent } from '../../components/onboarding-tour/onboarding-tour';
import { ShortcutMapComponent } from '../../components/shortcut-map/shortcut-map';

@Component({
  selector: 'app-ent-help',
  standalone: true,
  imports: [RouterLink, OnboardingTourComponent, ShortcutMapComponent],
  template: `
    <div class="e-command-bar">
      <div>
        <h1 class="e-page-title">{{ copy.help.title }}</h1>
        <p class="e-muted">Guided tour, contextual help, and keyboard shortcuts for this demo.</p>
      </div>
      <button type="button" class="e-btn e-btn-primary" (click)="tour.show()">{{ copy.help.replayTour }}</button>
    </div>

    <section class="e-card" aria-labelledby="tour-heading">
      <h2 id="tour-heading" class="e-label" style="font-size: 15px; text-transform: none; margin-bottom: var(--e-sp-1)">{{ copy.help.tour }}</h2>
      <p class="e-muted">New here? Replay the four-step guided tour to learn the shell, search, quick actions, and profile settings.</p>
    </section>

    <section class="e-card" aria-labelledby="help-index-heading">
      <h2 id="help-index-heading" class="e-label" style="font-size: 15px; text-transform: none; margin-bottom: var(--e-sp-1)">{{ copy.help.helpIndex }}</h2>
      @for (topic of topics(); track topic.locationKey) {
        <details class="e-help-topic">
          <summary>
            <a [routerLink]="topic.link ?? '/enterprise/home'">{{ topic.title }}</a>
          </summary>
          <p class="e-muted" style="margin: 6px 0 0">{{ topic.summary }}</p>
        </details>
      }
    </section>

    <app-ent-shortcut-map />
    <app-ent-onboarding-tour #tour />
  `,
  styles: [
    `
      .e-help-topic { border-bottom: 1px solid var(--e-stroke); padding: var(--e-sp-1) 0; }
      .e-help-topic summary { cursor: pointer; font-weight: 600; }
    `,
  ],
})
export class HelpPageComponent {
  readonly copy = copy;
  readonly tour = viewChild.required(OnboardingTourComponent);
  private readonly fixtures = inject(FixtureService);
  readonly topics = computed(() => this.fixtures.fixtures()?.helpContent?.helpTopics ?? []);
}
