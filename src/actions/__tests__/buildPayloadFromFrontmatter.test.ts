import { describe, expect, it } from 'vitest';
import { buildPayloadFromFrontmatter } from '../SyncContactToMacAction';

describe('buildPayloadFromFrontmatter', () => {
  it('returns empty payload when frontmatter is undefined', () => {
    const payload = buildPayloadFromFrontmatter(undefined);
    expect(payload).toEqual({ name: '', emails: [], phones: [], websites: [], addresses: [] });
  });

  it('reads name, uid and array fields', () => {
    const payload = buildPayloadFromFrontmatter({
      name: 'John Doe',
      contactUID: 'AB-CD',
      emails: ['a@b.com', 'c@d.com'],
      phones: ['+34123'],
      websites: ['https://example.com'],
      addresses: ['Calle Falsa 123']
    });
    expect(payload.name).toBe('John Doe');
    expect(payload.uid).toBe('AB-CD');
    expect(payload.emails).toEqual(['a@b.com', 'c@d.com']);
    expect(payload.phones).toEqual(['+34123']);
    expect(payload.websites).toEqual(['https://example.com']);
    expect(payload.addresses).toEqual(['Calle Falsa 123']);
  });

  it('coerces a single string into a single-element array', () => {
    const payload = buildPayloadFromFrontmatter({ name: 'x', emails: 'only@one.com' });
    expect(payload.emails).toEqual(['only@one.com']);
  });

  it('treats empty string and null as missing', () => {
    const payload = buildPayloadFromFrontmatter({
      name: 'x',
      contactUID: '',
      emails: null,
      phones: ''
    });
    expect(payload.uid).toBeUndefined();
    expect(payload.emails).toEqual([]);
    expect(payload.phones).toEqual([]);
  });

  it('parses a valid birthday', () => {
    const payload = buildPayloadFromFrontmatter({ name: 'x', birthday: '1990-01-15' });
    expect(payload.birthday).toBeInstanceOf(Date);
    expect(payload.birthday?.getFullYear()).toBe(1990);
  });

  it('drops an invalid birthday silently', () => {
    const payload = buildPayloadFromFrontmatter({ name: 'x', birthday: 'not-a-date' });
    expect(payload.birthday).toBeUndefined();
  });
});
