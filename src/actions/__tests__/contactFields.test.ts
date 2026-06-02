import { describe, expect, it } from 'vitest';
import { Contact } from '../../contacts/Contact';
import { applyFieldMappings, resolveContactField } from '../contactFields';

const contact = new Contact({
  name: 'John Doe',
  phones: ['+34123', '+34999'],
  emails: ['john@doe.com', 'second@doe.com'],
  website: ['https://doe.com'],
  address: ['123 Main St, City'],
  birthday: new Date(Date.UTC(2021, 0, 1)),
  uid: 'AB-CD-EF-12'
});

describe('resolveContactField', () => {
  it('resolves the name', () => {
    expect(resolveContactField(contact, 'name')).toBe('John Doe');
  });

  it('resolves the uid', () => {
    expect(resolveContactField(contact, 'uid')).toBe('AB-CD-EF-12');
  });

  it('resolves the first email for multivalued fields', () => {
    expect(resolveContactField(contact, 'email')).toBe('john@doe.com');
    expect(resolveContactField(contact, 'phone')).toBe('+34123');
  });

  it('resolves website and address (first value)', () => {
    expect(resolveContactField(contact, 'website')).toBe('https://doe.com');
    expect(resolveContactField(contact, 'address')).toBe('123 Main St, City');
  });

  it('formats the birthday', () => {
    expect(resolveContactField(contact, 'birthday')).toBe('2021-01-01');
  });

  it('returns an empty string when the field is missing', () => {
    const empty = new Contact({
      name: 'No Data',
      phones: undefined,
      emails: undefined,
      website: undefined,
      address: undefined,
      birthday: undefined,
      uid: undefined
    });
    expect(resolveContactField(empty, 'email')).toBe('');
    expect(resolveContactField(empty, 'uid')).toBe('');
    expect(resolveContactField(empty, 'birthday')).toBe('');
  });
});

describe('applyFieldMappings', () => {
  it('replaces a custom alias with the mapped field value', () => {
    const result = applyFieldMappings("username: '{{username}}'", contact, [{ source: 'name', alias: 'username' }]);
    expect(result).toBe("username: 'John Doe'");
  });

  it('supports several aliases at once', () => {
    const result = applyFieldMappings('{{username}} <{{correo}}>', contact, [
      { source: 'name', alias: 'username' },
      { source: 'email', alias: 'correo' }
    ]);
    expect(result).toBe('John Doe <john@doe.com>');
  });

  it('replaces every occurrence of an alias', () => {
    const result = applyFieldMappings('{{username}}/{{username}}', contact, [{ source: 'name', alias: 'username' }]);
    expect(result).toBe('John Doe/John Doe');
  });

  it('ignores mappings with an empty or whitespace alias', () => {
    const result = applyFieldMappings('{{username}}', contact, [{ source: 'name', alias: '   ' }]);
    expect(result).toBe('{{username}}');
  });

  it('returns the body unchanged when there are no mappings', () => {
    expect(applyFieldMappings('{{username}}', contact)).toBe('{{username}}');
    expect(applyFieldMappings('{{username}}', contact, [])).toBe('{{username}}');
  });
});
