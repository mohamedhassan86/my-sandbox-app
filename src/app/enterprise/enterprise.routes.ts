import type { Routes } from '@angular/router';
import { EnterpriseShellComponent } from './layout/enterprise-shell/enterprise-shell';

export const ENTERPRISE_ROUTES: Routes = [
  {
    path: '',
    component: EnterpriseShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', loadComponent: () => import('./pages/home/home').then((m) => m.HomePageComponent) },
      { path: 'notifications', loadComponent: () => import('./pages/notifications/notifications').then((m) => m.NotificationsPageComponent) },
      { path: 'help', loadComponent: () => import('./pages/help/help').then((m) => m.HelpPageComponent) },
      { path: 'surveys', loadComponent: () => import('./pages/surveys/surveys').then((m) => m.SurveysPageComponent) },
      { path: 'surveys/:id', loadComponent: () => import('./pages/surveys/survey-detail').then((m) => m.SurveyDetailPageComponent) },
      { path: 'responses', loadComponent: () => import('./pages/responses/responses').then((m) => m.ResponsesPageComponent) },
      { path: 'responses/:id', loadComponent: () => import('./pages/responses/response-detail').then((m) => m.ResponseDetailPageComponent) },
      { path: 'participants', loadComponent: () => import('./pages/participants/participants').then((m) => m.ParticipantsPageComponent) },
      { path: 'participants/:id', loadComponent: () => import('./pages/participants/participant-detail').then((m) => m.ParticipantDetailPageComponent) },
      { path: 'launch', loadComponent: () => import('./pages/launch-survey/launch-survey').then((m) => m.LaunchSurveyPageComponent) },
      { path: '**', loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPageComponent) },
    ],
  },
];
