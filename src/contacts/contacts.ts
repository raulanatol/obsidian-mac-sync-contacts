// @ts-ignore
import VCard from 'vcard-parser';
import { Contact } from './Contact';
import { runOsaScript } from './osascript';

const buildScript = (group: string): string => {
  const escapedGroup = group.replace(/"/g, '\\"');
  return `
		tell application "Contacts"
			activate
			set vCardText to (get vcard of every person in group "${escapedGroup}") as text
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

export const getContacts = async (group: string): Promise<Contact[]> => {
  const result = await runOsaScript(buildScript(group));
  return parseContacts(result);
};
