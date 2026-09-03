import { Component, OnInit, inject, signal } from '@angular/core';
import type { Answer, ResponseAttachment } from '../../../core/models/response.models';
import { SurveyConfigService } from '../../../core/services/survey-config.service';
import { ResponseSubmissionService } from '../../../core/services/response-submission.service';
import { SurveyNavigationComponent } from '../../components/survey-navigation/survey-navigation';
import { SurveySessionService } from '../../services/survey-session.service';
import { SurveyPageComponent } from '../survey-page/survey-page';

const sampleSurvey = {
  surveyId: 'SV001',
  title: 'Customer Feedback Survey',
  description: 'Please complete the survey.',
  version: '1.0',
  pages: [{
    pageId: 'P1',
    title: 'General Information',
    questions: [
      { questionId: 'Q1', type: 'radio' as const, label: 'Are you satisfied?', required: true, options: [{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }], attachmentsRequired: 0 as const },
      { questionId: 'Q2', type: 'checkbox' as const, label: 'Which topics matter to you?', required: false, options: [{ label: 'Support', value: 'support' }, { label: 'Pricing', value: 'pricing' }], attachmentsRequired: 0 as const },
      { questionId: 'Q3', type: 'textbox' as const, label: 'Your name', required: true, minLength: 2, maxLength: 80, attachmentsRequired: 0 as const },
      { questionId: 'Q4', type: 'textarea' as const, label: 'Additional comments', required: false, maxLength: 500, attachmentsRequired: 0 as const },
    ],
  }, {
    pageId: 'P2',
    title: 'Final Thoughts',
    questions: [
      { questionId: 'Q5', type: 'textarea' as const, label: 'What could we improve?', required: false, maxLength: 500, attachmentsRequired: 0 as const },
      { questionId: 'Q6', type: 'textbox' as const, label: 'Reference name', required: false, attachmentsRequired: 1 as const, acceptedFileTypes: ['text/plain', 'application/pdf'], maxFileSizeBytes: 2_000_000 },
    ],
  }],
};

@Component({
  selector: 'app-survey-view',
  standalone: true,
  imports: [SurveyNavigationComponent, SurveyPageComponent],
  template: `
    <main class="survey-shell">
      @if (loading()) {
        <p role="status">Loading survey...</p>
      } @else if (survey(); as currentSurvey) {
        <header class="survey-header">
          <p class="eyebrow">Survey {{ currentSurvey.version }}</p>
          <h1>{{ currentSurvey.title }}</h1>
          @if (currentSurvey.description) { <p class="description">{{ currentSurvey.description }}</p> }
        </header>
        @if (session.currentPage(); as page) {
          <app-survey-page
            [page]="page"
            [answers]="session.currentAnswers()"
            [attachments]="session.currentAttachments()"
            (answerChange)="setAnswer($event)"
            (filesChange)="setAttachments($event)"
          />
          <app-survey-navigation
            [pages]="currentSurvey.pages"
            [currentIndex]="session.pageIndex()"
            (previous)="previousPage()"
            (next)="nextPage()"
          />
          <p class="submission-status" role="status">{{ submissionMessage() }}</p>
          <button class="submit-button" type="button" [disabled]="submissionState() === 'submitting' || !session.isLastPage()" (click)="submit()">
            {{ submissionLabel(submissionState()) }}
          </button>
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
    this.loadSurvey();
  }

  loadSurvey(): void {
    this.loading.set(true);
    try {
      this.session.start(this.config.parse(sampleSurvey));
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

  submissionLabel(state: 'idle' | 'submitting' | 'submitted' | 'failed'): string {
    return SurveyViewComponent.submissionLabel(state);
  }
}
