export type QuestionType =
  | 'radio'
  | 'checkbox'
  | 'textbox'
  | 'textarea'
  | 'rating'
  | 'satisfaction'
  | 'toggle_button'
  | 'dropdown';

export interface Survey {
  surveyId: string;
  title: string;
  description?: string;
  version: string;
  /** Optional respondent time estimate in minutes (1–120); shown in the dock live-survey card. */
  estimatedMinutes?: number;
  pages: SurveyPage[];
}

export interface SurveyPage {
  pageId: string;
  title: string;
  /** Optional page description (1–280 chars); shown under the page title in the survey-card header. */
  description?: string;
  /**
   * Optional page icon key (1–32 chars) into the documented icon set; unknown keys fall
   * back to the default page icon so new icons stay forward-compatible.
   */
  icon?: string;
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

export interface DropdownQuestion extends QuestionBase {
  type: 'dropdown';
  options: Option[];
}

export type Question =
  | RadioQuestion
  | CheckboxQuestion
  | TextboxQuestion
  | TextareaQuestion
  | RatingQuestion
  | SatisfactionQuestion
  | ToggleButtonQuestion
  | DropdownQuestion;
