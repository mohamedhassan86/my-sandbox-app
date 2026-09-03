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
