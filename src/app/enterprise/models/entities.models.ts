/**
 * Typed domain entities for the enterprise product area (specs/003 data-model.md).
 * Fixture-driven and read-only except for explicitly persisted user state.
 */

export type StatusKey = string;
export type IconKey = string;
export type RouteRef = string;

export interface DemoUserProfile {
  id: string;
  displayName: string;
  roleLabel: string;
}

export interface SurveyRecord {
  id: string;
  title: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  owner: string;
  questionCount: number;
  responseCount: number;
  targetAudience?: string;
  rating?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseRecord {
  id: string;
  surveyId: string;
  participantId: string;
  score: number; // 0..100
  durationMinutes: number;
  device?: string;
  completion: 'complete' | 'partial' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantRecord {
  id: string;
  name: string;
  email: string;
  region: string;
  optedIn: boolean;
  totalResponses: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type CollectionKey = 'surveys' | 'responses' | 'participants';
export type CollectionRow = SurveyRecord | ResponseRecord | ParticipantRecord;

export interface QuickAction {
  id: string;
  label: string;
  icon: IconKey;
  target: RouteRef;
  order: number;
}

export type ActivityTargetType = 'survey' | 'response' | 'participant' | 'view' | 'task' | 'page';

export interface RecentActivityEntry {
  id: string;
  targetType: ActivityTargetType;
  targetRef: RouteRef;
  title: string;
  occurredAt: string;
}

export type FavoriteTargetType = 'record' | 'view' | 'page';

export interface Favorite {
  id: string;
  targetType: FavoriteTargetType;
  targetRef: RouteRef;
  title: string;
  addedAt: string;
}

export type NotificationCategory = 'response' | 'survey' | 'participant' | 'system';
export type NotificationSeverity = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  title: string;
  body: string;
  deepLink?: RouteRef;
  createdAt: string;
}

export interface HelpTopic {
  locationKey: string;
  title: string;
  summary: string;
  link?: RouteRef;
}

export interface TourStep {
  id: string;
  target: string;
  title: string;
  body: string;
}

export interface ShortcutEntry {
  id: string;
  scope: 'global' | 'context';
  keys: string[];
  label: string;
  /** Command id resolved by the keyboard service. */
  action: string;
}
