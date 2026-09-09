import { Injectable } from '@angular/core';
import type { CollectionKey } from '../models/entities.models';
import type { DataView } from '../models/state.models';

export interface SimulatedOutcome {
  ok: boolean;
  message?: string;
  error?: string;
}

export type SimulatedActionKind = 'bulk-archive' | 'bulk-delete' | 'launch-survey' | 'export';

export interface SimulationOptions {
  /** Base latency in ms applied to every simulated operation. */
  latencyMs: number;
  /** When true, the next operation of any kind fails once (then resets). */
  failNext?: boolean;
}

export class SimulatedFailure extends Error {
  constructor(message = 'The simulated service could not complete the request.') {
    super(message);
    this.name = 'SimulatedFailure';
  }
}

/**
 * Applies deterministic latency and an injectable failure mode so loading and
 * error/retry states are real and testable (FR-046). Never touches fixture data.
 */
@Injectable({ providedIn: 'root' })
export class SimulationService {
  private failNextFlag = false;

  setOptions(_options: SimulationOptions): void {
    // Retained for API compatibility; test hooks drive failNext directly.
  }

  armNextFailure(): void {
    this.failNextFlag = true;
  }

  disarmFailure(): void {
    this.failNextFlag = false;
  }

  private async delay(ms: number): Promise<void> {
    if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** Simulated async read with latency and an optional injected failure. */
  async run<T>(work: () => T, latencyMs = 300): Promise<T> {
    await this.delay(latencyMs);
    if (this.failNextFlag) {
      this.failNextFlag = false;
      throw new SimulatedFailure();
    }
    return work();
  }

  /** Simulated mutating transaction. Reports an outcome; does NOT mutate fixtures (FR-026). */
  async runAction(kind: SimulatedActionKind, countOrPayload: number | Record<string, unknown>, latencyMs = 500): Promise<SimulatedOutcome> {
    await this.delay(latencyMs);
    if (this.failNextFlag) {
      this.failNextFlag = false;
      return { ok: false, error: `The ${kind} action failed on the simulated service.` };
    }
    const count = typeof countOrPayload === 'number' ? countOrPayload : 1;
    const messages: Record<SimulatedActionKind, string> = {
      'bulk-archive': `Archived ${count} survey(s) (simulated).`,
      'bulk-delete': `Deleted ${count} record(s) (simulated).`,
      'launch-survey': 'Survey launched (simulated).',
      export: 'Export generated (simulated).',
    };
    return { ok: true, message: messages[kind] };
  }

  /** Simulated export generator producing a local file download. */
  async exportCsv(rows: Record<string, unknown>[], _view: DataView | null): Promise<{ fileName: string; content: string }> {
    await this.delay(400);
    if (this.failNextFlag) {
      this.failNextFlag = false;
      throw new SimulatedFailure('Export failed on the simulated service.');
    }
    const headers = rows.length ? Object.keys(rows[0]) : ['id'];
    const escapeCell = (v: unknown): string => {
      const text = v == null ? '' : String(v);
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };
    const content = [headers.join(','), ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(','))].join('\n');
    return { fileName: `survey-hub-export-${new Date().toISOString().slice(0, 10)}.csv`, content };
  }
}

/** Resolves fixture files when tests need a deterministic URL. */
export function fixtureBasePath(): string {
  return new URL('/enterprise-fixtures', window.location.origin).href;
}

/** Collection metadata used across the area (columns/route/keys). */
export const COLLECTIONS: Record<CollectionKey, { label: string; route: string }> = {
  surveys: { label: 'Surveys', route: '/enterprise/surveys' },
  responses: { label: 'Responses', route: '/enterprise/responses' },
  participants: { label: 'Participants', route: '/enterprise/participants' },
};
