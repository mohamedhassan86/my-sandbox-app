import { describe, expect, it } from 'vitest';
import { buildCompletionTiles } from './completion-tiles';

const page = (pageId: string, title: string, questionIds: string[]) => ({
  pageId,
  title,
  questions: questionIds.map((questionId) => ({
    questionId,
    type: 'textbox' as const,
    label: questionId,
    required: false,
    attachmentsRequired: 0 as const,
  })),
});

describe('buildCompletionTiles', () => {
  it('builds per-page answered tiles plus a files tile', () => {
    const survey = {
      surveyId: 'SV1',
      title: 'Survey',
      version: '1.0',
      pages: [page('P1', 'About You', ['Q1', 'Q2']), page('P2', 'Feedback', ['Q3'])],
    };
    const tiles = buildCompletionTiles(
      survey,
      [{ questionId: 'Q1', value: 'Ada' }],
      [
        {
          questionId: 'Q3',
          fileName: 'proof.pdf',
          mediaType: 'application/pdf',
          sizeBytes: 1200,
        },
      ],
    );
    expect(tiles).toEqual([
      { label: 'About You', value: '1/2 answered' },
      { label: 'Feedback', value: '1/1 answered' },
      { label: 'Files', value: '1 file attached' },
    ]);
  });

  it('pluralizes the files tile and reports zero files', () => {
    const survey = {
      surveyId: 'SV1',
      title: 'Survey',
      version: '1.0',
      pages: [page('P1', 'About You', ['Q1'])],
    };
    expect(buildCompletionTiles(survey, [], []).at(-1)).toEqual({
      label: 'Files',
      value: '0 files attached',
    });
  });

  it('caps long surveys with an aggregated overflow tile', () => {
    const survey = {
      surveyId: 'SV8',
      title: 'Survey',
      version: '1.0',
      pages: [
        page('P1', 'One', ['Q1']),
        page('P2', 'Two', ['Q2']),
        page('P3', 'Three', ['Q3']),
        page('P4', 'Four', ['Q4']),
        page('P5', 'Five', ['Q5']),
        page('P6', 'Six', ['Q6']),
      ],
    };
    const tiles = buildCompletionTiles(
      survey,
      [
        { questionId: 'Q1', value: 'a' },
        { questionId: 'Q5', value: 'b' },
      ],
      [],
    );
    expect(tiles).toEqual([
      { label: 'One', value: '1/1 answered' },
      { label: 'Two', value: '0/1 answered' },
      { label: 'Three', value: '0/1 answered' },
      { label: '+3 more', value: '1/3 answered' },
      { label: 'Files', value: '0 files attached' },
    ]);
  });
});
