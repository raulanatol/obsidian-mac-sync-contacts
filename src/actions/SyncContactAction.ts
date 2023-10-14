import { Contact } from '../contacts/Contact';
import { normalizePath, TFile } from 'obsidian';
import { Context } from '../obsidian/Context';

export class SyncContactAction {
	readonly contact: Contact;
	readonly context: Context;

	constructor(context: Context, contact: Contact) {
		this.context = context;
		this.contact = contact;
	}

	getFilepath(): string {
		return normalizePath(this.context.settings.contactsFolder + '/' + this.contact.name + '.md');
	}

	async execute() {
		await this.createContactsFolder();
		const filename = await this.context.fileHelper.getAbstractFileByPath(this.getFilepath());
		if (!(filename instanceof TFile)) {
			await this.createContact();
			return;
		}

		console.log('SyncContactAction.ts [27] UPDATE', this.contact);
	}

	private async createContactsFolder(): Promise<void> {
		return this.context.fileHelper.createFolderIfNotExists(this.context.settings.contactsFolder);
	}

	private async createContact(): Promise<void> {
		await this.context.fileHelper.create(this.getFilepath(), this.toMarkdown());
	}

	private toMarkdown(): string {
		return `
# ${this.contact.name}
		`;
	}
}
