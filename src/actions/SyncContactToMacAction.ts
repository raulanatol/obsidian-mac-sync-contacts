import { TFile } from 'obsidian';
import { Context } from '../obsidian/Context';
import { runOsaScript } from '../contacts/osascript';
import { buildReverseSyncScript, ContactPayload } from './buildReverseSyncScript';

const toArray = (value: unknown): string[] => {
  if (value === undefined || value === null || value === '') {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(item => item.length > 0);
  }
  return [String(value)];
};

const toOptionalString = (value: unknown): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return String(value);
};

const toOptionalDate = (value: unknown): Date | undefined => {
  const str = toOptionalString(value);
  if (!str) {
    return undefined;
  }
  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) {
    return undefined;
  }
  return parsed;
};

export const buildPayloadFromFrontmatter = (frontmatter: Record<string, unknown> | undefined): ContactPayload => {
  if (!frontmatter) {
    return { name: '', emails: [], phones: [], websites: [], addresses: [] };
  }
  return {
    name: toOptionalString(frontmatter.name) ?? '',
    uid: toOptionalString(frontmatter.contactUID),
    emails: toArray(frontmatter.emails),
    phones: toArray(frontmatter.phones),
    websites: toArray(frontmatter.websites),
    addresses: toArray(frontmatter.addresses),
    birthday: toOptionalDate(frontmatter.birthday)
  };
};

export class SyncContactToMacAction {
  readonly context: Context;
  readonly file: TFile;

  constructor(context: Context, file: TFile) {
    this.context = context;
    this.file = file;
  }

  async execute(): Promise<{ created: boolean; uid: string }> {
    const cache = this.context.app.metadataCache.getFileCache(this.file);
    const frontmatter = cache?.frontmatter;
    const payload = buildPayloadFromFrontmatter(frontmatter);

    if (!payload.name) {
      throw new Error(`Contact file has no 'name' in the frontmatter`);
    }

    const hadUid = Boolean(payload.uid);
    const script = buildReverseSyncScript(payload);
    const output = await runOsaScript(script);
    const newUid = output.trim();

    if (!newUid) {
      throw new Error('osascript returned an empty UID');
    }

    const created = !hadUid || newUid !== payload.uid;
    if (created) {
      await this.context.app.fileManager.processFrontMatter(this.file, fm => {
        fm.contactUID = newUid;
      });
    }

    return { created, uid: newUid };
  }
}
