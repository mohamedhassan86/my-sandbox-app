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
        @for (question of page().questions; track question.questionId) {
          <app-question-renderer
            [question]="question"
            [value]="answerFor(question.questionId)"
            [attachments]="attachmentsFor(question.questionId)"
            (answerChange)="answerChange.emit($event)"
            (filesChange)="filesChange.emit($event)"
          />
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
    return this.answers().find((answer) => answer.questionId === questionId)?.value ?? null;
  }

  attachmentsFor(questionId: string): ResponseAttachment[] {
    return this.attachments().filter((attachment) => attachment.questionId === questionId);
  }
}
