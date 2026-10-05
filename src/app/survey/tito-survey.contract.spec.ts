import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Question, QuestionType, RatingQuestion, Survey } from '../core/models/survey.models';
import type { Answer } from '../core/models/response.models';
import { SurveyCatalogService } from '../core/services/survey-catalog.service';
import { SurveyConfigService } from '../core/services/survey-config.service';
import { validateSurveyResponse } from '../core/validators/response.validator';
import { buildCompletionTiles } from './presenters/completion-tiles';
import { SurveySessionService } from './services/survey-session.service';

/**
 * Contract check for the TITO survey fixture published from `public/`.
 *
 * Guards `specs/009-tito-survey`: catalog integrity (FR-001, FR-010, FR-011), the
 * TITO structure rules — two steps, two closed questions per step, rating last — and proof
 * that each rule can fail (FR-002–FR-009, SC-005), plus the respondent journey and
 * required-answer behaviour that structure produces (FR-007, FR-008). The schema validator
 * only checks generic fixture shape, so rules that belong to one survey — step and question
 * counts, the closed-type allow-list, the last-question rating, the required-question
 * policy — live here. Fixtures are loaded through the real catalog and config services (only
 * `fetch` is stubbed to serve `public/`), so the assertions describe exactly what the
 * application renders.
 */

const PUBLIC_DIR = 'public';
const ICON_STYLESHEET = 'src/styles/components/card.css';
const TITO_KEY = 'tito';
const TITO_SOURCE = 'survey-tito.json';

/** Surveys that shipped before 009-tito-survey; they must keep their fixtures. */
const EXISTING_SURVEYS: Record<string, string> = {
  'customer-feedback': 'survey.json',
  'extended-feedback': 'survey-8-step.json',
  'quick-pulse': 'survey-quick-pulse.json',
  'event-feedback': 'survey-event-feedback.json',
};

const CLOSED_TYPES: readonly QuestionType[] = [
  'radio',
  'checkbox',
  'dropdown',
  'rating',
  'satisfaction',
  'toggle_button',
];
const RATING_MIN = 1;
const RATING_MAX = 5;
const MAX_ESTIMATED_MINUTES = 3;

/** Icon keys with a `.page-icon[data-icon=…]` rule; any other key falls back to the clipboard. */
const SHIPPED_ICONS = new Set(
  [...readFileSync(ICON_STYLESHEET, 'utf8').matchAll(/data-icon='([^']+)'/g)].map((m) => m[1]),
);

function readManifest(): Record<string, string> {
  return JSON.parse(readFileSync(join(PUBLIC_DIR, 'survey-manifest.json'), 'utf8'));
}

/** Serves `public/` like the dev server so the real catalog and config services run unmodified. */
function servePublicAssets(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (source: string) => {
      try {
        return new Response(readFileSync(join(PUBLIC_DIR, source), 'utf8'), { status: 200 });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }),
  );
}

function loadSurvey(key: string): Promise<Survey> {
  return new SurveyCatalogService(new SurveyConfigService()).load(key);
}

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const duplicates = (values: string[]): string[] => [
  ...new Set(values.filter((value, index) => values.indexOf(value) !== index)),
];

function optionsOf(question: Question) {
  return question.type === 'radio' ||
    question.type === 'checkbox' ||
    question.type === 'dropdown' ||
    question.type === 'satisfaction'
    ? question.options
    : null;
}

function ratingOf(question: Question | undefined): RatingQuestion | null {
  return question?.type === 'rating' ? question : null;
}

/**
 * Structure rules for the TITO survey. Every message starts with the spec requirement it
 * enforces so a failure points straight at the violated rule.
 */
function structureViolations(survey: Survey): string[] {
  const violations: string[] = [];
  const questions = survey.pages.flatMap((page) => page.questions);

  // FR-002: two steps.
  if (survey.pages.length !== 2) {
    violations.push(`FR-002: expected exactly 2 steps, found ${survey.pages.length}`);
  }

  // FR-003: two questions per step and one last question overall.
  for (const page of survey.pages) {
    if (page.questions.length !== 2) {
      violations.push(
        `FR-003: step ${page.pageId} must have exactly 2 questions, found ${page.questions.length}`,
      );
    }
  }

  // FR-004: closed questions only (no free text, no file upload).
  for (const question of questions) {
    if (!CLOSED_TYPES.includes(question.type)) {
      violations.push(
        `FR-004: question ${question.questionId} uses the non-closed type "${question.type}"`,
      );
    }
  }

  // FR-005: the survey ends on a 1–5 rating with labelled ends.
  const lastPage = survey.pages[survey.pages.length - 1];
  const lastQuestion = lastPage?.questions[lastPage.questions.length - 1];
  if (lastQuestion?.type !== 'rating') {
    violations.push('FR-005: the last question of the survey must be a rating');
  } else {
    if (lastQuestion.minValue !== RATING_MIN || lastQuestion.maxValue !== RATING_MAX) {
      violations.push(
        `FR-005: the rating must run from ${RATING_MIN} to ${RATING_MAX}, found ` +
          `${lastQuestion.minValue ?? RATING_MIN}–${lastQuestion.maxValue ?? RATING_MAX}`,
      );
    }
    if (!lastQuestion.leftLabel?.trim() || !lastQuestion.rightLabel?.trim()) {
      violations.push('FR-005: the rating must label both ends of the scale');
    }
  }

  // FR-006: unique ids and complete option lists.
  for (const id of duplicates(survey.pages.map((page) => page.pageId))) {
    violations.push(`FR-006: duplicate step id ${id}`);
  }
  for (const id of duplicates(questions.map((question) => question.questionId))) {
    violations.push(`FR-006: duplicate question id ${id}`);
  }
  for (const question of questions) {
    const options = optionsOf(question);
    if (options === null) continue;
    if (options.length === 0) {
      violations.push(`FR-006: question ${question.questionId} has no options`);
    }
    if (options.some((option) => option.label.trim() === '' || option.value.trim() === '')) {
      violations.push(
        `FR-006: question ${question.questionId} has an option without label or value`,
      );
    }
    for (const value of duplicates(options.map((option) => option.value))) {
      violations.push(`FR-006: question ${question.questionId} repeats option value ${value}`);
    }
  }

  // FR-007: exactly the first question of each step is required, with no selection bounds.
  for (const page of survey.pages) {
    page.questions.forEach((question, index) => {
      const shouldBeRequired = index === 0;
      if (question.required !== shouldBeRequired) {
        violations.push(
          `FR-007: question ${question.questionId} must ${shouldBeRequired ? '' : 'not '}be ` +
            'required (only the first question of each step is)',
        );
      }
    });
  }
  for (const question of questions) {
    if ('minSelections' in question || 'maxSelections' in question) {
      violations.push(`FR-007: question ${question.questionId} defines a selection bound`);
    }
  }

  // FR-008: no attachments of any kind.
  for (const question of questions) {
    if (
      question.attachmentsRequired !== 0 ||
      question.acceptedFileTypes !== undefined ||
      question.maxFileSizeBytes !== undefined
    ) {
      violations.push(`FR-008: question ${question.questionId} allows attachments`);
    }
  }

  // FR-009: chrome rendered by the dock and topbar — title, description, estimate, icons.
  if (!survey.title.trim() || !survey.description?.trim() || !survey.version.trim()) {
    violations.push('FR-009: survey title, description, and version are required');
  }
  const minutes = survey.estimatedMinutes;
  if (!Number.isInteger(minutes) || (minutes ?? 0) < 1 || (minutes ?? 0) > MAX_ESTIMATED_MINUTES) {
    violations.push(
      `FR-009: estimatedMinutes must be an integer from 1 to ${MAX_ESTIMATED_MINUTES}`,
    );
  }
  if (survey.title !== 'TITO Survey') {
    violations.push(`FR-009: the survey must be titled "TITO Survey", found "${survey.title}"`);
  }
  for (const page of survey.pages) {
    if (!page.title.trim() || !page.description?.trim()) {
      violations.push(`FR-009: step ${page.pageId} needs a title and a description`);
    }
    if (page.icon === undefined || !SHIPPED_ICONS.has(page.icon)) {
      violations.push(`FR-009: step ${page.pageId} icon "${page.icon}" has no shipped style`);
    }
  }
  return violations;
}

describe('published survey catalog', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it.each(Object.keys(readManifest()))(
    'loads "%s" through the real catalog and schema validator',
    async (key) => {
      const survey = await loadSurvey(key);
      expect(survey.pages.length).toBeGreaterThan(0);
    },
  );

  it('gives every registered key its own source file and its own survey id', async () => {
    const entries = Object.entries(readManifest());
    const surveys = await Promise.all(entries.map(([key]) => loadSurvey(key)));
    const sources = entries.map(([, source]) => source);
    const ids = surveys.map((survey) => survey.surveyId);
    expect(new Set(sources).size, `sources: ${sources.join(', ')}`).toBe(sources.length);
    expect(new Set(ids).size, `survey ids: ${ids.join(', ')}`).toBe(ids.length);
  });

  it('keeps the existing surveys registered and adds tito', () => {
    expect(readManifest()).toMatchObject({
      ...EXISTING_SURVEYS,
      [TITO_KEY]: TITO_SOURCE,
    });
  });

  it('serves the SV011 TITO survey under its own key', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(survey).toMatchObject({ surveyId: 'SV011', title: 'TITO Survey' });
  });

  it('keeps the existing survey fixtures untouched', async () => {
    for (const [key, source] of Object.entries(EXISTING_SURVEYS)) {
      expect(readManifest()[key]).toBe(source);
      expect((await loadSurvey(key)).surveyId).not.toBe('SV011');
    }
  });
});

const violationsFor = (survey: Survey, rule: string): string[] =>
  structureViolations(survey).filter((violation) => violation.startsWith(`${rule}:`));

describe('TITO survey structure', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it('FR-002: has exactly two steps', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-002')).toEqual([]);
    expect(survey.pages).toHaveLength(2);
  });

  it('FR-003: has exactly two questions on each step', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-003')).toEqual([]);
    expect(survey.pages.map((page) => page.questions.length)).toEqual([2, 2]);
  });

  it('FR-004: uses closed question types only', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-004')).toEqual([]);
    const types = survey.pages.flatMap((page) => page.questions.map((question) => question.type));
    expect(types.every((type) => CLOSED_TYPES.includes(type))).toBe(true);
  });

  it('FR-005: ends on a 1–5 rating with labelled ends', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-005')).toEqual([]);
    const lastPage = survey.pages[1];
    const last = ratingOf(lastPage.questions[lastPage.questions.length - 1]);
    expect(last).toMatchObject({
      questionId: 'S2Q2',
      minValue: 1,
      maxValue: 5,
      leftLabel: 'Poor',
      rightLabel: 'Excellent',
    });
  });

  it('FR-006: has unique ids and complete option lists', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-006')).toEqual([]);
  });

  it('FR-007: requires exactly the first question of each step and sets no selection bounds', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-007')).toEqual([]);
    const required = survey.pages
      .flatMap((page) => page.questions)
      .filter((question) => question.required)
      .map((question) => question.questionId);
    expect(required).toEqual(['S1Q1', 'S2Q1']);
  });

  it('FR-008: allows no attachments', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-008')).toEqual([]);
  });

  it('FR-009: defines the survey and step chrome with shipped icons and a short estimate', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(violationsFor(survey, 'FR-009')).toEqual([]);
    expect(survey.pages.map((page) => page.title)).toEqual(['Personal Info', 'Education Info']);
  });

  it('breaks no structure rule at all', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(structureViolations(survey)).toEqual([]);
  });
});

interface Mutation {
  name: string;
  rule: string;
  apply: (survey: Survey) => void;
}

/** Deliberate violations: each must trip the rule it targets (spec SC-005). */
const MUTATIONS: Mutation[] = [
  {
    name: 'adds a third step',
    rule: 'FR-002',
    apply: (survey) => {
      const extra = clone(survey.pages[1]);
      extra.pageId = 'S3';
      extra.questions.forEach((question, index) => {
        question.questionId = `S3Q${index + 1}`;
      });
      survey.pages.push(extra);
    },
  },
  {
    name: 'removes a step',
    rule: 'FR-002',
    apply: (survey) => {
      survey.pages.pop();
    },
  },
  {
    name: 'adds a third question to a step',
    rule: 'FR-003',
    apply: (survey) => {
      const extra = clone(survey.pages[0].questions[1]);
      extra.questionId = 'S1Q3';
      survey.pages[0].questions.push(extra);
    },
  },
  {
    name: 'removes a question from a step',
    rule: 'FR-003',
    apply: (survey) => {
      survey.pages[0].questions.pop();
    },
  },
  {
    name: 'swaps a question for a free-text textbox',
    rule: 'FR-004',
    apply: (survey) => {
      survey.pages[0].questions[1] = {
        questionId: 'S1Q2',
        type: 'textbox',
        label: 'Anything else?',
        required: false,
        attachmentsRequired: 0,
      };
    },
  },
  {
    name: 'swaps a question for a free-text textarea',
    rule: 'FR-004',
    apply: (survey) => {
      survey.pages[1].questions[1] = {
        questionId: 'S2Q2',
        type: 'textarea',
        label: 'Tell us more about your studies.',
        required: false,
        attachmentsRequired: 0,
      };
    },
  },
  {
    name: 'moves the rating off the last question',
    rule: 'FR-005',
    apply: (survey) => {
      survey.pages[1].questions[1] = {
        questionId: 'S2Q2',
        type: 'satisfaction',
        label: 'How satisfied are you with your studies?',
        required: false,
        attachmentsRequired: 0,
        options: [
          { label: 'Very dissatisfied', value: 'very-dissatisfied' },
          { label: 'Very satisfied', value: 'very-satisfied' },
        ],
      };
    },
  },
  {
    name: 'changes the rating range',
    rule: 'FR-005',
    apply: (survey) => {
      const rating = ratingOf(survey.pages[1].questions[1]);
      if (rating) {
        rating.minValue = 0;
        rating.maxValue = 10;
      }
    },
  },
  {
    name: 'drops the rating end labels',
    rule: 'FR-005',
    apply: (survey) => {
      const rating = ratingOf(survey.pages[1].questions[1]);
      if (rating) rating.rightLabel = '';
    },
  },
  {
    name: 'repeats a question id',
    rule: 'FR-006',
    apply: (survey) => {
      survey.pages[1].questions[0].questionId = 'S1Q1';
    },
  },
  {
    name: 'repeats an option value',
    rule: 'FR-006',
    apply: (survey) => {
      const radio = survey.pages[0].questions[0];
      if (radio.type === 'radio') radio.options[1].value = radio.options[0].value;
    },
  },
  {
    name: 'empties a question option list',
    rule: 'FR-006',
    apply: (survey) => {
      const radio = survey.pages[0].questions[0];
      if (radio.type === 'radio') radio.options = [];
    },
  },
  {
    name: 'requires a second question on a step',
    rule: 'FR-007',
    apply: (survey) => {
      survey.pages[0].questions[1].required = true;
    },
  },
  {
    name: 'leaves the first question of a step optional',
    rule: 'FR-007',
    apply: (survey) => {
      survey.pages[1].questions[0].required = false;
    },
  },
  {
    name: 'bounds how many options may be selected',
    rule: 'FR-007',
    apply: (survey) => {
      survey.pages[0].questions[0] = {
        questionId: 'S1Q1',
        type: 'checkbox',
        label: 'Where do you live?',
        required: true,
        attachmentsRequired: 0,
        minSelections: 1,
        options: [{ label: 'With family', value: 'with_family' }],
      };
    },
  },
  {
    name: 'allows an attachment on a question',
    rule: 'FR-008',
    apply: (survey) => {
      survey.pages[0].questions[0].attachmentsRequired = 1;
    },
  },
  {
    name: 'limits file types on a question',
    rule: 'FR-008',
    apply: (survey) => {
      survey.pages[0].questions[0].acceptedFileTypes = ['image/png'];
    },
  },
  {
    name: 'uses an icon without a shipped style',
    rule: 'FR-009',
    apply: (survey) => {
      survey.pages[0].icon = 'no-such-icon';
    },
  },
  {
    name: 'drops a step description',
    rule: 'FR-009',
    apply: (survey) => {
      delete survey.pages[1].description;
    },
  },
  {
    name: 'claims a long completion estimate',
    rule: 'FR-009',
    apply: (survey) => {
      survey.estimatedMinutes = 10;
    },
  },
  {
    name: 'renames the survey',
    rule: 'FR-009',
    apply: (survey) => {
      survey.title = 'Some Other Survey';
    },
  },
];

describe('structure rules reject deliberate violations', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  for (const { rule, name, apply } of MUTATIONS) {
    it(`${rule} flags a survey that ${name}`, async () => {
      const mutated = clone(await loadSurvey(TITO_KEY));
      apply(mutated);
      expect(violationsFor(mutated, rule)).not.toEqual([]);
    });
  }
});

/** `contracts/response-submission.md`: the minimum valid submission (required answers only). */
const REQUIRED_ONLY_ANSWERS: Answer[] = [
  { questionId: 'S1Q1', value: 'with_family' },
  { questionId: 'S2Q1', value: 'bachelor' },
];

/** `contracts/response-submission.md`: a fully answered submission. */
const FULLY_ANSWERED: Answer[] = [
  ...REQUIRED_ONLY_ANSWERS,
  { questionId: 'S1Q2', value: '25_34' },
  { questionId: 'S2Q2', value: '4' },
];

function startSession(survey: Survey, answers: Answer[] = []): SurveySessionService {
  const session = new SurveySessionService();
  session.start(survey);
  for (const answer of answers) session.setAnswer(answer);
  return session;
}

const issueIds = (session: SurveySessionService): string[] =>
  session.currentPageIssues().map((issue) => issue.questionId);

describe('TITO respondent journey', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it('builds the documented fully answered response for submission', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(validateSurveyResponse(survey, FULLY_ANSWERED, [])).toEqual([]);
    expect(startSession(survey, FULLY_ANSWERED).buildResponse()).toEqual({
      surveyId: 'SV011',
      surveyVersion: '1.0',
      answers: FULLY_ANSWERED,
      attachments: [],
    });
  });

  it('shows both steps fully answered in the completion summary', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(buildCompletionTiles(survey, FULLY_ANSWERED, [])).toEqual([
      { label: 'Personal Info', value: '2/2 answered' },
      { label: 'Education Info', value: '2/2 answered' },
      { label: 'Files', value: '0 files attached' },
    ]);
  });

  it('preserves answers when moving back and forward between the steps', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const entered: Answer[] = [
      { questionId: 'S1Q1', value: 'rented_apartment' },
      { questionId: 'S1Q2', value: '18_24' },
    ];
    const session = startSession(survey, entered);
    expect(session.next()).toBe(true);
    expect(session.currentPage()?.pageId).toBe('S2');
    expect(session.previous()).toBe(true);
    expect(session.currentPage()?.pageId).toBe('S1');
    expect(session.currentAnswers()).toEqual(entered);
    expect(session.next()).toBe(true);
  });

  it('keeps only the latest value when a radio or dropdown answer changes', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const session = startSession(survey, [
      { questionId: 'S1Q1', value: 'with_family' },
      { questionId: 'S1Q2', value: 'under_18' },
    ]);
    session.setAnswer({ questionId: 'S1Q1', value: 'own_home' });
    session.setAnswer({ questionId: 'S1Q2', value: '45_plus' });
    expect(session.currentAnswers()).toHaveLength(2);
    expect(session.currentAnswers()).toContainEqual({ questionId: 'S1Q1', value: 'own_home' });
    expect(session.currentAnswers()).toContainEqual({ questionId: 'S1Q2', value: '45_plus' });
  });

  it('accepts every value of the 1–5 rating scale', async () => {
    const survey = await loadSurvey(TITO_KEY);
    for (const value of ['1', '2', '3', '4', '5']) {
      const answers: Answer[] = [...REQUIRED_ONLY_ANSWERS, { questionId: 'S2Q2', value }];
      expect(validateSurveyResponse(survey, answers, [])).toEqual([]);
      expect(buildCompletionTiles(survey, answers, [])[1]).toEqual({
        label: 'Education Info',
        value: '2/2 answered',
      });
    }
  });
});

describe('TITO required answers', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it('reports exactly one missing required answer per step when nothing is answered', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const issues = validateSurveyResponse(survey, [], []);
    expect(issues.map((issue) => issue.questionId)).toEqual(['S1Q1', 'S2Q1']);
  });

  it('blocks leaving step 1 until the required radio is answered', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const session = startSession(survey);
    expect(session.next()).toBe(false);
    expect(session.pageIndex()).toBe(0);
    expect(issueIds(session)).toEqual(['S1Q1']);
    session.setAnswer({ questionId: 'S1Q1', value: 'university_dorm' });
    expect(session.next()).toBe(true);
    expect(session.pageIndex()).toBe(1);
    expect(issueIds(session)).toEqual([]);
  });

  it('blocks submission until the required education answer is given and keeps earlier answers', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const session = startSession(survey, [{ questionId: 'S1Q1', value: 'own_home' }]);
    expect(session.next()).toBe(true);
    expect(session.buildResponse()).toBeNull();
    expect(issueIds(session)).toEqual(['S2Q1']);
    expect(session.currentAnswers()).toEqual([{ questionId: 'S1Q1', value: 'own_home' }]);
    session.setAnswer({ questionId: 'S2Q1', value: 'master' });
    expect(session.buildResponse()?.answers).toHaveLength(2);
  });

  it('accepts a response with only the two required answers', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(startSession(survey, REQUIRED_ONLY_ANSWERS).buildResponse()).toEqual({
      surveyId: 'SV011',
      surveyVersion: '1.0',
      answers: REQUIRED_ONLY_ANSWERS,
      attachments: [],
    });
  });

  it('accepts the survey when every question is answered, including the rating', async () => {
    const survey = await loadSurvey(TITO_KEY);
    expect(startSession(survey, FULLY_ANSWERED).buildResponse()).not.toBeNull();
    expect(validateSurveyResponse(survey, FULLY_ANSWERED, [])).toEqual([]);
  });

  it('does not block navigation for cleared optional answers', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const session = startSession(survey, [
      { questionId: 'S1Q1', value: 'with_family' },
      { questionId: 'S1Q2', value: null },
    ]);
    expect(session.next()).toBe(true);
    expect(buildCompletionTiles(survey, session.currentAnswers(), [])[0]).toEqual({
      label: 'Personal Info',
      value: '1/2 answered',
    });
  });

  it('rejects a dropdown value that is not one of the listed options', async () => {
    const survey = await loadSurvey(TITO_KEY);
    const answers: Answer[] = [...REQUIRED_ONLY_ANSWERS, { questionId: 'S1Q2', value: '99_99' }];
    expect(validateSurveyResponse(survey, answers, []).map((issue) => issue.questionId)).toEqual([
      'S1Q2',
    ]);
  });
});
