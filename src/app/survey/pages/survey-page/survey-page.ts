import { Component, input, output } from '@angular/core';
import type { Answer, ResponseAttachment } from '../../../core/models/response.models';
import type { SurveyPage } from '../../../core/models/survey.models';
import { QuestionRendererComponent } from '../../components/question-renderer/question-renderer';

@Component({
  selector: 'app-survey-page',
  standalone: true,
  imports: [QuestionRendererComponent],
  template: `
    <section aria-labelledby="page-title">
      <h2 id="page-title">{{ page().title }}</h2>
      <div class="questions">
        @for (question of page().questions; track question.questionId; let qIndex = $index) {
          <div class="question-block" [class.answered]="isAnswered(question.questionId)">
            <div class="question-header">
              <span class="question-number">{{ qIndex + 1 }}</span>
              <span class="question-label">{{ question.label }}</span>
              @if (question.required) {
                <span class="required-badge" aria-hidden="true">*</span>
              }
              @if (isAnswered(question.questionId)) {
                <span class="answered-cue" aria-label="Answered">✓</span>
              }
            </div>
            <app-question-renderer
              [question]="question"
              [value]="answerFor(question.questionId)"
              [attachments]="attachmentsFor(question.questionId)"
              (answerChange)="answerChange.emit($event)"
              (filesChange)="filesChange.emit($event)"
            />
          </div>
        }
      </div>
    </section>
  `,
})
export class SurveyPageComponent {
  readonly page = input.required<SurveyPage>();
  readonly answers = input<Answer[]>([]);
  readonly attachments = input<ResponseAttachment[]>([]);
  readonly answerChange = output<Answer>();
  readonly filesChange = output<{ questionId: string; files: ResponseAttachment[] }>();

  answerFor(questionId: string): string | string[] | null {
    return SurveyPageComponent.findAnswerValue(this.answers(), questionId);
  }

  attachmentsFor(questionId: string): ResponseAttachment[] {
    return SurveyPageComponent.filterAttachments(this.attachments(), questionId);
  }

  isAnswered(questionId: string): boolean {
    return SurveyPageComponent.isAnsweredValue(SurveyPageComponent.findAnswerValue(this.answers(), questionId));
  }

  /** Pure function: checks if a value counts as answered */
  static isAnsweredValue(value: string | string[] | null): boolean {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value.trim().length > 0;
  }

  /** Pure function: finds answer value by questionId */
  static findAnswerValue(answers: Answer[], questionId: string): string | string[] | null {
    return answers.find((a) => a.questionId === questionId)?.value ?? null;
  }

  /** Pure function: filters attachments by questionId */
  static filterAttachments(attachments: ResponseAttachment[], questionId: string): ResponseAttachment[] {
    return attachments.filter((a) => a.questionId === questionId);
  }
}
