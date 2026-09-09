import { Component } from '@angular/core';
import { copy } from '../../copy/copy';
import { DataTableComponent } from '../../components/data-table/data-table';
import { ContextualHelpComponent } from '../../components/contextual-help/contextual-help';

@Component({
  selector: 'app-ent-responses',
  standalone: true,
  imports: [DataTableComponent, ContextualHelpComponent],
  template: `
    <div class="e-command-bar">
      <h1 class="e-page-title">{{ copy.nav.responses }}</h1>
      <app-ent-contextual-help locationKey="responses" />
    </div>
    <app-ent-data-table collectionKey="responses" />
  `,
})
export class ResponsesPageComponent {
  readonly copy = copy;
}
