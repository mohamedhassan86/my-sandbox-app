import { Component, input, output } from '@angular/core';

export type PageStatus = 'active' | 'completed' | 'upcoming';

@Component({
  selector: 'app-survey-navigation',
  standalone: true,
  template: `
    <nav class="survey-navigation" aria-label="Survey pages">
      <ol>
        @for (page of pages(); let index = $index; track page.pageId) {
          <li [class.active]="statusFor(index, currentIndex(), pages().length) === 'active'" [class.completed]="statusFor(index, currentIndex(), pages().length) === 'completed'">
            <span>{{ index + 1 }}</span>
            <span>{{ page.title }}</span>
          </li>
        }
      </ol>
      <div class="actions">
        <button type="button" [disabled]="currentIndex() === 0" (click)="previous.emit()">Previous</button>
        <button type="button" [disabled]="currentIndex() === pages().length - 1" (click)="next.emit()">Next</button>
      </div>
    </nav>
  `,
  styleUrl: './survey-navigation.css',
})
export class SurveyNavigationComponent {
  readonly pages = input.required<ReadonlyArray<{ pageId: string; title: string }>>();
  readonly currentIndex = input.required<number>();
  readonly previous = output<void>();
  readonly next = output<void>();

  statusFor(index: number, currentIndex: number, pageCount: number): PageStatus {
    return SurveyNavigationComponent.statusFor(index, currentIndex, pageCount);
  }

  static statusFor(index: number, currentIndex: number, pageCount: number): PageStatus {
    if (index === currentIndex) return 'active';
    return index < currentIndex && currentIndex < pageCount ? 'completed' : 'upcoming';
  }
}
