import { Routes } from '@angular/router';
import { SurveyViewComponent } from './survey/pages/survey-view/survey-view';

export const routes: Routes = [
	{ path: '', component: SurveyViewComponent },
	{ path: 'surveys/:surveyKey', component: SurveyViewComponent },
	{ path: 'enterprise', loadChildren: () => import('./enterprise/enterprise.routes').then((m) => m.ENTERPRISE_ROUTES) },
];
