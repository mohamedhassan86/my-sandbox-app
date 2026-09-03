import { App } from './app';
import { describe, expect, it } from 'vitest';

describe('App', () => {
  it('creates the application root', () => {
    expect(new App()).toBeTruthy();
  });
});
