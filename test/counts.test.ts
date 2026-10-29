import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { countNight, countStatuses } from '../src/digest/counts.js';

const line = (job: string, status: string) =>
  JSON.stringify({ at: '2026-10-28T01:00:00+01:00', job, status, owner: null });

describe('countStatuses', () => {
  it('counts run lines by status and skips bad lines', () => {
    const text = [line('a', 'retry'), line('a', 'retry'), line('a', 'ok'), line('b', 'fail'), 'garbage', ''].join('\n');
    expect(countStatuses(text)).toEqual({ ok: 1, retry: 2, fail: 1 });
  });

  it('counts an empty night as zeros', () => {
    expect(countStatuses('')).toEqual({ ok: 0, retry: 0, fail: 0 });
  });

  it('reads a night file from a temp dir, zeros when missing', () => {
    const dir = mkdtempSync(join(tmpdir(), 'rig-counts-'));
    writeFileSync(join(dir, '2026-01-01.jsonl'), line('a', 'ok') + '\n');
    expect(countNight(dir, '2026-01-01')).toEqual({ ok: 1, retry: 0, fail: 0 });
    expect(countNight(dir, '2026-01-02')).toEqual({ ok: 0, retry: 0, fail: 0 });
  });
});
