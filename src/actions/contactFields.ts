import { Contact } from '../contacts/Contact';
import { formatBirthday } from './formatBirthday';

export const CONTACT_FIELD_KEYS = ['name', 'nickname', 'uid', 'email', 'phone', 'website', 'address', 'birthday'] as const;

export type ContactFieldKey = (typeof CONTACT_FIELD_KEYS)[number];

export const CONTACT_FIELD_LABELS: Record<ContactFieldKey, string> = {
  name: 'Name',
  nickname: 'Nickname',
  uid: 'UID',
  email: 'Email (first)',
  phone: 'Phone (first)',
  website: 'Website (first)',
  address: 'Address (first)',
  birthday: 'Birthday'
};

export interface FieldMapping {
  source: ContactFieldKey;
  alias: string;
}

/**
 * Resolve a single contact field to its scalar value. For multivalued fields
 * (emails, phones, websites, addresses) the first value is used, matching the
 * behaviour of the built-in {{contactEmail}}/{{contactPhone}}/... variables.
 */
export const resolveContactField = (contact: Contact, key: ContactFieldKey): string => {
  switch (key) {
    case 'name':
      return contact.name;
    case 'nickname':
      return contact.nickname ?? '';
    case 'uid':
      return contact.uid ?? '';
    case 'email':
      return contact.emails?.[0] ?? '';
    case 'phone':
      return contact.phones?.[0] ?? '';
    case 'website':
      return contact.website?.[0] ?? '';
    case 'address':
      return contact.address?.[0] ?? '';
    case 'birthday':
      return contact.birthday ? formatBirthday(contact.birthday) : '';
  }
};

/**
 * Replace every {{alias}} defined in the user's field mappings with the
 * resolved contact value. Mappings with an empty alias are ignored.
 */
const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const applyFieldMappings = (body: string, contact: Contact, mappings: FieldMapping[] = []): string => {
  let result = body;
  for (const mapping of mappings) {
    const alias = mapping.alias?.trim();
    if (!alias) {
      continue;
    }
    const value = resolveContactField(contact, mapping.source);
    result = result.replace(new RegExp(`{{${escapeRegExp(alias)}}}`, 'g'), () => value);
  }
  return result;
};
