import { describe, expect, it } from 'vitest';
import { formatBirthday } from '../formatBirthday';

describe('formatBirthday', () => {
  it('formats a date as YYYY-MM-DD using local components', () => {
    expect(formatBirthday(new Date(1990, 4, 15))).toBe('1990-05-15');
  });

  it('zero-pads month and day', () => {
    expect(formatBirthday(new Date(2001, 0, 3))).toBe('2001-01-03');
  });
});
