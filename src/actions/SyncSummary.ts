import { SyncResult } from './SyncContactAction';

export interface SyncSummaryStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

export const computeStats = (results: SyncResult[]): SyncSummaryStats => ({
  total: results.length,
  created: results.filter(r => r.status === 'created').length,
  updated: results.filter(r => r.status === 'updated').length,
  skipped: results.filter(r => r.status === 'skipped').length,
  failed: results.filter(r => r.status === 'failed').length
});

const pad = (n: number): string => n.toString().padStart(2, '0');

const formatTimestamp = (date: Date): string => {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const stripExtension = (path: string): string => path.replace(/\.md$/, '');

const toWikiLink = (result: SyncResult): string => `- [[${stripExtension(result.path)}|${result.name}]]`;

const renderSection = (title: string, results: SyncResult[]): string => {
  if (results.length === 0) {
    return `## ${title}\n\n_(none)_`;
  }
  return `## ${title}\n\n${results.map(toWikiLink).join('\n')}`;
};

const renderFailedSection = (results: SyncResult[]): string => {
  if (results.length === 0) {
    return `## Failed\n\n_(none)_`;
  }
  const lines = results.map(r => `- **${r.name}** — ${r.error ?? 'unknown error'}`);
  return `## Failed\n\n${lines.join('\n')}`;
};

export interface SyncSummaryOptions {
  updateContacts: boolean;
}

export const buildSyncSummary = (results: SyncResult[], timestamp: Date, options: SyncSummaryOptions): string => {
  const stats = computeStats(results);
  const created = results.filter(r => r.status === 'created');
  const updated = results.filter(r => r.status === 'updated');
  const failed = results.filter(r => r.status === 'failed');
  const skippedNote = options.updateContacts ? '' : ' (existing, `updateContacts` off)';

  return [
    `# Mac Contacts Sync — ${formatTimestamp(timestamp)}`,
    '',
    `- Total: ${stats.total}`,
    `- Created: ${stats.created}`,
    `- Updated: ${stats.updated}`,
    `- Skipped: ${stats.skipped}${skippedNote}`,
    `- Failed: ${stats.failed}`,
    '',
    renderSection('Created', created),
    '',
    renderSection('Updated', updated),
    '',
    renderFailedSection(failed),
    ''
  ].join('\n');
};
