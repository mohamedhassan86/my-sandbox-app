import { Component, input, output, computed } from '@angular/core';

export type PageStatus = 'active' | 'completed' | 'upcoming';

@Component({
  selector: 'app-survey-navigation',
  standalone: true,
  template: `
    <nav class="survey-navigation" aria-label="Survey pages">
      <div class="progress-bar" role="progressbar" [attr.aria-valuenow]="progress()" aria-valuemin="0" aria-valuemax="100">
        <span class="progress-fill" [style.width.%]="progress()"></span>
      </div>
      <p class="progress-text">{{ progress() }}% complete</p>
      <ol>
        @for (page of pages(); let index = $index; track page.pageId) {
          <li [class.active]="statusFor(index, currentIndex(), pages().length) === 'active'"
              [class.completed]="statusFor(index, currentIndex(), pages().length) === 'completed'">
            <button type="button" class="page-step"
                    [attr.aria-current]="index === currentIndex() ? 'step' : null"
                  [disabled]="submitted() || index > currentIndex()"
                  (click)="selectPage(index)">
              <span class="step-number">{{ index + 1 }}</span>
              <span class="step-title">{{ page.title }}</span>
            </button>
          </li>
        }
      </ol>
    </nav>
  `,
  styleUrl: './survey-navigation.css',
})
export class SurveyNavigationComponent {
  readonly pages = input.required<ReadonlyArray<{ pageId: string; title: string }>>();
  readonly currentIndex = input.required<number>();
  readonly submitted = input(false);
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly goTo = output<number>();

  readonly progress = computed(() => {
    return SurveyNavigationComponent.progressFor(this.currentIndex(), this.pages().length, this.submitted());
  });

  static progressFor(currentIndex: number, pageCount: number, submitted = false): number {
    if (submitted) return 100;
    if (pageCount <= 0) return 0;
    return Math.round((currentIndex / pageCount) * 100);
  }

  selectPage(index: number): void {
    if (!this.submitted()) this.goTo.emit(index);
  }

  static canNavigate(submitted: boolean): boolean {
    return !submitted;
  }

  statusFor(index: number, currentIndex: number, pageCount: number): PageStatus {
    return SurveyNavigationComponent.statusFor(index, currentIndex, pageCount);
  }

  static statusFor(index: number, currentIndex: number, pageCount: number): PageStatus {
    if (index === currentIndex) return 'active';
    return index < currentIndex && currentIndex < pageCount ? 'completed' : 'upcoming';
  }
}
