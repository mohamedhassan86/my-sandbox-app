import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  CheckboxQuestion,
  Question,
  QuestionType,
  Survey,
} from '../core/models/survey.models';
import type { Answer } from '../core/models/response.models';
import { SurveyCatalogService } from '../core/services/survey-catalog.service';
import { SurveyConfigService } from '../core/services/survey-config.service';
import { validateSurveyResponse } from '../core/validators/response.validator';
import { buildCompletionTiles } from './presenters/completion-tiles';
import { SurveySessionService } from './services/survey-session.service';

/**
 * Contract check for the survey fixtures published from `public/`.
 *
 * Guards `specs/008-two-step-event-survey`: catalog integrity (FR-001, FR-011, FR-013), the
 * event-feedback structure rules and proof that each rule can fail (FR-002–FR-008, SC-006),
 * and the respondent journey and required-answer behaviour that structure produces (FR-006,
 * FR-009, FR-010). The schema validator only checks generic fixture shape, so rules that belong
 * to one survey — step and question counts, the closed-type allow-list, the required-question
 * policy — live here. Fixtures are loaded through the real catalog and config services (only
 * `fetch` is stubbed to serve `public/`), so the assertions describe exactly what the
 * application renders.
 */

const PUBLIC_DIR = 'public';
const ICON_STYLESHEET = 'src/styles/components/card.css';
const EVENT_FEEDBACK_KEY = 'event-feedback';
const EVENT_FEEDBACK_SOURCE = 'survey-event-feedback.json';

/** Surveys that shipped before 008-two-step-event-survey; they must keep their fixtures. */
const EXISTING_SURVEYS: Record<string, string> = {
  'customer-feedback': 'survey.json',
  'extended-feedback': 'survey-8-step.json',
  'quick-pulse': 'survey-quick-pulse.json',
};

const CLOSED_TYPES: readonly QuestionType[] = [
  'radio',
  'checkbox',
  'dropdown',
  'rating',
  'satisfaction',
  'toggle_button',
];
const REQUIRED_TYPE_MIX: readonly QuestionType[] = ['radio', 'checkbox', 'dropdown'];
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

/**
 * Structure rules for the event-feedback survey. Every message starts with the spec
 * requirement it enforces so a failure points straight at the violated rule.
 */
function structureViolations(survey: Survey): string[] {
  const violations: string[] = [];
  const questions = survey.pages.flatMap((page) => page.questions);

  // FR-002: two steps with three questions each.
  if (survey.pages.length !== 2) {
    violations.push(`FR-002: expected exactly 2 pages, found ${survey.pages.length}`);
  }
  for (const page of survey.pages) {
    if (page.questions.length !== 3) {
      violations.push(
        `FR-002: page ${page.pageId} must have exactly 3 questions, found ${page.questions.length}`,
      );
    }
  }

  // FR-003 / FR-004: closed types only, including the radio + checkbox + dropdown minimum mix.
  for (const question of questions) {
    if (!CLOSED_TYPES.includes(question.type)) {
      violations.push(
        `FR-003: question ${question.questionId} uses the non-closed type "${question.type}"`,
      );
    }
  }
  for (const type of REQUIRED_TYPE_MIX) {
    if (!questions.some((question) => question.type === type)) {
      violations.push(`FR-004: expected at least one ${type} question`);
    }
  }

  // FR-005: unique ids and complete option lists.
  for (const id of duplicates(survey.pages.map((page) => page.pageId))) {
    violations.push(`FR-005: duplicate page id ${id}`);
  }
  for (const id of duplicates(questions.map((question) => question.questionId))) {
    violations.push(`FR-005: duplicate question id ${id}`);
  }
  for (const question of questions) {
    const options = optionsOf(question);
    if (options === null) continue;
    if (options.length === 0) {
      violations.push(`FR-005: question ${question.questionId} has no options`);
    }
    if (options.some((option) => option.label.trim() === '' || option.value.trim() === '')) {
      violations.push(
        `FR-005: question ${question.questionId} has an option without label or value`,
      );
    }
    for (const value of duplicates(options.map((option) => option.value))) {
      violations.push(`FR-005: question ${question.questionId} repeats option value ${value}`);
    }
  }

  // FR-006: only the first question of each page is required (radio on step 1, rating on
  // step 2), and no question bounds how many options may be selected.
  for (const page of survey.pages) {
    page.questions.forEach((question, index) => {
      const shouldBeRequired = index === 0;
      if (question.required !== shouldBeRequired) {
        violations.push(
          `FR-006: question ${question.questionId} must ${shouldBeRequired ? '' : 'not '}be ` +
            'required (only the first question of each page is)',
        );
      }
    });
  }
  const [firstStep, secondStep] = survey.pages;
  if (firstStep?.questions[0]?.type !== 'radio') {
    violations.push('FR-006: the first question of step 1 must be a radio');
  }
  if (secondStep?.questions[0]?.type !== 'rating') {
    violations.push('FR-006: the first question of step 2 must be a rating');
  }
  for (const question of questions) {
    if ('minSelections' in question || 'maxSelections' in question) {
      violations.push(`FR-006: question ${question.questionId} defines a selection bound`);
    }
  }

  // FR-007: no attachments of any kind.
  for (const question of questions) {
    if (
      question.attachmentsRequired !== 0 ||
      question.acceptedFileTypes !== undefined ||
      question.maxFileSizeBytes !== undefined
    ) {
      violations.push(`FR-007: question ${question.questionId} allows attachments`);
    }
  }

  // FR-008 / SC-003: chrome rendered by the dock and topbar, shipped icons, short estimate.
  if (!survey.title.trim() || !survey.description?.trim() || !survey.version.trim()) {
    violations.push('FR-008: survey title, description, and version are required');
  }
  const minutes = survey.estimatedMinutes;
  if (!Number.isInteger(minutes) || (minutes ?? 0) < 1 || (minutes ?? 0) > MAX_ESTIMATED_MINUTES) {
    violations.push(
      `FR-008: estimatedMinutes must be an integer from 1 to ${MAX_ESTIMATED_MINUTES}`,
    );
  }
  for (const page of survey.pages) {
    if (!page.title.trim() || !page.description?.trim()) {
      violations.push(`FR-008: page ${page.pageId} needs a title and a description`);
    }
    if (page.icon === undefined || !SHIPPED_ICONS.has(page.icon)) {
      violations.push(`FR-008: page ${page.pageId} icon "${page.icon}" has no shipped style`);
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

  it('keeps the existing surveys registered and adds event-feedback', () => {
    expect(readManifest()).toMatchObject({
      ...EXISTING_SURVEYS,
      [EVENT_FEEDBACK_KEY]: EVENT_FEEDBACK_SOURCE,
    });
  });

  it('serves the SV010 event-feedback survey under its own key', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(survey).toMatchObject({ surveyId: 'SV010', title: 'Event Feedback Survey' });
  });
});

const violationsFor = (survey: Survey, rule: string): string[] =>
  structureViolations(survey).filter((violation) => violation.startsWith(`${rule}:`));

describe('event-feedback survey structure', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it('FR-002: has exactly two steps with three questions each', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(violationsFor(survey, 'FR-002')).toEqual([]);
    expect(survey.pages.map((page) => page.questions.length)).toEqual([3, 3]);
  });

  it('FR-003/FR-004: uses closed question types only, including radio, checkbox, and dropdown', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect([...violationsFor(survey, 'FR-003'), ...violationsFor(survey, 'FR-004')]).toEqual([]);
  });

  it('FR-005: has unique ids and complete option lists', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(violationsFor(survey, 'FR-005')).toEqual([]);
  });

  it('FR-006: requires exactly the first question of each step and sets no selection bounds', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(violationsFor(survey, 'FR-006')).toEqual([]);
    const required = survey.pages
      .flatMap((page) => page.questions)
      .filter((question) => question.required)
      .map((question) => question.questionId);
    expect(required).toEqual(['S1Q1', 'S2Q1']);
  });

  it('FR-007: allows no attachments', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(violationsFor(survey, 'FR-007')).toEqual([]);
  });

  it('FR-008: defines the survey and step chrome with shipped icons and a short estimate', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(violationsFor(survey, 'FR-008')).toEqual([]);
  });

  it('breaks no structure rule at all', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(structureViolations(survey)).toEqual([]);
  });
});

interface Mutation {
  name: string;
  rule: string;
  apply: (survey: Survey) => void;
}

/** Deliberate violations: each must trip the rule it targets (spec SC-006). */
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
    name: 'adds a fourth question to a step',
    rule: 'FR-002',
    apply: (survey) => {
      const extra = clone(survey.pages[0].questions[2]);
      extra.questionId = 'S1Q4';
      survey.pages[0].questions.push(extra);
    },
  },
  {
    name: 'removes a question from a step',
    rule: 'FR-002',
    apply: (survey) => {
      survey.pages[1].questions.pop();
    },
  },
  {
    name: 'swaps a question for a free-text textbox',
    rule: 'FR-003',
    apply: (survey) => {
      survey.pages[0].questions[2] = {
        questionId: 'S1Q3',
        type: 'textbox',
        label: 'Tell us more.',
        required: false,
        attachmentsRequired: 0,
      };
    },
  },
  {
    name: 'swaps a question for a free-text textarea',
    rule: 'FR-003',
    apply: (survey) => {
      survey.pages[1].questions[2] = {
        questionId: 'S2Q3',
        type: 'textarea',
        label: 'Any comments?',
        required: false,
        attachmentsRequired: 0,
      };
    },
  },
  {
    name: 'has no radio question',
    rule: 'FR-004',
    apply: (survey) => {
      survey.pages[0].questions[0] = {
        questionId: 'S1Q1',
        type: 'dropdown',
        label: 'How did you attend the event?',
        required: true,
        attachmentsRequired: 0,
        options: [{ label: 'In person', value: 'in_person' }],
      };
    },
  },
  {
    name: 'has no checkbox question',
    rule: 'FR-004',
    apply: (survey) => {
      survey.pages[0].questions[1] = {
        questionId: 'S1Q2',
        type: 'radio',
        label: 'Which part did you enjoy most?',
        required: false,
        attachmentsRequired: 0,
        options: [{ label: 'Keynote', value: 'keynote' }],
      };
    },
  },
  {
    name: 'has no dropdown question',
    rule: 'FR-004',
    apply: (survey) => {
      survey.pages[0].questions[2] = {
        questionId: 'S1Q3',
        type: 'radio',
        label: 'How did you hear about the event?',
        required: false,
        attachmentsRequired: 0,
        options: [{ label: 'Email', value: 'email' }],
      };
    },
  },
  {
    name: 'repeats a question id',
    rule: 'FR-005',
    apply: (survey) => {
      survey.pages[1].questions[2].questionId = 'S1Q1';
    },
  },
  {
    name: 'repeats an option value',
    rule: 'FR-005',
    apply: (survey) => {
      const radio = survey.pages[0].questions[0];
      if (radio.type === 'radio') radio.options[1].value = radio.options[0].value;
    },
  },
  {
    name: 'empties a question option list',
    rule: 'FR-005',
    apply: (survey) => {
      const radio = survey.pages[0].questions[0];
      if (radio.type === 'radio') radio.options = [];
    },
  },
  {
    name: 'requires a second question on a step',
    rule: 'FR-006',
    apply: (survey) => {
      survey.pages[0].questions[1].required = true;
    },
  },
  {
    name: 'leaves the first question of a step optional',
    rule: 'FR-006',
    apply: (survey) => {
      survey.pages[1].questions[0].required = false;
    },
  },
  {
    name: 'bounds how many checkbox options may be selected',
    rule: 'FR-006',
    apply: (survey) => {
      (survey.pages[0].questions[1] as CheckboxQuestion).minSelections = 1;
    },
  },
  {
    name: 'allows an attachment on a question',
    rule: 'FR-007',
    apply: (survey) => {
      survey.pages[1].questions[1].attachmentsRequired = 1;
    },
  },
  {
    name: 'limits file types on a question',
    rule: 'FR-007',
    apply: (survey) => {
      survey.pages[0].questions[0].acceptedFileTypes = ['image/png'];
    },
  },
  {
    name: 'uses an icon without a shipped style',
    rule: 'FR-008',
    apply: (survey) => {
      survey.pages[0].icon = 'no-such-icon';
    },
  },
  {
    name: 'drops a step description',
    rule: 'FR-008',
    apply: (survey) => {
      delete survey.pages[1].description;
    },
  },
  {
    name: 'claims a long completion estimate',
    rule: 'FR-008',
    apply: (survey) => {
      survey.estimatedMinutes = 10;
    },
  },
];

describe('structure rules reject deliberate violations', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  for (const { rule, name, apply } of MUTATIONS) {
    it(`${rule} flags a survey that ${name}`, async () => {
      const mutated = clone(await loadSurvey(EVENT_FEEDBACK_KEY));
      apply(mutated);
      expect(violationsFor(mutated, rule)).not.toEqual([]);
    });
  }
});

/** `contracts/response-submission.md`: the minimum valid submission (required answers only). */
const REQUIRED_ONLY_ANSWERS: Answer[] = [
  { questionId: 'S1Q1', value: 'in_person' },
  { questionId: 'S2Q1', value: '4' },
];

/** `contracts/response-submission.md`: a fully answered submission. */
const FULLY_ANSWERED: Answer[] = [
  { questionId: 'S1Q1', value: 'online_live' },
  { questionId: 'S1Q2', value: ['keynote', 'workshops'] },
  { questionId: 'S1Q3', value: 'word_of_mouth' },
  { questionId: 'S2Q1', value: '5' },
  { questionId: 'S2Q2', value: 'very-satisfied' },
  { questionId: 'S2Q3', value: true },
];

function startSession(survey: Survey, answers: Answer[] = []): SurveySessionService {
  const session = new SurveySessionService();
  session.start(survey);
  for (const answer of answers) session.setAnswer(answer);
  return session;
}

const issueIds = (session: SurveySessionService): string[] =>
  session.currentPageIssues().map((issue) => issue.questionId);

describe('event-feedback respondent journey', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it('builds the documented fully answered response for submission', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(validateSurveyResponse(survey, FULLY_ANSWERED, [])).toEqual([]);
    expect(startSession(survey, FULLY_ANSWERED).buildResponse()).toEqual({
      surveyId: 'SV010',
      surveyVersion: '1.0',
      answers: FULLY_ANSWERED,
      attachments: [],
    });
  });

  it('shows both steps fully answered in the completion summary', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(buildCompletionTiles(survey, FULLY_ANSWERED, [])).toEqual([
      { label: 'Your Attendance', value: '3/3 answered' },
      { label: 'Your Experience', value: '3/3 answered' },
      { label: 'Files', value: '0 files attached' },
    ]);
  });

  it('preserves answers when moving back and forward between the steps', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const entered: Answer[] = [
      { questionId: 'S1Q1', value: 'online_on_demand' },
      { questionId: 'S1Q2', value: ['panels'] },
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
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const session = startSession(survey, [
      { questionId: 'S1Q1', value: 'in_person' },
      { questionId: 'S1Q3', value: 'email' },
    ]);
    session.setAnswer({ questionId: 'S1Q1', value: 'mixed' });
    session.setAnswer({ questionId: 'S1Q3', value: 'website' });
    expect(session.currentAnswers()).toHaveLength(2);
    expect(session.currentAnswers()).toContainEqual({ questionId: 'S1Q1', value: 'mixed' });
    expect(session.currentAnswers()).toContainEqual({ questionId: 'S1Q3', value: 'website' });
  });

  it('accepts every checkbox option selected together', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const checkbox = survey.pages[0].questions[1];
    const everyOption =
      checkbox.type === 'checkbox' ? checkbox.options.map((option) => option.value) : [];
    expect(everyOption.length).toBeGreaterThan(1);
    const answers: Answer[] = [
      ...REQUIRED_ONLY_ANSWERS,
      { questionId: 'S1Q2', value: everyOption },
    ];
    expect(validateSurveyResponse(survey, answers, [])).toEqual([]);
    expect(buildCompletionTiles(survey, answers, [])[0]).toEqual({
      label: 'Your Attendance',
      value: '2/3 answered',
    });
  });
});

describe('event-feedback required answers', () => {
  beforeEach(servePublicAssets);
  afterEach(() => vi.unstubAllGlobals());

  it('reports exactly one missing required answer per step when nothing is answered', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const issues = validateSurveyResponse(survey, [], []);
    expect(issues.map((issue) => issue.questionId)).toEqual(['S1Q1', 'S2Q1']);
  });

  it('blocks leaving step 1 until the required radio is answered', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const session = startSession(survey);
    expect(session.next()).toBe(false);
    expect(session.pageIndex()).toBe(0);
    expect(issueIds(session)).toEqual(['S1Q1']);
    session.setAnswer({ questionId: 'S1Q1', value: 'in_person' });
    expect(session.next()).toBe(true);
    expect(session.pageIndex()).toBe(1);
    expect(issueIds(session)).toEqual([]);
  });

  it('blocks submission until the required rating is answered and keeps earlier answers', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const session = startSession(survey, [{ questionId: 'S1Q1', value: 'mixed' }]);
    expect(session.next()).toBe(true);
    expect(session.buildResponse()).toBeNull();
    expect(issueIds(session)).toEqual(['S2Q1']);
    expect(session.currentAnswers()).toEqual([{ questionId: 'S1Q1', value: 'mixed' }]);
    session.setAnswer({ questionId: 'S2Q1', value: '3' });
    expect(session.buildResponse()?.answers).toHaveLength(2);
  });

  it('accepts a response with only the two required answers', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(startSession(survey, REQUIRED_ONLY_ANSWERS).buildResponse()).toEqual({
      surveyId: 'SV010',
      surveyVersion: '1.0',
      answers: REQUIRED_ONLY_ANSWERS,
      attachments: [],
    });
  });

  it('counts only answered questions, so an untouched toggle stays uncounted', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    expect(buildCompletionTiles(survey, REQUIRED_ONLY_ANSWERS, [])).toEqual([
      { label: 'Your Attendance', value: '1/3 answered' },
      { label: 'Your Experience', value: '1/3 answered' },
      { label: 'Files', value: '0 files attached' },
    ]);
  });

  it('counts an explicit "No" on the toggle as an answer', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const answers: Answer[] = [...REQUIRED_ONLY_ANSWERS, { questionId: 'S2Q3', value: false }];
    expect(validateSurveyResponse(survey, answers, [])).toEqual([]);
    expect(buildCompletionTiles(survey, answers, [])[1]).toEqual({
      label: 'Your Experience',
      value: '2/3 answered',
    });
    expect(startSession(survey, answers).buildResponse()?.answers).toContainEqual({
      questionId: 'S2Q3',
      value: false,
    });
  });

  it('does not block navigation for cleared optional answers', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const session = startSession(survey, [
      { questionId: 'S1Q1', value: 'in_person' },
      { questionId: 'S1Q2', value: [] },
      { questionId: 'S1Q3', value: null },
    ]);
    expect(session.next()).toBe(true);
    expect(buildCompletionTiles(survey, session.currentAnswers(), [])[0]).toEqual({
      label: 'Your Attendance',
      value: '1/3 answered',
    });
  });

  it('rejects a dropdown value that is not one of the listed options', async () => {
    const survey = await loadSurvey(EVENT_FEEDBACK_KEY);
    const answers: Answer[] = [
      ...REQUIRED_ONLY_ANSWERS,
      { questionId: 'S1Q3', value: 'carrier_pigeon' },
    ];
    expect(validateSurveyResponse(survey, answers, []).map((issue) => issue.questionId)).toEqual([
      'S1Q3',
    ]);
  });
});
