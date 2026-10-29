import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readNight } from '../src/digest/read.js';

describe('readNight on runs/2026-10-28.jsonl', () => {
  const night = readNight('runs', '2026-10-28')!;
  const row = (job: string) => night.rows.find((r) => r.job === job)!;

  it('has 5 jobs sorted by job and 1 bad line', () => {
    expect(night.badLines).toBe(1);
    expect(night.rows.map((r) => r.job)).toEqual([
      'digest/render',
      'fixtures/refresh',
      'lane/sync',
      'notes/backup',
      'rig/rotate-logs',
    ]);
  });

  it('counts retries and keeps the last status', () => {
    expect(row('fixtures/refresh')).toMatchObject({ runs: 4, retries: 3, lastStatus: 'ok' });
    expect(row('lane/sync')).toMatchObject({ retries: 1, lastStatus: 'ok' });
  });

  it('keeps the fail and its error', () => {
    expect(row('notes/backup')).toMatchObject({ lastStatus: 'fail', lastError: 'quota exceeded' });
  });

  it('keeps the row with a null owner', () => {
    expect(row('digest/render').owner).toBeNull();
  });

  it('keeps the log offset on times', () => {
    expect(row('fixtures/refresh')).toMatchObject({
      firstAt: '2026-10-29T01:30:00+01:00',
      lastAt: '2026-10-29T01:37:00+01:00',
    });
  });
});

describe('readNight edges', () => {
  const dir = mkdtempSync(join(tmpdir(), 'rig-runs-'));

  it('returns an empty night for an empty file', () => {
    writeFileSync(join(dir, '2026-01-01.jsonl'), '');
    expect(readNight(dir, '2026-01-01')).toEqual({ rows: [], badLines: 0 });
  });

  it('returns null for a missing file', () => {
    expect(readNight(dir, '2026-01-02')).toBeNull();
  });
});
