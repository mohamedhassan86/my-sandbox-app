import '@angular/compiler';
import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';
import type { Routes } from '@angular/router';

describe('survey routes', () => {
  it('keeps the default and dynamic survey URLs unchanged', () => {
    expect(routes.map((route) => route.path)).toEqual(['', 'surveys/:surveyKey', 'enterprise']);
  });

  it('keeps the survey-view component on the root route', () => {
    expect(routes[0]).toMatchObject({ path: '', component: expect.any(Function) });
    expect(routes[1]).toMatchObject({ path: 'surveys/:surveyKey', component: expect.any(Function) });
  });
});

describe('enterprise lazy route', () => {
  it('registers /enterprise as a lazy children module', () => {
    const enterprise = routes.find((route) => route.path === 'enterprise');
    expect(enterprise).toBeDefined();
    expect(typeof enterprise?.loadChildren).toBe('function');
  });

  it('lazy-loads the enterprise routes module containing shell children', async () => {
    const enterprise = routes.find((route) => route.path === 'enterprise');
    const children = await (enterprise!.loadChildren as () => Promise<Routes>)();
    const paths = children[0].children?.map((child) => child.path);
    expect(paths).toContain('home');
    expect(paths).toContain('**');
    expect(children[0].component).toBeDefined();
  });
});
