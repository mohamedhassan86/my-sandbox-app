import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p class="validation-message" role="alert">{{ message() }}</p>',
  styles: '.validation-message { color: #8b1e3f; margin: 0.5rem 0; }',
})
export class ValidationMessageComponent {
  readonly message = input.required<string>();
}
