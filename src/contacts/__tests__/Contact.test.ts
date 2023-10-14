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
		})
	});
});
