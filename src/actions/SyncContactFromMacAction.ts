import { TFile } from 'obsidian';
import { Context } from '../obsidian/Context';
import { getContactByUid } from '../contacts/contacts';
import { SyncContactAction, SyncResult } from './SyncContactAction';

export class SyncContactFromMacAction {
  readonly context: Context;
  readonly file: TFile;

  constructor(context: Context, file: TFile) {
    this.context = context;
    this.file = file;
  }

  async execute(): Promise<SyncResult> {
    const cache = this.context.app.metadataCache.getFileCache(this.file);
    const frontmatter = cache?.frontmatter;
    const uid = frontmatter?.contactUID as string | undefined;

    if (!uid) {
      return {
        status: 'failed',
        path: this.file.path,
        name: this.file.basename,
        error: 'Contact file has no contactUID in frontmatter'
      };
    }

    const contact = await getContactByUid(uid);
    if (!contact) {
      return {
        status: 'failed',
        path: this.file.path,
        name: this.file.basename,
        error: `Contact with UID ${uid} not found in Mac Contacts`
      };
    }

    return new SyncContactAction(this.context, contact, true).execute();
  }
}