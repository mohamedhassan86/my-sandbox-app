import { Injectable } from '@angular/core';
import type { Survey } from '../models/survey.models';
import { isValidSurveyConfig, validateSurveyConfig } from '../validators/survey-config.validator';

export class SurveyConfigurationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid survey configuration: ${issues.join(' ')}`);
    this.name = 'SurveyConfigurationError';
  }
}

@Injectable({ providedIn: 'root' })
export class SurveyConfigService {
  async load(source: string): Promise<Survey> {
    const response = await fetch(source);
    if (!response.ok) throw new SurveyConfigurationError([`Unable to load survey (${response.status}).`]);
    return this.parse(await response.json());
  }

  parse(value: unknown): Survey {
    const issues = validateSurveyConfig(value).map((issue) => `${issue.path}: ${issue.message}`);
    if (!isValidSurveyConfig(value)) throw new SurveyConfigurationError(issues);
    return value;
  }
}
