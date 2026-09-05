import { Component, input } from '@angular/core';

@Component({
  selector: 'app-completion-summary',
  standalone: true,
  template: `
    <section class="completion-summary" aria-labelledby="completion-title" role="status">
      <p class="completion-eyebrow">Survey complete</p>
      <h4 id="completion-title">{{ message() }}</h4>
      <p class="completion-percentage">{{ percentage() }}% complete</p>
    </section>
  `,
  styleUrl: './completion-summary.css',
})
export class CompletionSummaryComponent {
  readonly percentage = input.required<number>();
  readonly message = input('Thank you. Your response was submitted successfully.');
}