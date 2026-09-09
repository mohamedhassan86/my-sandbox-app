import { Component } from '@angular/core';
import { copy } from '../../copy/copy';
import { DataTableComponent } from '../../components/data-table/data-table';
import { ContextualHelpComponent } from '../../components/contextual-help/contextual-help';

@Component({
  selector: 'app-ent-surveys',
  standalone: true,
  imports: [DataTableComponent, ContextualHelpComponent],
  template: `
    <div class="e-command-bar">
      <h1 class="e-page-title">{{ copy.nav.surveys }}</h1>
      <app-ent-contextual-help locationKey="surveys" />
    </div>
    <app-ent-data-table collectionKey="surveys" />
  `,
})
export class SurveysPageComponent {
  readonly copy = copy;
}
