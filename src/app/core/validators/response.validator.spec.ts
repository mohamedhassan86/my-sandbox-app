import { describe, expect, it } from 'vitest';
import {
  isAnswerValuePresent,
  isQuestionAnswered,
  pageProgress,
  validatePageResponse,
} from './response.validator';

const page = {
  pageId: 'P1',
  title: 'General',
  questions: [
    {
      questionId: 'Q1',
      type: 'checkbox' as const,
      label: 'Topics',
      required: true,
      options: [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
      ],
      minSelections: 1,
      maxSelections: 1,
      attachmentsRequired: 0 as const,
    },
    {
      questionId: 'Q2',
      type: 'textbox' as const,
      label: 'Name',
      required: true,
      minLength: 3,
      maxLength: 8,
      attachmentsRequired: 1 as const,
      acceptedFileTypes: ['text/plain'],
      maxFileSizeBytes: 10,
    },
  ],
};

describe('response validation', () => {
  it('validates required and selection rules', () => {
    const issues = validatePageResponse(page, [{ questionId: 'Q1', value: ['a', 'b'] }], []);
    expect(
      issues.some((issue) => issue.questionId === 'Q1' && issue.message.includes('no more')),
    ).toBe(true);
    expect(
      issues.some((issue) => issue.questionId === 'Q2' && issue.message.includes('required')),
    ).toBe(true);
  });

  it('validates text and attachment policies', () => {
    const file = new File(['too large content'], 'notes.pdf', { type: 'application/pdf' });
    const issues = validatePageResponse(
      page,
      [{ questionId: 'Q2', value: 'A' }],
      [{ questionId: 'Q2', fileName: file.name, mediaType: file.type, sizeBytes: file.size, file }],
    );
    expect(issues.some((issue) => issue.message.includes('characters'))).toBe(true);
    expect(issues.some((issue) => issue.message.includes('unsupported'))).toBe(true);
    expect(issues.some((issue) => issue.message.includes('permitted size'))).toBe(true);
  });

  it('requires the configured attachment count', () => {
    const issues = validatePageResponse(page, [{ questionId: 'Q2', value: 'Ada' }], []);
    expect(
      issues.some((issue) => issue.questionId === 'Q2' && issue.message.includes('Attach 1')),
    ).toBe(true);
  });
});

describe('toggle_button response validation', () => {
  const togglePage = {
    pageId: 'P2',
    title: 'Preferences',
    questions: [
      {
        questionId: 'T1',
        type: 'toggle_button' as const,
        label: 'Enable notifications?',
        required: false,
        defaultValue: false,
        attachmentsRequired: 0 as const,
      },
      {
        questionId: 'T2',
        type: 'toggle_button' as const,
        label: 'Accept terms?',
        required: true,
        defaultValue: true,
        attachmentsRequired: 0 as const,
      },
      {
        questionId: 'T3',
        type: 'toggle_button' as const,
        label: 'Required, no default',
        required: true,
        attachmentsRequired: 0 as const,
      },
    ],
  };

  it('accepts genuine boolean answers', () => {
    const issues = validatePageResponse(
      togglePage,
      [
        { questionId: 'T1', value: true },
        { questionId: 'T2', value: true },
        { questionId: 'T3', value: false },
      ],
      [],
    );
    expect(issues).toEqual([]);
  });

  it('treats an explicit null value as unanswered rather than an invalid type', () => {
    const issues = validatePageResponse(togglePage, [{ questionId: 'T3', value: null }], []);
    expect(
      issues.some((issue) => issue.questionId === 'T3' && issue.message.includes('required')),
    ).toBe(true);
    expect(
      issues.some((issue) => issue.questionId === 'T3' && issue.message.includes('true/false')),
    ).toBe(false);
  });

  it('rejects string, number, and array values as invalid types', () => {
    const stringIssues = validatePageResponse(
      togglePage,
      [{ questionId: 'T1', value: 'true' }],
      [],
    );
    expect(
      stringIssues.some(
        (issue) => issue.questionId === 'T1' && issue.message.includes('true/false'),
      ),
    ).toBe(true);

    const numberIssues = validatePageResponse(
      togglePage,
      [{ questionId: 'T1', value: 1 as unknown as boolean }],
      [],
    );
    expect(
      numberIssues.some(
        (issue) => issue.questionId === 'T1' && issue.message.includes('true/false'),
      ),
    ).toBe(true);

    const arrayIssues = validatePageResponse(
      togglePage,
      [{ questionId: 'T1', value: ['true'] as unknown as boolean }],
      [],
    );
    expect(
      arrayIssues.some(
        (issue) => issue.questionId === 'T1' && issue.message.includes('true/false'),
      ),
    ).toBe(true);
  });

  it('treats a present defaultValue as satisfying a required question with no interaction', () => {
    const issues = validatePageResponse(togglePage, [], []);
    expect(issues.some((issue) => issue.questionId === 'T2')).toBe(false);
  });

  it('fails required validation only when no value and no default are present', () => {
    const issues = validatePageResponse(togglePage, [], []);
    expect(
      issues.some((issue) => issue.questionId === 'T3' && issue.message.includes('required')),
    ).toBe(true);
  });
});

describe('dropdown response validation', () => {
  const dropdownPage = {
    pageId: 'P3',
    title: 'Residence',
    questions: [
      {
        questionId: 'D1',
        type: 'dropdown' as const,
        label: 'Country of residence',
        required: true,
        options: [
          { label: 'United Arab Emirates', value: 'ae' },
          { label: 'Qatar', value: 'qa' },
        ],
        attachmentsRequired: 0 as const,
      },
      {
        questionId: 'D2',
        type: 'dropdown' as const,
        label: 'Preferred contact language',
        required: false,
        options: [
          { label: 'English', value: 'en' },
          { label: 'Arabic', value: 'ar' },
        ],
        attachmentsRequired: 0 as const,
      },
    ],
  };

  it('accepts a string matching a predefined option value', () => {
    const issues = validatePageResponse(dropdownPage, [{ questionId: 'D1', value: 'ae' }], []);
    expect(issues.some((issue) => issue.questionId === 'D1')).toBe(false);
  });

  it('rejects an unknown string that matches no option value', () => {
    const issues = validatePageResponse(dropdownPage, [{ questionId: 'D1', value: 'xx' }], []);
    expect(
      issues.some((issue) => issue.questionId === 'D1' && issue.message.includes('valid option')),
    ).toBe(true);
  });

  it('rejects number, boolean, and array values as invalid types', () => {
    const numberIssues = validatePageResponse(
      dropdownPage,
      [{ questionId: 'D1', value: 1 as unknown as string }],
      [],
    );
    expect(
      numberIssues.some(
        (issue) => issue.questionId === 'D1' && issue.message.includes('valid option'),
      ),
    ).toBe(true);

    const booleanIssues = validatePageResponse(
      dropdownPage,
      [{ questionId: 'D1', value: true as unknown as string }],
      [],
    );
    expect(
      booleanIssues.some(
        (issue) => issue.questionId === 'D1' && issue.message.includes('valid option'),
      ),
    ).toBe(true);

    const arrayIssues = validatePageResponse(
      dropdownPage,
      [{ questionId: 'D1', value: ['ae'] as unknown as string }],
      [],
    );
    expect(
      arrayIssues.some(
        (issue) => issue.questionId === 'D1' && issue.message.includes('valid option'),
      ),
    ).toBe(true);
  });

  it('fails a required dropdown with no selection', () => {
    const issues = validatePageResponse(dropdownPage, [], []);
    expect(
      issues.some((issue) => issue.questionId === 'D1' && issue.message.includes('required')),
    ).toBe(true);
  });

  it('passes an optional dropdown left unselected', () => {
    const issues = validatePageResponse(dropdownPage, [], []);
    expect(issues.some((issue) => issue.questionId === 'D2')).toBe(false);
  });
});

describe('answered-state helpers (progress display)', () => {
  const progressPage = {
    pageId: 'P9',
    title: 'Progress',
    questions: [
      {
        questionId: 'A1',
        type: 'textbox' as const,
        label: 'Name',
        required: false,
        attachmentsRequired: 0 as const,
      },
      {
        questionId: 'A2',
        type: 'checkbox' as const,
        label: 'Topics',
        required: false,
        options: [{ label: 'A', value: 'a' }],
        attachmentsRequired: 0 as const,
      },
      {
        questionId: 'A3',
        type: 'toggle_button' as const,
        label: 'Notify?',
        required: false,
        defaultValue: true,
        attachmentsRequired: 0 as const,
      },
      {
        questionId: 'A4',
        type: 'textarea' as const,
        label: 'Notes',
        required: false,
        attachmentsRequired: 1 as const,
      },
    ],
  };

  it('detects present values with the same semantics the page component used', () => {
    expect(isAnswerValuePresent('hello')).toBe(true);
    expect(isAnswerValuePresent('   ')).toBe(false);
    expect(isAnswerValuePresent('')).toBe(false);
    expect(isAnswerValuePresent(null)).toBe(false);
    expect(isAnswerValuePresent(undefined)).toBe(false);
    expect(isAnswerValuePresent(['a'])).toBe(true);
    expect(isAnswerValuePresent([])).toBe(false);
    expect(isAnswerValuePresent(true)).toBe(true);
    expect(isAnswerValuePresent(false)).toBe(true);
  });

  it('counts a question answered by value or by attachment, never by toggle default', () => {
    const [text, check, toggle, notes] = progressPage.questions;
    expect(isQuestionAnswered(text, [{ questionId: 'A1', value: 'Ada' }], [])).toBe(true);
    expect(isQuestionAnswered(text, [{ questionId: 'A1', value: '  ' }], [])).toBe(false);
    expect(isQuestionAnswered(check, [{ questionId: 'A2', value: ['a'] }], [])).toBe(true);
    expect(isQuestionAnswered(check, [], [])).toBe(false);
    expect(isQuestionAnswered(toggle, [], [])).toBe(false);
    expect(isQuestionAnswered(toggle, [{ questionId: 'A3', value: false }], [])).toBe(true);
    const file = new File(['x'], 'proof.pdf', { type: 'application/pdf' });
    expect(
      isQuestionAnswered(
        notes,
        [],
        [
          {
            questionId: 'A4',
            fileName: file.name,
            mediaType: file.type,
            sizeBytes: file.size,
            file,
          },
        ],
      ),
    ).toBe(true);
  });

  it('reports per-page answered/total progress', () => {
    expect(pageProgress(progressPage, [], [])).toEqual({ pageId: 'P9', answered: 0, total: 4 });
    const answers = [
      { questionId: 'A1', value: 'Ada' },
      { questionId: 'A2', value: ['a'] },
    ];
    expect(pageProgress(progressPage, answers, [])).toEqual({
      pageId: 'P9',
      answered: 2,
      total: 4,
    });
  });
});
