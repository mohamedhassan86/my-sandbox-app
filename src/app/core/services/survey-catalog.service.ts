import { Injectable } from '@angular/core';
import { SurveyConfigService } from './survey-config.service';

export class UnknownSurveyError extends Error {
  constructor(public readonly surveyKey: string) {
    super(`Unknown survey: ${surveyKey}`);
    this.name = 'UnknownSurveyError';
  }
}

@Injectable({ providedIn: 'root' })
export class SurveyCatalogService {
  private manifest: Record<string, string> | null = null;

  constructor(private readonly config: SurveyConfigService) {}

  async load(surveyKey: string) {
    const source = await this.sourceFor(surveyKey);
    return this.config.load(source);
  }

  async sourceFor(surveyKey: string): Promise<string> {
    this.manifest ??= await this.loadManifest();
    const source = this.manifest[surveyKey];
    if (!source) throw new UnknownSurveyError(surveyKey);
    return source;
  }

  private async loadManifest(): Promise<Record<string, string>> {
    const response = await fetch('survey-manifest.json');
    if (!response.ok) throw new Error(`Unable to load survey catalog (${response.status}).`);
    const manifest = await response.json();
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
      throw new Error('Invalid survey catalog.');
    }
    return manifest as Record<string, string>;
  }
}