import { Component, OnInit, inject, signal } from '@angular/core';
import type { Answer, ResponseAttachment } from '../../../core/models/response.models';
import { SurveyConfigService } from '../../../core/services/survey-config.service';
import { ResponseSubmissionService } from '../../../core/services/response-submission.service';
import { CompletionSummaryComponent } from '../../components/completion-summary/completion-summary';
import { SurveyNavigationComponent } from '../../components/survey-navigation/survey-navigation';
import { SurveySessionService } from '../../services/survey-session.service';
import { SurveyPageComponent } from '../survey-page/survey-page';

@Component({
  selector: 'app-survey-view',
  standalone: true,
  imports: [SurveyNavigationComponent, SurveyPageComponent, CompletionSummaryComponent],
  template: `
    <main class="survey-shell">
      @if (loading()) {
        <p role="status">Loading survey...</p>
      } @else if (survey(); as currentSurvey) {
        <header class="survey-header">
          <p class="eyebrow">Survey {{ currentSurvey.version }}</p>
          <h2>{{ currentSurvey.title }}</h2>
          @if (currentSurvey.description) { <p class="description">{{ currentSurvey.description }}</p> }
        </header>
        @if (session.currentPage(); as page) {
          <app-survey-navigation
            [pages]="currentSurvey.pages"
            [currentIndex]="session.pageIndex()"
            [submitted]="session.isSubmitted()"
            (previous)="previousPage()"
            (next)="nextPage()"
            (goTo)="goToPage($event)"
          />
          @if (session.isSubmitted()) {
            <app-completion-summary [percentage]="session.completionPercentage()" />
          } @else {
            <app-survey-page
              [page]="page"
              [answers]="session.currentAnswers()"
              [attachments]="session.currentAttachments()"
              [issues]="session.currentPageIssues()"
              (answerChange)="setAnswer($event)"
              (filesChange)="setAttachments($event)"
            />
            <div class="survey-actions" aria-label="Survey navigation controls">
              <button type="button" [disabled]="session.pageIndex() === 0" (click)="previousPage()">Previous</button>
              <button type="button" [disabled]="submissionState() === 'submitting'" (click)="session.isLastPage() ? submit() : nextPage()">
                {{ session.isLastPage() ? submissionLabel(submissionState()) : 'Next' }}
              </button>
            </div>
            <p class="submission-status" role="status">{{ submissionMessage() }}</p>
          }
        }
      } @else {
          <p role="alert">{{ error() }}</p>
          <button type="button" (click)="loadSurvey()">Retry</button>
      }
    </main>
  `,
  styleUrl: '../../survey.css',
})
export class SurveyViewComponent implements OnInit {
  private readonly config = inject(SurveyConfigService);
  private readonly submission = inject(ResponseSubmissionService);
  readonly session = inject(SurveySessionService);
  readonly survey = this.session.currentSurvey;
  readonly loading = signal(true);
  readonly submissionState = signal<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  readonly submissionMessage = signal('');
  readonly error = signal('This survey is temporarily unavailable.');

  ngOnInit(): void {
    void this.loadSurvey();
  }

  async loadSurvey(): Promise<void> {
    this.loading.set(true);
    try {
      this.session.start(await this.config.load(SurveyViewComponent.surveySource(globalThis.location?.search ?? '')));
    } catch {
      this.error.set('This survey is temporarily unavailable.');
    } finally {
      this.loading.set(false);
    }
  }

  setAnswer(answer: Answer): void {
    this.session.setAnswer(answer);
  }

  setAttachments(selection: { questionId: string; files: ResponseAttachment[] }): void {
    this.session.setAttachments(selection.questionId, selection.files);
  }

  previousPage(): void {
    this.session.previous();
  }

  nextPage(): void {
    this.session.next();
  }

  goToPage(index: number): void {
    this.session.goToPage(index);
  }

  async submit(): Promise<void> {
    const response = this.session.buildResponse();
    if (!response) {
      this.submissionState.set('failed');
      this.submissionMessage.set('Please complete all required fields before submitting.');
      return;
    }
    this.submissionState.set('submitting');
    this.submissionMessage.set('');
    const result = await this.submission.submit(response);
    if (result.status === 'submitted') {
      this.submissionState.set('submitted');
      this.session.markSubmitted();
      this.submissionMessage.set(`Response submitted (${result.submissionId}).`);
    } else {
      this.submissionState.set('failed');
      this.submissionMessage.set(result.message);
    }
  }

  static submissionLabel(state: 'idle' | 'submitting' | 'submitted' | 'failed'): string {
    return state === 'submitting' ? 'Submitting...' : state === 'submitted' ? 'Response submitted' : state === 'failed' ? 'Try submitting again' : 'Submit response';
  }

  static configurationErrorMessage(): string {
    return 'This survey is temporarily unavailable.';
  }

  static surveySource(search: string): string {
    return new URLSearchParams(search).get('survey') === 'survey-8-step.json' ? 'survey-8-step.json' : 'survey.json';
  }

  static completionMessage(): string {
    return 'Thank you. Your response was submitted successfully.';
  }

  static completionPercentage(currentPageIndex: number, pageCount: number, submitted: boolean): number {
    if (submitted) return 100;
    if (pageCount <= 0) return 0;
    return Math.round((currentPageIndex / pageCount) * 100);
  }

  static accessibilityRequirements(): string[] {
    return ['semantic-labels', 'keyboard-navigation', 'visible-validation', 'color-contrast'];
  }

  submissionLabel(state: 'idle' | 'submitting' | 'submitted' | 'failed'): string {
    return SurveyViewComponent.submissionLabel(state);
  }
}
