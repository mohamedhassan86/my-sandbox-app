import { describe, expect, it } from 'vitest';
import { SimulationService, SimulatedFailure } from './simulation.service';

describe('SimulationService', () => {
  it('returns the work result after its latency window', async () => {
    const service = new SimulationService();
    const started = Date.now();
    const value = await service.run(() => 42, 10);
    expect(value).toBe(42);
    expect(Date.now() - started).toBeGreaterThanOrEqual(10);
  });

  it('throws a typed SimulatedFailure when the next run is armed to fail', async () => {
    const service = new SimulationService();
    service.armNextFailure();
    await expect(service.run(() => 'data')).rejects.toBeInstanceOf(SimulatedFailure);
    // failure flag is one-shot
    await expect(service.run(() => 'again')).resolves.toBe('again');
  });

  it('runAction returns {ok:false} outcomes on injected failure without throwing', async () => {
    const service = new SimulationService();
    service.armNextFailure();
    const outcome = await service.runAction('bulk-archive', 3, 1);
    expect(outcome.ok).toBe(false);
    expect(outcome.error).toMatch(/simulated/i);
  });

  it('runAction returns success messages that reflect the payload count', async () => {
    const service = new SimulationService();
    const outcome = await service.runAction('bulk-archive', 3, 1);
    expect(outcome.ok).toBe(true);
    expect(outcome.message).toContain('3');
  });

  it('runAction never mutates its inputs (simulated transaction)', async () => {
    const service = new SimulationService();
    const payload = { title: 'Launch', audience: 'customers' };
    await service.runAction('launch-survey', payload, 1);
    expect(payload).toEqual({ title: 'Launch', audience: 'customers' });
  });

  it('exportCsv produces a header row and CSV-escaped cells', async () => {
    const service = new SimulationService();
    const { fileName, content } = await service.exportCsv(
      [
        { id: 'a', label: 'plain' },
        { id: 'b', label: 'with,comma' },
      ],
      null,
    );
    expect(fileName.endsWith('.csv')).toBe(true);
    const lines = content.split('\n');
    expect(lines[0]).toBe('id,label');
    expect(lines[1]).toBe('a,plain');
    expect(lines[2]).toBe('b,"with,comma"');
  });

  it('exportCsv throws SimulatedFailure when the export is armed to fail', async () => {
    const service = new SimulationService();
    service.armNextFailure();
    await expect(service.exportCsv([{ id: 'x' }], null)).rejects.toBeInstanceOf(SimulatedFailure);
  });
});
