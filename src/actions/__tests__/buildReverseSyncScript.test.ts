import { describe, expect, it } from 'vitest';
import { buildReverseSyncScript, ContactPayload } from '../buildReverseSyncScript';

const basePayload: ContactPayload = {
  name: 'John Doe',
  emails: [],
  phones: [],
  websites: [],
  addresses: []
};

describe('buildReverseSyncScript', () => {
  it('wraps the script in a Contacts tell block', () => {
    const script = buildReverseSyncScript(basePayload);
    expect(script.startsWith('tell application "Contacts"')).toBe(true);
    expect(script.trimEnd().endsWith('end tell')).toBe(true);
  });

  it('returns the contact id at the end', () => {
    const script = buildReverseSyncScript(basePayload);
    expect(script).toContain('return id of thePerson');
  });

  it('saves the address book', () => {
    const script = buildReverseSyncScript(basePayload);
    expect(script).toContain('save');
  });

  describe('lookup branch', () => {
    it('without uid, skips the lookup and goes to create', () => {
      const script = buildReverseSyncScript(basePayload);
      expect(script).toContain('set foundPerson to missing value');
      expect(script).not.toContain('first person whose id is');
    });

    it('with uid, looks up by id inside a try block (no group filter)', () => {
      const script = buildReverseSyncScript({ ...basePayload, uid: 'AB-CD-EF' });
      expect(script).toContain('try');
      expect(script).toContain('set foundPerson to first person whose id is "AB-CD-EF"');
      expect(script).toContain('end try');
    });
  });

  describe('create branch', () => {
    it('creates a new person with split name', () => {
      const script = buildReverseSyncScript({ ...basePayload, name: 'John Doe' });
      expect(script).toContain('set thePerson to make new person with properties {first name:"John", last name:"Doe"}');
    });

    it('handles a single-word name as first name only', () => {
      const script = buildReverseSyncScript({ ...basePayload, name: 'Cher' });
      expect(script).toContain('set thePerson to make new person with properties {first name:"Cher", last name:""}');
    });

    it('does not assign the new person to any group', () => {
      const script = buildReverseSyncScript({ ...basePayload, name: 'John Doe' });
      expect(script).not.toContain('add thePerson to');
      expect(script).not.toContain('group ');
    });
  });

  describe('update branch', () => {
    it('clears existing emails/phones/urls/addresses before recreating', () => {
      const script = buildReverseSyncScript({ ...basePayload, uid: 'X' });
      expect(script).toContain('delete every email of thePerson');
      expect(script).toContain('delete every phone of thePerson');
      expect(script).toContain('delete every url of thePerson');
      expect(script).toContain('delete every address of thePerson');
    });

    it('updates first/last name on the matched person', () => {
      const script = buildReverseSyncScript({ ...basePayload, uid: 'X', name: 'Jane Smith' });
      expect(script).toContain('set first name of thePerson to "Jane"');
      expect(script).toContain('set last name of thePerson to "Smith"');
    });
  });

  describe('sub-items', () => {
    it('emits a make new email line per email', () => {
      const script = buildReverseSyncScript({
        ...basePayload,
        emails: ['a@b.com', 'c@d.com']
      });
      expect(script).toContain('make new email at end of emails of thePerson with properties {value:"a@b.com"');
      expect(script).toContain('make new email at end of emails of thePerson with properties {value:"c@d.com"');
    });

    it('emits a make new phone line per phone', () => {
      const script = buildReverseSyncScript({ ...basePayload, phones: ['+34123'] });
      expect(script).toContain('make new phone at end of phones of thePerson with properties {value:"+34123"');
    });

    it('emits a make new url line per website', () => {
      const script = buildReverseSyncScript({ ...basePayload, websites: ['https://example.com'] });
      expect(script).toContain('make new url at end of urls of thePerson with properties {value:"https://example.com"');
    });

    it('emits a make new address line per address', () => {
      const script = buildReverseSyncScript({ ...basePayload, addresses: ['Calle Falsa 123'] });
      expect(script).toContain(
        'make new address at end of addresses of thePerson with properties {street:"Calle Falsa 123"'
      );
    });

    it('escapes quotes within values', () => {
      const script = buildReverseSyncScript({ ...basePayload, emails: ['evil"@example.com'] });
      expect(script).toContain('value:"evil\\"@example.com"');
    });

    it('builds a birthday date programmatically', () => {
      const script = buildReverseSyncScript({ ...basePayload, birthday: new Date(1990, 0, 15) });
      expect(script).toContain('set day of bDate to 15');
      expect(script).toContain('set month of bDate to January');
      expect(script).toContain('set year of bDate to 1990');
      expect(script).toContain('set birth date of thePerson to bDate');
    });
  });
});
