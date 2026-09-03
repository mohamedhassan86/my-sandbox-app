import { Component } from '@angular/core';
import { SurveyViewComponent } from './survey/pages/survey-view/survey-view';

@Component({
  imports: [SurveyViewComponent],
  selector: 'app-root',
  template: '<app-survey-view />',
})
export class App {}
