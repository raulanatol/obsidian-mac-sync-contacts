import { spawn } from 'child_process';
// @ts-ignore
import VCard from 'vcard-parser';
import { Contact } from './Contact';

const SCRIPT = `
	tell application "Contacts"
		activate
		set vCardText to (get vcard of every person in group "obsidian") as text
	end tell
`;

const getRawContacts = () => {
	return new Promise((resolve, reject) => {
		const command = spawn('osascript', ['-e', SCRIPT]);
		let output = '';
		let errorOutput = '';

		command.stdout.on('data', (data) => {
			output += data;
		});

		command.stderr.on('data', (data) => {
			errorOutput += data;
		});

		command.on('close', (code) => {
			if (code != 0) {
				return reject(new Error(`Command failed with exit code ${code}: ${errorOutput}`));
			}
			resolve(output);
		});

		command.on('error', (error) => {
			reject(error);
		});
	});
}

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

export const getContacts = async () => {
	const result = await getRawContacts();
	const contacts = parseContacts(result);
	console.log('contacts.ts [12]', contacts);
}
