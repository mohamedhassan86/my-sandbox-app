import type {
  AppNotification,
  HelpTopic,
  QuickAction,
  RecentActivityEntry,
  ShortcutEntry,
  SurveyRecord,
  ResponseRecord,
  ParticipantRecord,
  TourStep,
} from './entities.models';

/** Shape of public/enterprise-fixtures/manifest.json */
export interface EnterpriseManifest {
  area: 'enterprise';
  version: number;
  fixtures: {
    surveys: string;
    responses: string;
    participants: string;
    notifications: string;
    activity: string;
    quickActions: string;
    helpContent: string;
    shortcuts: string;
  };
}

export interface EnterpriseFixtures {
  surveys: SurveyRecord[];
  responses: ResponseRecord[];
  participants: ParticipantRecord[];
  notifications: AppNotification[];
  activity: RecentActivityEntry[];
  quickActions: QuickAction[];
  helpContent: { helpTopics: HelpTopic[]; tourSteps: TourStep[] };
  shortcuts: ShortcutEntry[];
}
