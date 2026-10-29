import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLine } from './read.js';
import type { RunStatus } from './types.js';

export type StatusCounts = Record<RunStatus, number>;

// Counts RUN LINES by status across the whole night (not jobs): a job that retried twice and
// then succeeded adds 2 to retry and 1 to ok. Lines that don't parse are skipped (the digest
// page reports them as badLines). Rows can't give this: they keep only runs, retries and the
// last status. A missing or unreadable night counts as zeros.
export function countStatuses(text: string): StatusCounts {
  const counts: StatusCounts = { ok: 0, retry: 0, fail: 0 };
  for (const raw of text.split('\n')) {
    if (raw.trim() === '') continue;
    const line = parseLine(raw);
    if (line) counts[line.status]++;
  }
  return counts;
}

export function countNight(runsDir: string, night: string): StatusCounts {
  try {
    return countStatuses(readFileSync(join(runsDir, `${night}.jsonl`), 'utf8'));
  } catch {
    return { ok: 0, retry: 0, fail: 0 };
  }
}
