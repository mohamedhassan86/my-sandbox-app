import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Answer, ResponseAttachment } from '../../../core/models/response.models';
import { SurveyCatalogService } from '../../../core/services/survey-catalog.service';
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
        <div class="survey-layout row">
          @if (!isDesktop() && mobileNavOpen()) {
            <div class="survey-menu-backdrop" (click)="toggleMobileNav()"></div>
          }
          <header class="survey-header col-12 col-md-4" [class.compact]="!sidebarExpanded()">
            <button
              type="button"
              class="menu-toggle"
              [attr.aria-expanded]="sidebarExpanded()"
              aria-controls="survey-header-content"
              [attr.aria-label]="mobileNavOpen() ? 'Collapse survey menu' : 'Expand survey menu'"
              (click)="toggleMobileNav()"
            >
              <span class="burger-icon" [class.open]="mobileNavOpen()" aria-hidden="true"><span></span><span></span><span></span></span>
              @if (mobileNavOpen()) {
                <span class="mobile-menu-summary">
                  <strong class="mobile-menu-title">{{ currentSurvey.title }}</strong>
                  <span class="mobile-menu-progress">{{ mobileMenuSummary(session.pageIndex(), currentSurvey.pages.length, session.completionPercentage()) }}</span>
                </span>
              }
            </button>
            <div class="survey-header-content" id="survey-header-content">
              @if (sidebarExpanded()) {
                <p class="eyebrow">Survey {{ currentSurvey.version }}</p>
                <h2>{{ currentSurvey.title }}</h2>
                @if (currentSurvey.description) { <p class="description">{{ currentSurvey.description }}</p> }
              }
              <app-survey-navigation
                [pages]="currentSurvey.pages"
                [currentIndex]="session.pageIndex()"
                [submitted]="session.isSubmitted()"
                [compact]="!sidebarExpanded()"
                (previous)="previousPage()"
                (next)="nextPage()"
                (goTo)="goToPage($event)"
              />
            </div>
          </header>
          @if (session.currentPage(); as page) {
            <section class="survey-content col-12 col-md-8">
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
            </section>
          }
        </div>
      } @else {
          <p role="alert">{{ error() }}</p>
          <button type="button" (click)="loadSurvey()">Retry</button>
      }
    </main>
  `,
  styleUrl: '../../survey.css',
})
export class SurveyViewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(SurveyCatalogService);
  private readonly submission = inject(ResponseSubmissionService);
  readonly session = inject(SurveySessionService);
  readonly survey = this.session.currentSurvey;
  readonly loading = signal(true);
  readonly submissionState = signal<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  readonly submissionMessage = signal('');
  readonly error = signal('This survey is temporarily unavailable.');
  readonly mobileNavOpen = signal(SurveyViewComponent.mobileNavDefaultOpen());
  private readonly desktopQuery = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null;
  readonly isDesktop = signal(this.desktopQuery?.matches ?? true);
  readonly sidebarExpanded = computed(() => this.isDesktop() || this.mobileNavOpen());
  private readonly handleDesktopChange = (event: MediaQueryListEvent) => this.isDesktop.set(event.matches);

  ngOnInit(): void {
    void this.loadSurvey();
    this.desktopQuery?.addEventListener('change', this.handleDesktopChange);
  }

  ngOnDestroy(): void {
    this.desktopQuery?.removeEventListener('change', this.handleDesktopChange);
  }

  async loadSurvey(): Promise<void> {
    this.loading.set(true);
    try {
      const surveyKey = this.route.snapshot.paramMap.get('surveyKey') ?? 'customer-feedback';      
      this.session.start(await this.catalog.load(surveyKey));
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

  toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => SurveyViewComponent.mobileNavToggle(open));
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

  static mobileNavDefaultOpen(): boolean {
    return false;
  }

  static mobileNavToggle(open: boolean): boolean {
    return !open;
  }

  static mobileMenuSummary(currentPageIndex: number, pageCount: number, completionPercentage: number): string {
    return `Page ${currentPageIndex + 1} of ${pageCount} · ${completionPercentage}% complete`;
  }

  submissionLabel(state: 'idle' | 'submitting' | 'submitted' | 'failed'): string {
    return SurveyViewComponent.submissionLabel(state);
  }

  mobileMenuSummary(currentPageIndex: number, pageCount: number, completionPercentage: number): string {
    return SurveyViewComponent.mobileMenuSummary(currentPageIndex, pageCount, completionPercentage);
  }
}
