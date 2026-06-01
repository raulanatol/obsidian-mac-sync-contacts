import { normalizePath } from 'obsidian';
import { getContacts } from '../contacts/contacts';
import { SyncContactAction, SyncResult } from './SyncContactAction';
import { Context } from '../obsidian/Context';
import { buildSyncSummary, computeStats, SyncSummaryStats } from './SyncSummary';

const SUMMARY_FILENAME = '_sync-summary.md';

export class SyncContactsAction {
  private readonly context: Context;

  constructor(context: Context) {
    this.context = context;
  }

  async execute(): Promise<SyncSummaryStats> {
    const contacts = await getContacts();
    const settled = await Promise.allSettled(
      contacts.map(contact => new SyncContactAction(this.context, contact).execute())
    );

    const results: SyncResult[] = settled.map((outcome, index) => {
      if (outcome.status === 'fulfilled') {
        return outcome.value;
      }
      const error = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
      return { status: 'failed', path: '', name: contacts[index].name, error };
    });

    if (this.context.settings.generateSummary) {
      await this.writeSummary(results);
    }

    return computeStats(results);
  }

  private async writeSummary(results: SyncResult[]): Promise<void> {
    const summary = buildSyncSummary(results, new Date(), {
      updateContacts: this.context.settings.updateContacts
    });
    const summaryPath = normalizePath(this.context.settings.contactsFolder + '/' + SUMMARY_FILENAME);
    await this.context.fileHelper.upsert(summaryPath, summary);
  }
}
