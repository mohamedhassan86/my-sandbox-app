import { Component, input, output } from '@angular/core';
import type { ResponseAttachment } from '../../../core/models/response.models';
import type { Question } from '../../../core/models/survey.models';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  template: `
    <label class="file-upload form-group">
      <span class="form-label">Supporting files ({{ question().attachmentsRequired }} required)</span>
      <input class="form-control" type="file" [attr.accept]="question().acceptedFileTypes?.join(',') ?? null" multiple (change)="selectFiles($event)" />
      @if (files().length > 0) {
        <ul>
          @for (file of files(); track file.fileName) { <li>{{ file.fileName }}</li> }
        </ul>
      }
    </label>
  `,
  styleUrl: './file-upload.css',
})
export class FileUploadComponent {
  readonly question = input.required<Question>();
  readonly files = input<ResponseAttachment[]>([]);
  readonly filesChange = output<{ questionId: string; files: ResponseAttachment[] }>();

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? []).slice(0, 3).map((file) => ({
      questionId: this.question().questionId,
      fileName: file.name,
      mediaType: file.type,
      sizeBytes: file.size,
      file,
    }));
    this.filesChange.emit({ questionId: this.question().questionId, files: selected });
  }
}
