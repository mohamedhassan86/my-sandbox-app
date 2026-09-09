import { Injectable, signal } from '@angular/core';
import type { EnterpriseFixtures } from '../models/fixtures.models';
import { loadFixtureFiles, validateFixtures } from './fixture-validator';
import { SimulationService } from './simulation.service';
import { CollectionsService } from './collections.service';

/**
 * Loads and validates the enterprise fixtures over HTTP (FR-045) and seeds the
 * read-only collections. Failure injection makes error/retry states real (FR-046).
 */
@Injectable({ providedIn: 'root' })
export class FixtureService {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly fixtures = signal<EnterpriseFixtures | null>(null);

  constructor(
    private readonly simulations: SimulationService,
    private readonly collections: CollectionsService,
  ) {}

  async load(baseUrl?: string, fetcher: (url: string) => Promise<Response> = fetch): Promise<EnterpriseFixtures> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const url = baseUrl ?? this.defaultBaseUrl();
      const fixtures = await this.simulations.run(() => loadFixtureFiles(url, fetcher), 350);
      this.fixtures.set(fixtures);
      this.collections.seed({
        surveys: fixtures.surveys,
        responses: fixtures.responses,
        participants: fixtures.participants,
      });
      return fixtures;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'Unknown error';
      this.error.set(message);
      throw cause;
    } finally {
      this.loading.set(false);
    }
  }

  /** Validates an arbitrary payload (used by tests + content checks). */
  validate(payload: unknown): string[] {
    return validateFixtures(payload).map((issue) => `${issue.collection}:${issue.path} ${issue.message}`);
  }

  private defaultBaseUrl(): string {
    if (typeof window === 'undefined') return '/enterprise-fixtures';
    return new URL('/enterprise-fixtures', window.location.origin).href.replace(/\/$/, '');
  }
}
