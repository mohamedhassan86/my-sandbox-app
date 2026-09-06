import { describe, expect, it } from 'vitest';
import { validatePageResponse } from './response.validator';

const page = {
  pageId: 'P1',
  title: 'General',
  questions: [
    { questionId: 'Q1', type: 'checkbox' as const, label: 'Topics', required: true, options: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }], minSelections: 1, maxSelections: 1, attachmentsRequired: 0 as const },
    { questionId: 'Q2', type: 'textbox' as const, label: 'Name', required: true, minLength: 3, maxLength: 8, attachmentsRequired: 1 as const, acceptedFileTypes: ['text/plain'], maxFileSizeBytes: 10 },
  ],
};

describe('response validation', () => {
  it('validates required and selection rules', () => {
    const issues = validatePageResponse(page, [{ questionId: 'Q1', value: ['a', 'b'] }], []);
    expect(issues.some((issue) => issue.questionId === 'Q1' && issue.message.includes('no more'))).toBe(true);
    expect(issues.some((issue) => issue.questionId === 'Q2' && issue.message.includes('required'))).toBe(true);
  });

  it('validates text and attachment policies', () => {
    const file = new File(['too large content'], 'notes.pdf', { type: 'application/pdf' });
    const issues = validatePageResponse(page, [{ questionId: 'Q2', value: 'A' }], [{ questionId: 'Q2', fileName: file.name, mediaType: file.type, sizeBytes: file.size, file }]);
    expect(issues.some((issue) => issue.message.includes('characters'))).toBe(true);
    expect(issues.some((issue) => issue.message.includes('unsupported'))).toBe(true);
    expect(issues.some((issue) => issue.message.includes('permitted size'))).toBe(true);
  });

  it('requires the configured attachment count', () => {
    const issues = validatePageResponse(page, [{ questionId: 'Q2', value: 'Ada' }], []);
    expect(issues.some((issue) => issue.questionId === 'Q2' && issue.message.includes('Attach 1'))).toBe(true);
  });
});

describe('toggle_button response validation', () => {
  const togglePage = {
    pageId: 'P2',
    title: 'Preferences',
    questions: [
      { questionId: 'T1', type: 'toggle_button' as const, label: 'Enable notifications?', required: false, defaultValue: false, attachmentsRequired: 0 as const },
      { questionId: 'T2', type: 'toggle_button' as const, label: 'Accept terms?', required: true, defaultValue: true, attachmentsRequired: 0 as const },
      { questionId: 'T3', type: 'toggle_button' as const, label: 'Required, no default', required: true, attachmentsRequired: 0 as const },
    ],
  };

  it('accepts genuine boolean answers', () => {
    const issues = validatePageResponse(togglePage, [{ questionId: 'T1', value: true }, { questionId: 'T2', value: true }, { questionId: 'T3', value: false }], []);
    expect(issues).toEqual([]);
  });

  it('treats an explicit null value as unanswered rather than an invalid type', () => {
    const issues = validatePageResponse(togglePage, [{ questionId: 'T3', value: null }], []);
    expect(issues.some((issue) => issue.questionId === 'T3' && issue.message.includes('required'))).toBe(true);
    expect(issues.some((issue) => issue.questionId === 'T3' && issue.message.includes('true/false'))).toBe(false);
  });

  it('rejects string, number, and array values as invalid types', () => {
    const stringIssues = validatePageResponse(togglePage, [{ questionId: 'T1', value: 'true' }], []);
    expect(stringIssues.some((issue) => issue.questionId === 'T1' && issue.message.includes('true/false'))).toBe(true);

    const numberIssues = validatePageResponse(togglePage, [{ questionId: 'T1', value: 1 as unknown as boolean }], []);
    expect(numberIssues.some((issue) => issue.questionId === 'T1' && issue.message.includes('true/false'))).toBe(true);

    const arrayIssues = validatePageResponse(togglePage, [{ questionId: 'T1', value: ['true'] as unknown as boolean }], []);
    expect(arrayIssues.some((issue) => issue.questionId === 'T1' && issue.message.includes('true/false'))).toBe(true);
  });

  it('treats a present defaultValue as satisfying a required question with no interaction', () => {
    const issues = validatePageResponse(togglePage, [], []);
    expect(issues.some((issue) => issue.questionId === 'T2')).toBe(false);
  });

  it('fails required validation only when no value and no default are present', () => {
    const issues = validatePageResponse(togglePage, [], []);
    expect(issues.some((issue) => issue.questionId === 'T3' && issue.message.includes('required'))).toBe(true);
  });
});
