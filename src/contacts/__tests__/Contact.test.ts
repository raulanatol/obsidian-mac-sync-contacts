import { describe, expect, it } from 'vitest';
import { Contact } from '../Contact';

const base = {
	fn: [{ value: 'John Doe' }]
};

describe('Contact', () => {
	describe('fromRaw', () => {
		it('should extract the name correctly', () => {
			const contact = Contact.fromRaw(base);
			expect(contact.name).toBe('John Doe');
		});
	});
});
