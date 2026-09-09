import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';

/** Renders the PrimeNG toast surface for the enterprise area (FR-038/FR-050). */
@Component({
  selector: 'app-ent-toast-host',
  standalone: true,
  imports: [Toast],
  template: ` <p-toast [style]="{ maxWidth: '380px' }" [life]="3000" /> `,
})
export class ToastHostComponent {}
