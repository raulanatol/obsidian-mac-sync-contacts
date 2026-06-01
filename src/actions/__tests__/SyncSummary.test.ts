import { describe, expect, it } from 'vitest';
import { buildSyncSummary, computeStats } from '../SyncSummary';
import { SyncResult } from '../SyncContactAction';

const r = (status: SyncResult['status'], name: string, path = `People/${name}.md`, error?: string): SyncResult => ({
  status,
  name,
  path,
  error
});

describe('computeStats', () => {
  it('counts each status', () => {
    const results: SyncResult[] = [
      r('created', 'A'),
      r('created', 'B'),
      r('updated', 'C'),
      r('skipped', 'D'),
      r('skipped', 'E'),
      r('skipped', 'F'),
      r('failed', 'G', '', 'boom')
    ];
    expect(computeStats(results)).toEqual({ total: 7, created: 2, updated: 1, skipped: 3, failed: 1 });
  });

  it('handles empty input', () => {
    expect(computeStats([])).toEqual({ total: 0, created: 0, updated: 0, skipped: 0, failed: 0 });
  });
});

describe('buildSyncSummary', () => {
  const timestamp = new Date(2026, 4, 31, 15, 42); // 2026-05-31 15:42 local
  const options = { updateContacts: false };

  it('renders header with formatted timestamp', () => {
    const out = buildSyncSummary([], timestamp, options);
    expect(out).toContain('# Mac Contacts Sync — 2026-05-31 15:42');
  });

  it('shows totals and skipped note when updateContacts is off', () => {
    const out = buildSyncSummary([r('skipped', 'A')], timestamp, options);
    expect(out).toContain('- Total: 1');
    expect(out).toContain('- Skipped: 1 (existing, `updateContacts` off)');
  });

  it('omits skipped note when updateContacts is on', () => {
    const out = buildSyncSummary([r('skipped', 'A')], timestamp, { updateContacts: true });
    expect(out).toContain('- Skipped: 1\n');
    expect(out).not.toContain('updateContacts');
  });

  it('renders wikilinks under Created and Updated', () => {
    const out = buildSyncSummary(
      [r('created', 'John Doe', 'People/J/john-doe.md'), r('updated', 'Jane', 'People/J/jane.md')],
      timestamp,
      options
    );
    expect(out).toContain('## Created\n\n- [[People/J/john-doe|John Doe]]');
    expect(out).toContain('## Updated\n\n- [[People/J/jane|Jane]]');
  });

  it('shows (none) for empty sections', () => {
    const out = buildSyncSummary([r('skipped', 'A')], timestamp, options);
    expect(out).toContain('## Created\n\n_(none)_');
    expect(out).toContain('## Updated\n\n_(none)_');
    expect(out).toContain('## Failed\n\n_(none)_');
  });

  it('renders failures with their error message', () => {
    const out = buildSyncSummary([r('failed', 'Broken', '', 'osascript blew up')], timestamp, options);
    expect(out).toContain('## Failed\n\n- **Broken** — osascript blew up');
  });

  it('falls back to "unknown error" when no error message is present', () => {
    const out = buildSyncSummary([r('failed', 'Mystery', '')], timestamp, options);
    expect(out).toContain('- **Mystery** — unknown error');
  });
});
