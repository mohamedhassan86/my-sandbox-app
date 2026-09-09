import { Component } from '@angular/core';
import { copy } from '../../copy/copy';
import { DataTableComponent } from '../../components/data-table/data-table';
import { ContextualHelpComponent } from '../../components/contextual-help/contextual-help';

@Component({
  selector: 'app-ent-participants',
  standalone: true,
  imports: [DataTableComponent, ContextualHelpComponent],
  template: `
    <div class="e-command-bar">
      <h1 class="e-page-title">{{ copy.nav.participants }}</h1>
      <app-ent-contextual-help locationKey="participants" />
    </div>
    <app-ent-data-table collectionKey="participants" />
  `,
})
export class ParticipantsPageComponent {
  readonly copy = copy;
}
