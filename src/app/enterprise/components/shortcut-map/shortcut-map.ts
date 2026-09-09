import { Component, computed, inject } from '@angular/core';
import { KeyboardService } from '../../services/keyboard.service';

export function formatKeys(keys: string[]): string {
  return keys
    .map((key) =>
      key
        .split('+')
        .map((part) => {
          const map: Record<string, string> = { mod: 'Ctrl', ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift', arrowright: '\u2192', arrowleft: '\u2190', arrowup: '\u2191', arrowdown: '\u2193' };
          return map[part] ?? part.toUpperCase();
        })
        .join(' + '),
    )
    .join(' or ');
}

@Component({
  selector: 'app-ent-shortcut-map',
  standalone: true,
  template: `
    <section class="e-card">
      <h2 class="e-label" style="font-size: 15px; text-transform: none; margin-bottom: var(--e-sp-1)">Keyboard shortcuts</h2>
      <table class="e-table">
        <thead>
          <tr><th>Action</th><th>Keys</th><th>Scope</th></tr>
        </thead>
        <tbody>
          @for (entry of entries(); track entry.id) {
            <tr>
              <td>{{ entry.label }}</td>
              <td><kbd>{{ formatKeys(entry.keys) }}</kbd></td>
              <td>{{ entry.scope }}</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
})
export class ShortcutMapComponent {
  readonly formatKeys = formatKeys;
  private readonly keyboard = inject(KeyboardService);
  readonly entries = computed(() => this.keyboard.entries());
}
