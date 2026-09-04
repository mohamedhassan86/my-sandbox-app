import { Injectable, computed, signal } from '@angular/core';
import type { Answer, ResponseAttachment, SurveyResponse } from '../../core/models/response.models';
import type { Survey } from '../../core/models/survey.models';
import { validatePageResponse, validateSurveyResponse } from '../../core/validators/response.validator';

@Injectable({ providedIn: 'root' })
export class SurveySessionService {
  private readonly survey = signal<Survey | null>(null);
  private readonly answers = signal<Answer[]>([]);
  private readonly attachments = signal<ResponseAttachment[]>([]);
  private readonly currentPageIndex = signal(0);

  readonly currentSurvey = this.survey.asReadonly();
  readonly currentAnswers = this.answers.asReadonly();
  readonly currentAttachments = this.attachments.asReadonly();
  readonly currentPage = computed(() => this.survey()?.pages[this.currentPageIndex()] ?? null);
  readonly pageIndex = this.currentPageIndex.asReadonly();
  readonly pageCount = computed(() => this.survey()?.pages.length ?? 0);
  readonly isFirstPage = computed(() => this.currentPageIndex() === 0);
  readonly isLastPage = computed(() => this.pageCount() === 0 || this.currentPageIndex() === this.pageCount() - 1);

  start(survey: Survey): void {
    this.survey.set(survey);
    this.answers.set([]);
    this.attachments.set([]);
    this.currentPageIndex.set(0);
  }

  setAnswer(answer: Answer): void {
    this.answers.update((answers) => [...answers.filter((item) => item.questionId !== answer.questionId), answer]);
  }

  setAttachments(questionId: string, files: ResponseAttachment[]): void {
    this.attachments.update((attachments) => [...attachments.filter((file) => file.questionId !== questionId), ...files]);
  }

  validateCurrentPage() {
    const page = this.currentPage();
    return page ? validatePageResponse(page, this.answers(), this.attachments()) : [];
  }

  next(): boolean {
    if (!this.survey() || this.validateCurrentPage().length > 0) return false;
    if (this.currentPageIndex() >= (this.survey()?.pages.length ?? 1) - 1) return false;
    this.currentPageIndex.update((index) => index + 1);
    return true;
  }

  previous(): boolean {
    if (this.currentPageIndex() === 0) return false;
    this.currentPageIndex.update((index) => index - 1);
    return true;
  }

  goToPage(index: number): boolean {
    const count = this.pageCount();
    if (index < 0 || index >= count || index === this.currentPageIndex()) return false;
    // Going backward is always allowed (answers preserved)
    if (index < this.currentPageIndex()) {
      this.currentPageIndex.set(index);
      return true;
    }
    // Going forward: validate all pages from current up to target-1
    const survey = this.survey();
    if (!survey) return false;
    for (let i = this.currentPageIndex(); i < index; i++) {
      const page = survey.pages[i];
      if (page && validatePageResponse(page, this.answers(), this.attachments()).length > 0) {
        return false;
      }
    }
    this.currentPageIndex.set(index);
    return true;
  }

  validateAll() {
    const survey = this.survey();
    return survey ? validateSurveyResponse(survey, this.answers(), this.attachments()) : [];
  }

  buildResponse(): SurveyResponse | null {
    const survey = this.survey();
    if (!survey || this.validateAll().length > 0) return null;
    return {
      surveyId: survey.surveyId,
      surveyVersion: survey.version,
      answers: this.answers(),
      attachments: this.attachments(),
    };
  }
}
