import { Component, input, output } from '@angular/core';
import type { ResponseAttachment } from '../../../core/models/response.models';
import type { Question } from '../../../core/models/survey.models';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  template: `
    <label class="file-upload form-group">
      <span class="form-label"
        >Supporting files ({{ question().attachmentsRequired }} required)</span
      >
      <input
        class="form-control"
        type="file"
        [attr.accept]="question().acceptedFileTypes?.join(',') ?? null"
        multiple
        (change)="selectFiles($event)"
      />
      @if (files().length > 0) {
        <ul>
          @for (file of files(); let index = $index; track file.fileName) {
            <li>
              <span class="file-tile" [attr.data-kind]="kindFor(file)" aria-hidden="true"></span>
              <span class="file-meta">
                <span class="file-name">{{ file.fileName }}</span>
                <span class="file-sub">{{ sizeLabel(file.sizeBytes) }} • Ready</span>
              </span>
              <button
                type="button"
                class="file-remove"
                [attr.aria-label]="'Remove ' + file.fileName"
                (click)="$event.preventDefault(); $event.stopPropagation(); removeFile(index)"
              >
                <span class="remove-glyph" aria-hidden="true"></span>
              </button>
            </li>
          }
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

  static kindForFile(file: { fileName: string; mediaType: string }): 'pdf' | 'image' | 'file' {
    if (file.mediaType.startsWith('image/')) return 'image';
    if (file.fileName.toLowerCase().endsWith('.pdf')) return 'pdf';
    return 'file';
  }

  static sizeLabel(sizeBytes: number): string {
    if (!Number.isFinite(sizeBytes) || sizeBytes < 0) return '0 KB';
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  kindFor(file: { fileName: string; mediaType: string }): 'pdf' | 'image' | 'file' {
    return FileUploadComponent.kindForFile(file);
  }

  sizeLabel(sizeBytes: number): string {
    return FileUploadComponent.sizeLabel(sizeBytes);
  }

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = Array.from(input.files ?? [])
      .slice(0, 3)
      .map((file) => ({
        questionId: this.question().questionId,
        fileName: file.name,
        mediaType: file.type,
        sizeBytes: file.size,
        file,
      }));
    this.filesChange.emit({ questionId: this.question().questionId, files: selected });
  }

  removeFile(index: number): void {
    this.filesChange.emit({
      questionId: this.question().questionId,
      files: this.files().filter((_, fileIndex) => fileIndex !== index),
    });
  }
}
