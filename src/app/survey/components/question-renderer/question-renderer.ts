import { Component, input, output } from '@angular/core';
import type { Answer } from '../../../core/models/response.models';
import type { Question, QuestionType } from '../../../core/models/survey.models';
import { CheckboxQuestionComponent } from '../checkbox-question/checkbox-question';
import { RadioQuestionComponent } from '../radio-question/radio-question';
import { TextQuestionComponent } from '../text-question/text-question';
import { FileUploadComponent } from '../file-upload/file-upload';

@Component({
  selector: 'app-question-renderer',
  standalone: true,
  imports: [CheckboxQuestionComponent, RadioQuestionComponent, TextQuestionComponent, FileUploadComponent],
  template: `
    @switch (question().type) {
      @case ('radio') { <app-radio-question [question]="$any(question())" [value]="$any(value())" (answerChange)="answerChange.emit($event)" /> }
      @case ('checkbox') { <app-checkbox-question [question]="$any(question())" [value]="$any(value() ?? [])" (answerChange)="answerChange.emit($event)" /> }
      @case ('textbox') { <app-text-question [question]="$any(question())" [value]="$any(value() ?? '')" (answerChange)="answerChange.emit($event)" /> }
      @case ('textarea') { <app-text-question [question]="$any(question())" [value]="$any(value() ?? '')" (answerChange)="answerChange.emit($event)" /> }
    }
    @if (question().attachmentsRequired > 0) {
      <app-file-upload [question]="question()" [files]="attachments()" (filesChange)="filesChange.emit($event)" />
    }
  `,
})
export class QuestionRendererComponent {
  readonly question = input.required<Question>();
  readonly value = input<string | string[] | null>(null);
  readonly attachments = input<import('../../../core/models/response.models').ResponseAttachment[]>([]);
  readonly answerChange = output<Answer>();
  readonly filesChange = output<{ questionId: string; files: import('../../../core/models/response.models').ResponseAttachment[] }>();

  static componentFor(type: QuestionType): 'radio' | 'checkbox' | 'text' {
    return type === 'radio' ? 'radio' : type === 'checkbox' ? 'checkbox' : 'text';
  }
}
