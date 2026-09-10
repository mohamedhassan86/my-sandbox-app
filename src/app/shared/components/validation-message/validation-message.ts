import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-validation-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p class="validation-message" role="alert">{{ message() }}</p>',
})
export class ValidationMessageComponent {
  readonly message = input.required<string>();
}
