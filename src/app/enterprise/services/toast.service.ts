import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastKind = 'success' | 'error' | 'info' | 'warn';

/** Thin wrapper over PrimeNG's MessageService with live-region-safe summaries. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private readonly messageService: MessageService) {}

  show(kind: ToastKind, summary: string, detail = '', lifeMs?: number): void {
    this.messageService.add({
      severity: kind,
      summary,
      detail,
      life: kind === 'error' ? 6000 : lifeMs ?? 3000,
    });
  }

  success(summary: string, detail = ''): void {
    this.show('success', summary, detail);
  }

  error(summary: string, detail = ''): void {
    this.show('error', summary, detail);
  }

  info(summary: string, detail = ''): void {
    this.show('info', summary, detail);
  }

  clear(): void {
    this.messageService.clear();
  }
}
