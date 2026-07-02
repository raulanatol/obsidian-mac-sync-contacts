import { Contact } from '../contacts/Contact';
import { normalizePath, TFile } from 'obsidian';
import { Context } from '../obsidian/Context';
import { formatBirthday } from './formatBirthday';
import { getGroupLetter, slugify } from '../contacts/slugify';
import { applyFieldMappings } from './contactFields';

const toYamlInlineArray = (values: string[] | undefined): string => {
  if (!values || values.length === 0) {
    return '[]';
  }
  return '[' + values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ') + ']';
};

export type SyncStatus = 'created' | 'updated' | 'skipped' | 'failed';

export interface SyncResult {
  status: SyncStatus;
  path: string;
  name: string;
  error?: string;
}

export class SyncContactAction {
  readonly contact: Contact;
  readonly context: Context;
  readonly forceUpdate: boolean;

  constructor(context: Context, contact: Contact, forceUpdate = false) {
    this.context = context;
    this.contact = contact;
    this.forceUpdate = forceUpdate;
  }

  getContactFolder(): string {
    const root = this.context.settings.contactsFolder;
    if (!this.context.settings.groupByFirstLetter) {
      return root;
    }
    return root + '/' + getGroupLetter(this.contact.name);
  }

  getFilepath(): string {
    const filename = slugify(this.contact.name);
    return normalizePath(this.getContactFolder() + '/' + filename + '.md');
  }

  replaceTemplateVariables(body: string): string {
    const contactURL = this.contact.uid ? `addressbook://${encodeURIComponent(this.contact.uid)}` : '';

    let result = body
      .replace(/{{contactName}}/g, this.contact.name)
      .replace(/{{contactUID}}/g, this.contact.uid ?? '')
      .replace(/{{contactURL}}/g, contactURL)
      .replace(/{{contactNickname}}/g, this.contact.nickname ?? '')
      .replace(/{{contactEmail}}/g, this.contact.emails?.[0] ?? '')
      .replace(/{{contactPhone}}/g, this.contact.phones?.[0] ?? '')
      .replace(/{{contactWebsite}}/g, this.contact.website?.[0] ?? '')
      .replace(/{{contactAddress}}/g, this.contact.address?.[0] ?? '')
      .replace(/{{contactEmails}}/g, toYamlInlineArray(this.contact.emails))
      .replace(/{{contactPhones}}/g, toYamlInlineArray(this.contact.phones))
      .replace(/{{contactWebsites}}/g, toYamlInlineArray(this.contact.website))
      .replace(/{{contactAddresses}}/g, toYamlInlineArray(this.contact.address))
      .replace(/{{contactBirthday}}/g, this.contact.birthday ? formatBirthday(this.contact.birthday) : '')
      .replace(/{{snake_contactName}}/g, this.contact.name.toLowerCase().replace(/ /g, '_'));

    return applyFieldMappings(result, this.contact, this.context.settings.fieldMappings);
  }

  async execute(): Promise<SyncResult> {
    await this.createContactsFolder();
    const path = this.getFilepath();
    const name = this.contact.name;
    const existing = await this.context.fileHelper.getAbstractFileByPath(path);

    if (!(existing instanceof TFile)) {
      await this.createContact();
      return { status: 'created', path, name };
    }

    if (!this.context.settings.updateContacts && !this.forceUpdate) {
      return { status: 'skipped', path, name };
    }

    await this.updateContactIn(existing);
    return { status: 'updated', path, name };
  }

  private async createContactsFolder(): Promise<void> {
    await this.context.fileHelper.createFolderIfNotExists(this.context.settings.contactsFolder);
    if (this.context.settings.groupByFirstLetter) {
      await this.context.fileHelper.createFolderIfNotExists(this.getContactFolder());
    }
  }

  private toMarkdown(): string {
    const rawMarkdown = this.context.settings.contactTemplate;
    return this.replaceTemplateVariables(rawMarkdown);
  }

  private toProperties(): string {
    return this.replaceTemplateVariables(this.context.settings.propertiesTemplate);
  }

  private toContent(): string {
    return `${this.toProperties()}\n${this.toMarkdown()}`;
  }

  private async createContact(): Promise<void> {
    await this.context.fileHelper.create(this.getFilepath(), this.toContent());
  }

  private async updateContactIn(file: TFile) {
    await this.context.fileHelper.process(file, () => this.toContent());
  }
}
