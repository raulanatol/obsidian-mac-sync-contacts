import { Contact } from '../contacts/Contact';
import { getContacts } from '../contacts/contacts';
import { SyncContactAction } from './SyncContactAction';
import { Context } from '../obsidian/Context';

export class SyncContactsAction {
	private readonly context: Context;

	constructor(context: Context) {
		this.context = context;
	}

	async execute(): Promise<Contact[]> {
		const contacts = await getContacts();

		await new SyncContactAction(this.context, contacts[0]).execute();

		// const promises = contacts.map(contact => new SyncContactAction(this.context, contact).execute());
		// await Promise.all(promises);
		return contacts;
	}
}
