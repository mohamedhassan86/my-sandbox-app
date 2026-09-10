import { Component, computed, input, output } from '@angular/core';
import type { PageProgress } from '../../../core/validators/response.validator';
import { SurveySessionService } from '../../services/survey-session.service';
import { stepCountsLabel } from '../../presenters/desktop-chrome';

export type PageStatus = 'active' | 'completed' | 'upcoming';

export interface OverallProgress {
  answered: number;
  total: number;
}

@Component({
  selector: 'app-survey-navigation',
  standalone: true,
  template: `
    <nav class="survey-navigation" [class.compact]="compact()" aria-label="Survey pages">
      @if (!compact()) {
        <p class="survey-steps-label">
          <span class="steps-glyph" aria-hidden="true"></span>{{ stepsLabel }}
        </p>
      }
      <ol>
        @for (page of pages(); let index = $index; track page.pageId) {
          <li
            [class.active]="statusFor(index, currentIndex(), pages().length) === 'active'"
            [class.completed]="statusFor(index, currentIndex(), pages().length) === 'completed'"
          >
            <button
              type="button"
              class="page-step"
              [attr.aria-current]="index === currentIndex() ? 'step' : null"
              [attr.aria-label]="stepLabel(index)"
              [attr.title]="compact() ? page.title : null"
              [disabled]="submitted() || index > currentIndex()"
              (click)="selectPage(index)"
            >
              <span class="step-number" aria-hidden="true">
                @if (statusFor(index, currentIndex(), pages().length) === 'completed') {
                  <span class="step-check"></span>
                } @else {
                  {{ index + 1 }}
                }
              </span>
              @if (!compact()) {
                <span class="step-body">
                  <span class="step-title">{{ page.title }}</span>
                  <span class="step-counts"
                    >{{ progressFor(index).answered }}/{{ progressFor(index).total }} done</span
                  >
                  <span class="step-counts step-counts-desktop">{{
                    stepCounts(progressFor(index).answered, progressFor(index).total)
                  }}</span>
                  <span class="step-mini" aria-hidden="true"
                    ><span
                      class="step-mini-fill"
                      [style.width.%]="
                        stepPercentage(progressFor(index).answered, progressFor(index).total)
                      "
                    ></span
                  ></span>
                </span>
                <span class="step-state"></span>
              }
            </button>
          </li>
        }
      </ol>
      @if (!compact()) {
        <p class="dock-security">
          <span class="security-glyph" aria-hidden="true"></span>
          Your responses are encrypted &amp; securely stored.
        </p>
        <div class="dock-secure-panel">
          <span class="secure-tile" aria-hidden="true"><span class="secure-glyph"></span></span>
          <span class="secure-text">
            <span class="secure-title">{{ securePanelTitle }}</span>
            <span class="secure-body">{{ securePanelBody }}</span>
          </span>
        </div>
      }
      <div class="dock-progress">
        @if (!compact()) {
          <div
            class="ring-wrap"
            role="progressbar"
            [attr.aria-valuenow]="overallPct()"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="'Survey progress: ' + overallPct() + '% answered'"
          >
            <svg class="ring" viewBox="0 0 58 58" aria-hidden="true">
              <circle cx="29" cy="29" r="24" class="ring-track" />
              <circle
                cx="29"
                cy="29"
                r="24"
                class="ring-fill"
                [attr.stroke-dashoffset]="ringOffset(overallPct())"
              />
            </svg>
            <span class="ring-pct">{{ overallPct() }}%</span>
          </div>
          <div class="dock-progress-text">
            <p class="dock-status">{{ statusLabel() }}</p>
            <p class="dock-sub">Step {{ currentIndex() + 1 }} of {{ pages().length }}</p>
            <div class="dock-bar" aria-hidden="true">
              <span class="dock-bar-fill" [style.width.%]="overallPct()"></span>
            </div>
          </div>
        } @else {
          <p
            class="dock-pct-mini"
            role="progressbar"
            [attr.aria-valuenow]="overallPct()"
            aria-valuemin="0"
            aria-valuemax="100"
            [attr.aria-label]="'Survey progress: ' + overallPct() + '% answered'"
          >
            {{ overallPct() }}%
          </p>
        }
      </div>
      @if (!compact()) {
        <p class="dock-theme-caption">{{ themeCaption }}</p>
      }
    </nav>
  `,
  styleUrl: './survey-navigation.css',
})
export class SurveyNavigationComponent {
  /** Desktop-chrome contract strings (007, contracts/desktop-chrome.md §5). */
  static readonly STEPS_LABEL = 'Survey steps';
  static readonly SECURE_PANEL_TITLE = 'Private & secure';
  static readonly SECURE_PANEL_BODY = 'Your responses are encrypted & securely stored.';
  static readonly THEME_CAPTION = 'Maroon • Gold • Cream Theme';

  readonly stepsLabel = SurveyNavigationComponent.STEPS_LABEL;
  readonly securePanelTitle = SurveyNavigationComponent.SECURE_PANEL_TITLE;
  readonly securePanelBody = SurveyNavigationComponent.SECURE_PANEL_BODY;
  readonly themeCaption = SurveyNavigationComponent.THEME_CAPTION;

  readonly pages = input.required<ReadonlyArray<{ pageId: string; title: string }>>();
  readonly currentIndex = input.required<number>();
  readonly submitted = input(false);
  readonly compact = input(false);
  readonly progress = input<PageProgress[]>([]);
  readonly overall = input<OverallProgress>({ answered: 0, total: 0 });
  readonly previous = output<void>();
  readonly next = output<void>();
  readonly goTo = output<number>();

  readonly overallPct = computed(() => {
    const { answered, total } = this.overall();
    return SurveyNavigationComponent.overallPercentage(answered, total, this.submitted());
  });

  readonly statusLabel = computed(() =>
    SurveySessionService.progressBandLabel(
      SurveySessionService.progressBand(this.overallPct()),
      this.submitted(),
    ),
  );

  static overallPercentage(answered: number, total: number, submitted = false): number {
    if (submitted || total <= 0) return submitted ? 100 : 0;
    return Math.round((answered / total) * 100);
  }

  static stepPercentage(answered: number, total: number): number {
    return total <= 0 ? 0 : Math.round((answered / total) * 100);
  }

  /** Desktop step-row counts text (007 FR-006) — delegates to the pure presenter. */
  static stepCountsLabel(answered: number, total: number): string {
    return stepCountsLabel(answered, total);
  }

  /** Ring geometry: r=24 → circumference 150.8; the offset reveals the answered arc. */
  static ringOffset(percentage: number): number {
    const circumference = 150.8;
    return Math.round((circumference - (circumference * percentage) / 100) * 10) / 10;
  }

  static stepAriaLabel(
    title: string,
    index: number,
    pageCount: number,
    answered: number,
    total: number,
    status: PageStatus,
  ): string {
    return `${title}, step ${index + 1} of ${pageCount}, ${answered} of ${total} answered, ${status}`;
  }

  progressFor(index: number): PageProgress {
    return this.progress()[index] ?? { pageId: '', answered: 0, total: 0 };
  }

  stepPercentage(answered: number, total: number): number {
    return SurveyNavigationComponent.stepPercentage(answered, total);
  }

  stepCounts(answered: number, total: number): string {
    return SurveyNavigationComponent.stepCountsLabel(answered, total);
  }

  ringOffset(percentage: number): number {
    return SurveyNavigationComponent.ringOffset(percentage);
  }

  stepLabel(index: number): string {
    const page = this.pages()[index];
    const step = this.progressFor(index);
    return SurveyNavigationComponent.stepAriaLabel(
      page.title,
      index,
      this.pages().length,
      step.answered,
      step.total,
      this.statusFor(index, this.currentIndex(), this.pages().length),
    );
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
