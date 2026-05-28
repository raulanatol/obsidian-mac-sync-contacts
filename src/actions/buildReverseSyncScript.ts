import { escapeAppleScriptString } from '../contacts/applescript';

export interface ContactPayload {
  name: string;
  emails: string[];
  phones: string[];
  websites: string[];
  addresses: string[];
  birthday?: Date;
  uid?: string;
}

const splitName = (fullName: string): { first: string; last: string } => {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { first: '', last: '' };
  }
  const idx = trimmed.indexOf(' ');
  if (idx === -1) {
    return { first: trimmed, last: '' };
  }
  return {
    first: trimmed.slice(0, idx),
    last: trimmed.slice(idx + 1)
  };
};

const quote = (value: string): string => `"${escapeAppleScriptString(value)}"`;

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const buildBirthdayBlock = (date: Date): string => {
  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return [
    '    set bDate to current date',
    `    set day of bDate to ${day}`,
    `    set month of bDate to ${month}`,
    `    set year of bDate to ${year}`,
    '    set time of bDate to 0',
    '    set birth date of thePerson to bDate'
  ].join('\n');
};

const buildSubItems = (payload: ContactPayload): string => {
  const lines: string[] = [];

  for (const email of payload.emails) {
    lines.push(
      `    make new email at end of emails of thePerson with properties {value:${quote(email)}, label:"work"}`
    );
  }
  for (const phone of payload.phones) {
    lines.push(
      `    make new phone at end of phones of thePerson with properties {value:${quote(phone)}, label:"mobile"}`
    );
  }
  for (const website of payload.websites) {
    lines.push(`    make new url at end of urls of thePerson with properties {value:${quote(website)}, label:"home"}`);
  }
  for (const address of payload.addresses) {
    lines.push(
      `    make new address at end of addresses of thePerson with properties {street:${quote(address)}, label:"home"}`
    );
  }
  if (payload.birthday) {
    lines.push(buildBirthdayBlock(payload.birthday));
  }

  return lines.join('\n');
};

export const buildReverseSyncScript = (payload: ContactPayload): string => {
  const { first, last } = splitName(payload.name);
  const lookupBlock = payload.uid
    ? [
        '  set foundPerson to missing value',
        '  try',
        `    set foundPerson to first person whose id is ${quote(payload.uid)}`,
        '  end try'
      ].join('\n')
    : '  set foundPerson to missing value';

  const subItems = buildSubItems(payload);

  return `tell application "Contacts"
${lookupBlock}
  if foundPerson is missing value then
    set thePerson to make new person with properties {first name:${quote(first)}, last name:${quote(last)}}
  else
    set thePerson to foundPerson
    set first name of thePerson to ${quote(first)}
    set last name of thePerson to ${quote(last)}
    delete every email of thePerson
    delete every phone of thePerson
    delete every url of thePerson
    delete every address of thePerson
    try
      set birth date of thePerson to missing value
    end try
  end if
${subItems}
  save
  return id of thePerson
end tell`;
};
