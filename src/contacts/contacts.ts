// @ts-ignore
import VCard from 'vcard-parser';
import { Contact } from './Contact';
import { runOsaScript } from './osascript';

const buildScript = (): string => {
  return `
		tell application "Contacts"
			activate
			set vCardText to (get vcard of every person) as text
		end tell
	`;
};

const buildScriptByUid = (uid: string): string => {
  const escapedUid = uid.replace(/"/g, '\\"');
  return `
		tell application "Contacts"
			activate
			set thePerson to first person whose id is "${escapedUid}"
			set vCardText to (get vcard of thePerson) as text
		end tell
	`;
};

const parseContacts = (rawContacts: unknown) => {
  if (typeof rawContacts !== 'string') {
    throw new Error(`Result is not a string. ${rawContacts}`);
  }

  const regex = /BEGIN:VCARD[\s\S]*?END:VCARD/g;
  const matches = rawContacts.match(regex);

  const contacts: Contact[] = [];

  if (matches) {
    matches.forEach((match, _) => {
      const vcard = VCard.parse(match);
      contacts.push(Contact.fromRaw(vcard));
    });
  }

  return contacts;
};

export const getContacts = async (): Promise<Contact[]> => {
  const result = await runOsaScript(buildScript());
  return parseContacts(result);
};

export const getContactByUid = async (uid: string): Promise<Contact | null> => {
  const result = await runOsaScript(buildScriptByUid(uid));
  const contacts = parseContacts(result);
  return contacts.length > 0 ? contacts[0] : null;
};
