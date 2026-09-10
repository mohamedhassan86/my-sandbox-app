import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
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
        <div
          class="survey-layout"
          [class.rail-collapsed]="isRail()"
          [class.drawer-open]="mobileNavOpen()"
        >
          @if (mobileNavOpen()) {
            <div class="dock-backdrop" (click)="toggleMobileNav()"></div>
          }
          <aside class="dock" aria-label="Survey navigation">
            <div class="dock-header">
              <div class="dock-brand-row">
                <button
                  type="button"
                  class="dock-icon-btn expand-btn rail-only"
                  aria-label="Expand survey navigation"
                  (click)="toggleRail()"
                >
                  <span class="glyph glyph-chevrons" aria-hidden="true"></span>
                </button>
                <span class="dock-brand-mark collapse-hide" aria-hidden="true"
                  ><span class="dock-brand-glyph"></span
                ></span>
                <div class="dock-titles collapse-hide">
                  <p class="dock-title">{{ currentSurvey.title }}</p>
                  <p class="dock-eyebrow">Survey {{ currentSurvey.version }}</p>
                </div>
                <button
                  type="button"
                  class="dock-icon-btn collapse-btn only-desktop collapse-hide"
                  aria-label="Collapse survey navigation"
                  (click)="toggleRail()"
                >
                  <span class="glyph glyph-chevrons" aria-hidden="true"></span>
                </button>
                <button
                  type="button"
                  class="dock-icon-btn close-btn only-mobile"
                  aria-label="Close survey navigation"
                  (click)="toggleMobileNav()"
                >
                  <span class="glyph glyph-close" aria-hidden="true"></span>
                </button>
              </div>
              <div class="live-card collapse-hide">
                <div class="live-row">
                  <span class="live-dot" aria-hidden="true"></span>
                  <span class="live-label">Live survey</span>
                  <span class="live-meta"
                    >{{ currentSurvey.pages.length }} sections
                    @if (currentSurvey.estimatedMinutes) {
                      · ~{{ currentSurvey.estimatedMinutes }} min
                    }
                  </span>
                </div>
                <p class="live-title">{{ currentSurvey.title }}</p>
                <p class="live-sub">
                  {{ session.answeredQuestionCount() }} of
                  {{ session.totalQuestionCount() }} answered
                </p>
              </div>
            </div>
            <div class="gold-divider collapse-hide" aria-hidden="true"></div>
            <app-survey-navigation
              [pages]="currentSurvey.pages"
              [currentIndex]="session.pageIndex()"
              [submitted]="session.isSubmitted()"
              [compact]="isRail()"
              [progress]="session.pageProgressList()"
              [overall]="session.overallProgress()"
              (previous)="previousPage()"
              (next)="nextPage()"
              (goTo)="goToPage($event)"
            />
          </aside>
          <div class="main-column">
            <div class="topbar">
              <div class="topbar-inner">
                <button
                  type="button"
                  class="menu-btn only-mobile"
                  aria-label="Open survey navigation"
                  (click)="toggleMobileNav()"
                >
                  <span class="glyph glyph-menu" aria-hidden="true"></span>
                </button>
                <div class="topbar-titles">
                  <nav class="crumbs" aria-label="Breadcrumb">
                    <span class="crumb">Survey</span>
                    <span class="crumb-sep" aria-hidden="true">/</span>
                    <span class="crumb crumb-current" aria-current="page"
                      >Step {{ session.pageIndex() + 1 }} — {{ session.currentPage()?.title }}</span
                    >
                  </nav>
                  <h2 class="topbar-title">{{ currentSurvey.title }}</h2>
                </div>
                <div class="topbar-meta">
                  @if (currentSurvey.estimatedMinutes) {
                    <span class="meta-pill meta-estimate"
                      ><span class="glyph glyph-clock" aria-hidden="true"></span>~{{
                        currentSurvey.estimatedMinutes
                      }}
                      min</span
                    >
                  }
                  <span class="meta-pill meta-count"
                    >{{ session.answeredQuestionCount() }}/{{ session.totalQuestionCount() }}</span
                  >
                </div>
              </div>
            </div>
            <div class="content-wrap">
              @if (!isDesktop()) {
                <p class="visually-hidden">
                  Page {{ session.pageIndex() + 1 }} of {{ currentSurvey.pages.length }}:
                  {{ session.currentPage()?.title }}
                </p>
                <ol class="mobile-pills" aria-hidden="true">
                  @for (page of currentSurvey.pages; let index = $index; track page.pageId) {
                    <li>
                      <span
                        class="pill"
                        [class.active]="index === session.pageIndex()"
                        [class.done]="index < session.pageIndex()"
                        >{{ index + 1 }}</span
                      >
                    </li>
                  }
                </ol>
              }
              @if (!session.isSubmitted()) {
                <section
                  class="progress-card"
                  [attr.aria-label]="
                    'Overall progress: ' + session.answeredPercentage() + '% answered'
                  "
                >
                  <div class="progress-card-row">
                    <p class="progress-card-title">
                      Page {{ session.pageIndex() + 1 }} of {{ currentSurvey.pages.length }}
                    </p>
                    <p class="progress-card-pct">{{ session.answeredPercentage() }}% Completed</p>
                  </div>
                  <div
                    class="progress-card-bar"
                    role="progressbar"
                    [attr.aria-valuenow]="session.answeredPercentage()"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-label="Overall progress"
                  >
                    <span
                      class="progress-card-fill"
                      [style.width.%]="session.answeredPercentage()"
                    ></span>
                  </div>
                  <div class="progress-card-foot">
                    <p class="progress-card-secure">
                      <span class="glyph glyph-secure" aria-hidden="true"></span>Encrypted
                      submission
                    </p>
                    <p class="progress-card-sub">
                      {{ session.answeredQuestionCount() }} of
                      {{ session.totalQuestionCount() }} answered
                    </p>
                  </div>
                </section>
              }
              @if (session.currentPage(); as page) {
                <section class="survey-card">
                  @if (session.isSubmitted()) {
                    <app-completion-summary [percentage]="session.completionPercentage()" />
                  } @else {
                    <header class="card-header">
                      <div class="card-eyebrow-row">
                        <span
                          class="page-icon"
                          [attr.data-icon]="page.icon ?? 'clipboard'"
                          aria-hidden="true"
                        ></span>
                        <p class="card-eyebrow">Step {{ session.pageIndex() + 1 }}</p>
                        <p class="card-counts">
                          {{ questionCounts(page).required }} required ·
                          {{ questionCounts(page).optional }} optional
                        </p>
                      </div>
                      <h2 class="card-title">{{ page.title }}</h2>
                      @if (page.description) {
                        <p class="card-description">{{ page.description }}</p>
                      }
                    </header>
                    <app-survey-page
                      [page]="page"
                      [answers]="session.currentAnswers()"
                      [attachments]="session.currentAttachments()"
                      [issues]="session.currentPageIssues()"
                      (answerChange)="setAnswer($event)"
                      (filesChange)="setAttachments($event)"
                    />
                    <div class="survey-actions" aria-label="Survey navigation controls">
                      <button
                        type="button"
                        class="btn-back"
                        [disabled]="session.pageIndex() === 0"
                        (click)="previousPage()"
                      >
                        <span class="glyph glyph-back" aria-hidden="true"></span>Previous
                      </button>
                      <button
                        type="button"
                        class="btn-next"
                        [class.btn-submit]="session.isLastPage()"
                        [disabled]="submissionState() === 'submitting'"
                        (click)="session.isLastPage() ? submit() : nextPage()"
                      >
                        {{ session.isLastPage() ? submissionLabel(submissionState()) : 'Next'
                        }}<span class="glyph glyph-next" aria-hidden="true"></span>
                      </button>
                    </div>
                  }
                </section>
              }
            </div>
          </div>
        </div>
      } @else {
        <p role="alert">{{ error() }}</p>
        <button type="button" (click)="loadSurvey()">Retry</button>
      }
      <div class="toast-region" role="status">
        @if (toast(); as currentToast) {
          <p class="toast" [attr.data-tone]="currentToast.tone">
            <span class="toast-icon" aria-hidden="true"></span>
            <span class="toast-message">{{ currentToast.message }}</span>
          </p>
        }
      </div>
    </main>
  `,
  styleUrls: ['../../survey-shell.css', '../../survey.css'],
})
export class SurveyViewComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(SurveyCatalogService);
  private readonly submission = inject(ResponseSubmissionService);
  readonly session = inject(SurveySessionService);
  readonly survey = this.session.currentSurvey;
  readonly loading = signal(true);
  readonly submissionState = signal<'idle' | 'submitting' | 'submitted' | 'failed'>('idle');
  readonly toast = signal<{ message: string; tone: 'error' | 'success' | 'info' } | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  readonly error = signal('This survey is temporarily unavailable.');
  readonly mobileNavOpen = signal(SurveyViewComponent.mobileNavDefaultOpen());
  readonly dockCollapsed = signal(false);
  private readonly desktopQuery =
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 64rem)') : null;
  readonly isDesktop = signal(this.desktopQuery?.matches ?? true);
  readonly isRail = computed(() => this.isDesktop() && this.dockCollapsed());
  private readonly handleDesktopChange = (event: MediaQueryListEvent) =>
    this.isDesktop.set(event.matches);

  ngOnInit(): void {
    void this.loadSurvey();
    this.desktopQuery?.addEventListener('change', this.handleDesktopChange);
  }

  ngOnDestroy(): void {
    this.desktopQuery?.removeEventListener('change', this.handleDesktopChange);
    if (this.toastTimer !== null) clearTimeout(this.toastTimer);
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
    const moved = this.session.next();
    if (!moved) {
      this.showToast(SurveyViewComponent.toastForNavigation(false), 'error');
    }
  }

  goToPage(index: number): void {
    const before = this.session.pageIndex();
    const moved = this.session.goToPage(index);
    if (!moved && index !== before) {
      this.showToast(
        SurveyViewComponent.toastForNavigation(false, this.session.pageIndex() + 1),
        'error',
      );
    }
    if (!this.isDesktop()) this.mobileNavOpen.set(false);
  }

  showToast(message: string | null, tone: 'error' | 'success' | 'info'): void {
    if (message === null) return;
    if (this.toastTimer !== null) clearTimeout(this.toastTimer);
    this.toast.set({ message, tone });
    this.toastTimer = setTimeout(() => this.toast.set(null), this.toastDurationMs());
  }

  private toastDurationMs(): number {
    if (typeof window === 'undefined' || typeof getComputedStyle === 'undefined') return 2600;
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--ds-toast-duration')
      .trim();
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2600;
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update((open) => SurveyViewComponent.mobileNavToggle(open));
  }

  toggleRail(): void {
    this.dockCollapsed.update((collapsed) => !collapsed);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (SurveyViewComponent.shouldCloseDrawerOnEscape(this.mobileNavOpen()))
      this.mobileNavOpen.set(false);
  }

  async submit(): Promise<void> {
    const response = this.session.buildResponse();
    if (!response) {
      this.submissionState.set('failed');
      this.showToast(SurveyViewComponent.toastForSubmission('blocked', ''), 'error');
      return;
    }
    this.submissionState.set('submitting');
    const result = await this.submission.submit(response);
    if (result.status === 'submitted') {
      this.submissionState.set('submitted');
      this.session.markSubmitted();
      this.showToast(
        SurveyViewComponent.toastForSubmission(
          'submitted',
          `Response submitted (${result.submissionId}).`,
        ),
        'success',
      );
    } else {
      this.submissionState.set('failed');
      this.showToast(SurveyViewComponent.toastForSubmission('failed', result.message), 'error');
    }
  }

  static submissionLabel(state: 'idle' | 'submitting' | 'submitted' | 'failed'): string {
    return state === 'submitting'
      ? 'Submitting...'
      : state === 'submitted'
        ? 'Response submitted'
        : state === 'failed'
          ? 'Try submitting again'
          : 'Submit response';
  }

  static configurationErrorMessage(): string {
    return 'This survey is temporarily unavailable.';
  }

  static completionMessage(): string {
    return 'Thank you. Your response was submitted successfully.';
  }

  static completionPercentage(
    currentPageIndex: number,
    pageCount: number,
    submitted: boolean,
  ): number {
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

  static shouldCloseDrawerOnEscape(drawerOpen: boolean): boolean {
    return drawerOpen;
  }

  static mobileMenuSummary(
    currentPageIndex: number,
    pageCount: number,
    completionPercentage: number,
  ): string {
    return `Page ${currentPageIndex + 1} of ${pageCount} · ${completionPercentage}% complete`;
  }

  static toastForNavigation(navigated: boolean, blockedStep?: number): string | null {
    if (navigated) return null;
    return blockedStep === undefined
      ? 'Please complete the required fields on this step.'
      : `Please complete Step ${blockedStep} first.`;
  }

  static toastForSubmission(outcome: 'blocked' | 'submitted' | 'failed', detail: string): string {
    if (outcome === 'blocked') return 'Please complete the required fields.';
    return detail;
  }

  static requiredOptionalCounts(questions: ReadonlyArray<{ required: boolean }>): {
    required: number;
    optional: number;
  } {
    const required = questions.filter((question) => question.required).length;
    return { required, optional: questions.length - required };
  }

  questionCounts(page: { questions: ReadonlyArray<{ required: boolean }> }): {
    required: number;
    optional: number;
  } {
    return SurveyViewComponent.requiredOptionalCounts(page.questions);
  }

  submissionLabel(state: 'idle' | 'submitting' | 'submitted' | 'failed'): string {
    return SurveyViewComponent.submissionLabel(state);
  }
}
