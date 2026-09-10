import { Injectable, computed, signal } from '@angular/core';
import type { Answer, ResponseAttachment, SurveyResponse } from '../../core/models/response.models';
import type { Survey } from '../../core/models/survey.models';
import {
  pageProgress,
  validatePageResponse,
  validateSurveyResponse,
} from '../../core/validators/response.validator';
import type { PageProgress, ResponseIssue } from '../../core/validators/response.validator';

export type ProgressBand = 'starting' | 'progress' | 'almost' | 'complete';

@Injectable({ providedIn: 'root' })
export class SurveySessionService {
  private readonly survey = signal<Survey | null>(null);
  private readonly answers = signal<Answer[]>([]);
  private readonly attachments = signal<ResponseAttachment[]>([]);
  private readonly currentPageIndex = signal(0);
  private readonly submitted = signal(false);
  private readonly validationAttempted = signal(false);

  readonly currentSurvey = this.survey.asReadonly();
  readonly currentAnswers = this.answers.asReadonly();
  readonly currentAttachments = this.attachments.asReadonly();
  readonly currentPage = computed(() => this.survey()?.pages[this.currentPageIndex()] ?? null);
  readonly pageIndex = this.currentPageIndex.asReadonly();
  readonly pageCount = computed(() => this.survey()?.pages.length ?? 0);
  readonly isFirstPage = computed(() => this.currentPageIndex() === 0);
  readonly isLastPage = computed(
    () => this.pageCount() === 0 || this.currentPageIndex() === this.pageCount() - 1,
  );
  readonly isSubmitted = this.submitted.asReadonly();
  readonly completionPercentage = computed(() =>
    this.submitted()
      ? 100
      : this.pageCount() === 0
        ? 0
        : Math.round((this.currentPageIndex() / this.pageCount()) * 100),
  );
  /** 1-based page position: page 1 of 3 reads 33% (dock progress card). */
  readonly pagePositionPercentage = computed(() =>
    this.submitted()
      ? 100
      : this.pageCount() === 0
        ? 0
        : Math.round(((this.currentPageIndex() + 1) / this.pageCount()) * 100),
  );
  readonly totalQuestionCount = computed(
    () => this.survey()?.pages.reduce((count, page) => count + page.questions.length, 0) ?? 0,
  );
  readonly answeredQuestionCount = computed(() => {
    const current = this.survey();
    if (!current) return 0;
    return current.pages.reduce(
      (count, page) => count + pageProgress(page, this.answers(), this.attachments()).answered,
      0,
    );
  });
  /** Answered-over-total percentage driving the dock ring (100 once submitted). */
  readonly answeredPercentage = computed(() => {
    if (this.submitted()) return 100;
    const total = this.totalQuestionCount();
    return total === 0 ? 0 : Math.round((this.answeredQuestionCount() / total) * 100);
  });
  readonly pageProgressList = computed<PageProgress[]>(() => {
    const current = this.survey();
    return current
      ? current.pages.map((page) => pageProgress(page, this.answers(), this.attachments()))
      : [];
  });
  readonly overallProgress = computed(() => ({
    answered: this.answeredQuestionCount(),
    total: this.totalQuestionCount(),
  }));
  readonly currentPageIssues = computed<ResponseIssue[]>(() => {
    if (!this.validationAttempted()) return [];
    const page = this.currentPage();
    return page ? validatePageResponse(page, this.answers(), this.attachments()) : [];
  });

  start(survey: Survey): void {
    this.survey.set(survey);
    this.answers.set([]);
    this.attachments.set([]);
    this.currentPageIndex.set(0);
    this.submitted.set(false);
    this.validationAttempted.set(false);
  }

  markSubmitted(): void {
    this.submitted.set(true);
  }

  setAnswer(answer: Answer): void {
    this.answers.update((answers) => [
      ...answers.filter((item) => item.questionId !== answer.questionId),
      answer,
    ]);
  }

  setAttachments(questionId: string, files: ResponseAttachment[]): void {
    this.attachments.update((attachments) => [
      ...attachments.filter((file) => file.questionId !== questionId),
      ...files,
    ]);
  }

  validateCurrentPage() {
    const page = this.currentPage();
    return page ? validatePageResponse(page, this.answers(), this.attachments()) : [];
  }

  next(): boolean {
    const issues = this.validateCurrentPage();
    if (!this.survey() || issues.length > 0) {
      this.validationAttempted.set(issues.length > 0);
      return false;
    }
    if (this.currentPageIndex() >= (this.survey()?.pages.length ?? 1) - 1) return false;
    this.validationAttempted.set(false);
    this.currentPageIndex.update((index) => index + 1);
    return true;
  }

  previous(): boolean {
    if (this.currentPageIndex() === 0) return false;
    this.validationAttempted.set(false);
    this.currentPageIndex.update((index) => index - 1);
    return true;
  }

  goToPage(index: number): boolean {
    const count = this.pageCount();
    if (index < 0 || index >= count || index === this.currentPageIndex()) return false;
    // Going backward is always allowed (answers preserved)
    if (index < this.currentPageIndex()) {
      this.validationAttempted.set(false);
      this.currentPageIndex.set(index);
      return true;
    }
    // Going forward: validate all pages from current up to target-1
    const survey = this.survey();
    if (!survey) return false;
    for (let i = this.currentPageIndex(); i < index; i++) {
      const page = survey.pages[i];
      if (page && validatePageResponse(page, this.answers(), this.attachments()).length > 0) {
        this.validationAttempted.set(true);
        return false;
      }
    }
    this.validationAttempted.set(false);
    this.currentPageIndex.set(index);
    return true;
  }

  validateAll() {
    const survey = this.survey();
    return survey ? validateSurveyResponse(survey, this.answers(), this.attachments()) : [];
  }

  static progressBand(percentage: number): ProgressBand {
    if (percentage >= 100) return 'complete';
    if (percentage >= 50) return 'almost';
    if (percentage > 0) return 'progress';
    return 'starting';
  }

  static progressBandLabel(band: ProgressBand, submitted: boolean): string {
    if (submitted) return 'Response submitted';
    switch (band) {
      case 'complete':
        return 'Review & submit';
      case 'almost':
        return 'Almost there';
      case 'progress':
        return 'In progress';
      default:
        return 'Getting started';
    }
  }

  buildResponse(): SurveyResponse | null {
    const survey = this.survey();
    if (!survey) return null;
    if (this.validateAll().length > 0) {
      this.validationAttempted.set(true);
      return null;
    }
    return {
      surveyId: survey.surveyId,
      surveyVersion: survey.version,
      answers: this.answers(),
      attachments: this.attachments(),
    };
  }
}
