import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('survey routes', () => {
  it('supports the default and dynamic survey URLs', () => {
    expect(routes.map((route) => route.path)).toEqual(['', 'surveys/:surveyKey']);
  });
});