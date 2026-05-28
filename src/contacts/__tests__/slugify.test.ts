import { describe, expect, it } from 'vitest';
import { getGroupLetter, slugify } from '../slugify';

describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('Alejandro Fernandez')).toBe('alejandro-fernandez');
  });

  it('strips diacritics', () => {
    expect(slugify('Álvaro Núñez')).toBe('alvaro-nunez');
    expect(slugify('Élena Çırak')).toBe('elena-c-rak');
  });

  it('replaces unsafe characters with hyphens', () => {
    expect(slugify('John / Doe')).toBe('john-doe');
    expect(slugify('A*B?C:D')).toBe('a-b-c-d');
    expect(slugify('  spaced  out  ')).toBe('spaced-out');
  });

  it('collapses repeated separators', () => {
    expect(slugify('John   Doe')).toBe('john-doe');
    expect(slugify('John--Doe')).toBe('john-doe');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
  });

  it('keeps digits', () => {
    expect(slugify('User 42')).toBe('user-42');
  });
});

describe('getGroupLetter', () => {
  it('returns the uppercase first letter of the slug', () => {
    expect(getGroupLetter('Alejandro Fernandez')).toBe('A');
    expect(getGroupLetter('bob')).toBe('B');
  });

  it('normalizes diacritics before picking the letter', () => {
    expect(getGroupLetter('Álvaro')).toBe('A');
    expect(getGroupLetter('Émile')).toBe('E');
    expect(getGroupLetter('Ñoño')).toBe('N');
  });

  it('falls back to underscore when the name yields no letter', () => {
    expect(getGroupLetter('')).toBe('_');
    expect(getGroupLetter('***')).toBe('_');
  });
});
