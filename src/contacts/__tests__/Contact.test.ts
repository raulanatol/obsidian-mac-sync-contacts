import { describe, expect, it } from 'vitest';
import { Contact } from '../Contact';

const base = {
  fn: [{ value: 'John Doe' }]
};

describe('Contact', () => {
  describe('fromRaw', () => {
    describe('name', () => {
      it('should extract the name correctly', () => {
        const contact = Contact.fromRaw(base);
        expect(contact.name).toBe('John Doe');
      });

      it('should not contain a / character', () => {
        const contact = Contact.fromRaw({ ...base, fn: [{ value: 'John Doe/Jane Doe' }] });
        expect(contact.name).toBe('John Doe Jane Doe');
      });
    });

    describe('uid', () => {
      it('is undefined when the vcard has no UID', () => {
        const contact = Contact.fromRaw(base);
        expect(contact.uid).toBeUndefined();
      });

      it('extracts the UID verbatim (no cleanup)', () => {
        const contact = Contact.fromRaw({ ...base, uid: [{ value: 'AB-CD-EF-12 34' }] });
        expect(contact.uid).toBe('AB-CD-EF-12 34');
      });
    });
  });
});
