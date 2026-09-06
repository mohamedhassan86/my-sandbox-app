export type QuestionType = 'radio' | 'checkbox' | 'textbox' | 'textarea' | 'rating' | 'satisfaction' | 'toggle_button';

export interface Survey {
  surveyId: string;
  title: string;
  description?: string;
  version: string;
  pages: SurveyPage[];
}

export interface SurveyPage {
  pageId: string;
  title: string;
  questions: Question[];
}

export interface Option {
  label: string;
  value: string;
  icon?: string;
}

export interface QuestionBase {
  questionId: string;
  label: string;
  required: boolean;
  attachmentsRequired: 0 | 1 | 2 | 3;
  acceptedFileTypes?: string[];
  maxFileSizeBytes?: number;
  minLength?: number;
  maxLength?: number;
}

export interface RadioQuestion extends QuestionBase {
  type: 'radio';
  options: Option[];
}

export interface CheckboxQuestion extends QuestionBase {
  type: 'checkbox';
  options: Option[];
  minSelections?: number;
  maxSelections?: number;
}

export interface TextboxQuestion extends QuestionBase {
  type: 'textbox';
}

export interface TextareaQuestion extends QuestionBase {
  type: 'textarea';
}

export interface RatingQuestion extends QuestionBase {
  type: 'rating';
  minValue?: number;
  maxValue?: number;
  leftLabel?: string;
  rightLabel?: string;
  step?: number;
}

export interface SatisfactionQuestion extends QuestionBase {
  type: 'satisfaction';
  options: Option[];
}

export interface ToggleButtonOptions {
  onLabel?: string;
  offLabel?: string;
}

export interface ToggleButtonQuestion extends QuestionBase {
  type: 'toggle_button';
  description?: string;
  defaultValue?: boolean;
  options?: ToggleButtonOptions;
}

export type Question = RadioQuestion | CheckboxQuestion | TextboxQuestion | TextareaQuestion | RatingQuestion | SatisfactionQuestion | ToggleButtonQuestion;
