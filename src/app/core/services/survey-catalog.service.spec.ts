import { describe, expect, it, vi } from 'vitest';
import { SurveyCatalogService, UnknownSurveyError } from './survey-catalog.service';
import { SurveyConfigService } from './survey-config.service';

describe('SurveyCatalogService', () => {
  it('loads a survey from a named manifest key', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ 'customer-feedback': 'survey.json' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        surveyId: 'SV001', title: 'Survey', version: '1.0', pages: [{
          pageId: 'P1', title: 'Page', questions: [{ questionId: 'Q1', type: 'radio', label: 'Choose', required: false, options: [{ label: 'Yes', value: 'yes' }], attachmentsRequired: 0 }],
        }],
      }), { status: 200 })));

    const survey = await new SurveyCatalogService(new SurveyConfigService()).load('customer-feedback');
    expect(survey.surveyId).toBe('SV001');
  });

  it('opens the extended survey for the extended-feedback route key', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ 'extended-feedback': 'survey-8-step.json' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        surveyId: 'SV008', title: 'Extended Survey', version: '1.0', pages: [{
          pageId: 'S1', title: 'Step 1', questions: [{ questionId: 'S1Q1', type: 'textbox', label: 'Name', required: false, attachmentsRequired: 0 }],
        }],
      }), { status: 200 })));

    const survey = await new SurveyCatalogService(new SurveyConfigService()).load('extended-feedback');
    expect(survey.surveyId).toBe('SV008');
  });

  it('rejects unknown survey keys before loading an arbitrary source', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ 'customer-feedback': 'survey.json' }), { status: 200 })));
    await expect(new SurveyCatalogService(new SurveyConfigService()).load('missing')).rejects.toBeInstanceOf(UnknownSurveyError);
  });
});