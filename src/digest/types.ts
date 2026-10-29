export type RunStatus = 'ok' | 'retry' | 'fail';

// One row per job for a night. Times are the log's own strings, offset kept (styleguide).
export type DigestRow = {
  job: string;
  owner: string | null;
  runs: number;
  retries: number;
  lastStatus: RunStatus;
  lastError: string | null;
  firstAt: string;
  lastAt: string;
};

// rows sorted by job; badLines = lines that didn't parse or validate. An empty file is
// { rows: [], badLines: 0 }.
export type Night = { rows: DigestRow[]; badLines: number };

// Returns null when runs/<night>.jsonl doesn't exist (or night isn't YYYY-MM-DD): the page 404s.
export type ReadNight = (runsDir: string, night: string) => Night | null;
