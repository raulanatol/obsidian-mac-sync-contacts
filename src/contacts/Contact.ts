const cleanup = value => value.toLowerCase().replaceAll(' ', '');

const nameFromRaw = (fn: any): string => {
	if (!fn) {
		return '';
	}

	const rawValue = fn[0].value;
	return rawValue.replaceAll('/', ' ');
}

const phonesFromRaw = (tel: any): string[] | undefined => {
	if (!tel) {
		return undefined;
	}
	return tel.map(tel =>
		cleanup(tel.value));
}

const emailsFromRaw = (email: any): string[] | undefined => {
	if (!email) {
		return undefined;
	}

	return email.map(email =>
		cleanup(email.value));
};

const websitesFromRaw = (url): string[] | undefined => {
	if (!url) {
		return undefined;
	}

	return url.map(url =>
		cleanup(url.value));
};

const addressFromRaw = (adr): string[] | undefined => {
	if (!adr) {
		return undefined;
	}
	return adr.map(adr =>
		adr.value.filter(str => str.length).join(', '));
};

const birthdayFromRaw = (bday): Date | undefined => {
	if (!bday) {
		return undefined;
	}
	return new Date(Date.parse(cleanup(bday?.[0].value)));
}

interface ConstructorParams {
	name: string;
	phones: string[] | undefined;
	emails: string[] | undefined;
	website: any;
	address: any;
	birthday: Date | undefined;
}

export class Contact {
	name: string;
	phones: string[] | undefined;
	emails: string[] | undefined;
	website: string[] | undefined;
	address: string[] | undefined;
	birthday: Date | undefined;

	constructor(params: ConstructorParams) {
		this.name = params.name;
		this.phones = params.phones;
		this.emails = params.emails;
		this.website = params.website;
		this.address = params.address;
		this.birthday = params.birthday;
	}

	static fromRaw(raw: any): Contact {
		const name = nameFromRaw(raw.fn);
		const phones = phonesFromRaw(raw.tel);
		const emails = emailsFromRaw(raw.email);
		const website = websitesFromRaw(raw.url);
		const address = addressFromRaw(raw.adr);
		const birthday = birthdayFromRaw(raw.bday);
		return new Contact({
			name,
			phones,
			emails,
			website,
			address,
			birthday
		});
	}
}
