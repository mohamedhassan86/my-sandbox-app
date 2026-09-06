import { Component, input, output } from '@angular/core';
import type { Answer, ResponseAttachment } from '../../../core/models/response.models';
import type { SurveyPage } from '../../../core/models/survey.models';
import type { ResponseIssue } from '../../../core/validators/response.validator';
import { ValidationMessageComponent } from '../../../shared/components/validation-message/validation-message';
import { QuestionRendererComponent } from '../../components/question-renderer/question-renderer';

@Component({
  selector: 'app-survey-page',
  standalone: true,
  imports: [QuestionRendererComponent, ValidationMessageComponent],
  template: `
    <section>
      <div class="questions">
        @for (question of page().questions; track question.questionId) {
          <div class="question-block" [class.answered]="isAnswered(question.questionId)">
            <app-question-renderer
              [question]="question"
              [value]="answerFor(question.questionId)"
              [attachments]="attachmentsFor(question.questionId)"
              (answerChange)="answerChange.emit($event)"
              (filesChange)="filesChange.emit($event)"
            />
            @for (issue of issuesFor(question.questionId); track issue) {
              <app-validation-message [message]="issue.message" />
            }
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
  readonly issues = input<ResponseIssue[]>([]);
  readonly answerChange = output<Answer>();
  readonly filesChange = output<{ questionId: string; files: ResponseAttachment[] }>();

  answerFor(questionId: string): string | string[] | boolean | null {
    return SurveyPageComponent.findAnswerValue(this.answers(), questionId);
  }

  attachmentsFor(questionId: string): ResponseAttachment[] {
    return SurveyPageComponent.filterAttachments(this.attachments(), questionId);
  }

  isAnswered(questionId: string): boolean {
    return SurveyPageComponent.isAnsweredValue(SurveyPageComponent.findAnswerValue(this.answers(), questionId));
  }

  issuesFor(questionId: string): ResponseIssue[] {
    return this.issues().filter((issue) => issue.questionId === questionId);
  }

  /** Pure function: checks if a value counts as answered */
  static isAnsweredValue(value: string | string[] | boolean | null): boolean {
    if (typeof value === 'boolean') return true;
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    return value.trim().length > 0;
  }

  /** Pure function: finds answer value by questionId */
  static findAnswerValue(answers: Answer[], questionId: string): string | string[] | boolean | null {
    return answers.find((a) => a.questionId === questionId)?.value ?? null;
  }

  /** Pure function: filters attachments by questionId */
  static filterAttachments(attachments: ResponseAttachment[], questionId: string): ResponseAttachment[] {
    return attachments.filter((a) => a.questionId === questionId);
  }
}
