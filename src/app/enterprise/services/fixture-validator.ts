import type { EnterpriseFixtures } from '../models/fixtures.models';
import type { ParticipantRecord, ResponseRecord, SurveyRecord } from '../models/entities.models';

export interface ValidationIssue {
  collection: string;
  path: string;
  message: string;
}

const ID_RE = /^[a-zA-Z0-9_-]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}T/;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function checkId(issues: ValidationIssue[], collection: string, value: unknown, seen: Set<string>): boolean {
  if (typeof value !== 'string' || !ID_RE.test(value)) {
    issues.push({ collection, path: 'id', message: 'id must be a non-empty slug string' });
    return false;
  }
  if (seen.has(value)) {
    issues.push({ collection, path: `id:${value}`, message: `duplicate id "${value}"` });
    return false;
  }
  seen.add(value);
  return true;
}

function checkString(issues: ValidationIssue[], collection: string, rowId: string, field: string, value: unknown): boolean {
  if (typeof value !== 'string' || value.trim() === '') {
    issues.push({ collection, path: `${rowId}.${field}`, message: `${field} must be a non-empty string` });
    return false;
  }
  return true;
}

function checkDate(issues: ValidationIssue[], collection: string, rowId: string, field: string, value: unknown): boolean {
  if (typeof value !== 'string' || !DATE_RE.test(value) || Number.isNaN(Date.parse(value))) {
    issues.push({ collection, path: `${rowId}.${field}`, message: `${field} must be an ISO-8601 date string` });
    return false;
  }
  return true;
}

function validateSurvey(issues: ValidationIssue[], value: unknown, seen: Set<string>): void {
  const s = value as Partial<SurveyRecord>;
  const rowId = typeof s.id === 'string' ? s.id : '?';
  checkId(issues, 'surveys', s.id, seen);
  checkString(issues, 'surveys', rowId, 'title', s.title);
  checkString(issues, 'surveys', rowId, 'owner', s.owner);
  if (typeof s.questionCount !== 'number' || s.questionCount < 0) issues.push({ collection: 'surveys', path: `${rowId}.questionCount`, message: 'questionCount must be a non-negative number' });
  if (typeof s.responseCount !== 'number' || s.responseCount < 0) issues.push({ collection: 'surveys', path: `${rowId}.responseCount`, message: 'responseCount must be a non-negative number' });
  if (s.status !== 'draft' && s.status !== 'active' && s.status !== 'paused' && s.status !== 'archived') issues.push({ collection: 'surveys', path: `${rowId}.status`, message: 'status must be draft|active|paused|archived' });
  if (s.rating != null && (typeof s.rating !== 'number' || s.rating < 0 || s.rating > 10)) issues.push({ collection: 'surveys', path: `${rowId}.rating`, message: 'rating must be null or 0..10' });
  checkDate(issues, 'surveys', rowId, 'createdAt', s.createdAt);
  checkDate(issues, 'surveys', rowId, 'updatedAt', s.updatedAt);
}

function validateResponse(issues: ValidationIssue[], value: unknown, seen: Set<string>): void {
  const r = value as Partial<ResponseRecord>;
  const rowId = typeof r.id === 'string' ? r.id : '?';
  checkId(issues, 'responses', r.id, seen);
  checkString(issues, 'responses', rowId, 'surveyId', r.surveyId);
  checkString(issues, 'responses', rowId, 'participantId', r.participantId);
  if (typeof r.score !== 'number' || r.score < 0 || r.score > 100) issues.push({ collection: 'responses', path: `${rowId}.score`, message: 'score must be a number 0..100' });
  if (typeof r.durationMinutes !== 'number' || r.durationMinutes < 0) issues.push({ collection: 'responses', path: `${rowId}.durationMinutes`, message: 'durationMinutes must be a non-negative number' });
  if (r.completion !== 'complete' && r.completion !== 'partial' && r.completion !== 'abandoned') issues.push({ collection: 'responses', path: `${rowId}.completion`, message: 'completion must be complete|partial|abandoned' });
  checkDate(issues, 'responses', rowId, 'createdAt', r.createdAt);
}

function validateParticipant(issues: ValidationIssue[], value: unknown, seen: Set<string>): void {
  const p = value as Partial<ParticipantRecord>;
  const rowId = typeof p.id === 'string' ? p.id : '?';
  checkId(issues, 'participants', p.id, seen);
  checkString(issues, 'participants', rowId, 'name', p.name);
  checkString(issues, 'participants', rowId, 'email', p.email);
  checkString(issues, 'participants', rowId, 'region', p.region);
  if (typeof p.optedIn !== 'boolean') issues.push({ collection: 'participants', path: `${rowId}.optedIn`, message: 'optedIn must be a boolean' });
  if (typeof p.totalResponses !== 'number' || p.totalResponses < 0) issues.push({ collection: 'participants', path: `${rowId}.totalResponses`, message: 'totalResponses must be a non-negative number' });
  checkDate(issues, 'participants', rowId, 'createdAt', p.createdAt);
}

/** Validates the full enterprise fixture payload; returns [] when valid. */
export function validateFixtures(fixtures: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!isRecord(fixtures)) return [{ collection: 'root', path: 'fixtures', message: 'fixture payload must be an object' }];

  const seenSurveys = new Set<string>();
  const seenResponses = new Set<string>();
  const seenParticipants = new Set<string>();

  const root = fixtures as Record<string, unknown>;
  const surveys = root['surveys'];
  if (!Array.isArray(surveys)) issues.push({ collection: 'surveys', path: 'surveys', message: 'surveys must be an array' });
  else surveys.forEach((row) => validateSurvey(issues, row, seenSurveys));

  const responses = root['responses'];
  if (!Array.isArray(responses)) issues.push({ collection: 'responses', path: 'responses', message: 'responses must be an array' });
  else responses.forEach((row) => validateResponse(issues, row, seenResponses));

  const participants = root['participants'];
  if (!Array.isArray(participants)) issues.push({ collection: 'participants', path: 'participants', message: 'participants must be an array' });
  else participants.forEach((row) => validateParticipant(issues, row, seenParticipants));

  // Cross references must resolve within the payload.
  if (Array.isArray(responses) && Array.isArray(surveys) && Array.isArray(participants)) {
    for (const row of responses) {
      const r = row as Partial<ResponseRecord>;
      if (typeof r.surveyId === 'string' && !seenSurveys.has(r.surveyId)) issues.push({ collection: 'responses', path: `${r.id}.surveyId`, message: `references unknown survey "${r.surveyId}"` });
      if (typeof r.participantId === 'string' && !seenParticipants.has(r.participantId)) issues.push({ collection: 'responses', path: `${r.id}.participantId`, message: `references unknown participant "${r.participantId}"` });
    }
  }

  return issues;
}

/** Loads fixture data from URL paths through the browser fetch API. */
export async function loadFixtureFiles(baseUrl: string, fetcher: (url: string) => Promise<Response> = fetch): Promise<EnterpriseFixtures> {
  const manifestUrl = `${baseUrl}/manifest.json`;
  const manifest = (await (await fetcher(manifestUrl)).json()) as { fixtures: Record<string, string> };
  const load = async <T>(key: string): Promise<T> => {
    const url = `${baseUrl}/${manifest.fixtures[key]}`;
    return (await (await fetcher(url)).json()) as T;
  };
  const fixtures: EnterpriseFixtures = {
    surveys: await load('surveys'),
    responses: await load('responses'),
    participants: await load('participants'),
    notifications: await load('notifications'),
    activity: await load('activity'),
    quickActions: await load('quickActions'),
    helpContent: await load('helpContent'),
    shortcuts: await load('shortcuts'),
  };
  const issues = validateFixtures(fixtures);
  if (issues.length > 0) {
    throw new Error(`Enterprise fixtures failed validation: ${issues.map((i) => `${i.collection}:${i.path} ${i.message}`).join('; ')}`);
  }
  return fixtures;
}
