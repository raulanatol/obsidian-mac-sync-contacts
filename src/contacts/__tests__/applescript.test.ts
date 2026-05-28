import { describe, expect, it } from 'vitest';
import { escapeAppleScriptString } from '../applescript';

describe('escapeAppleScriptString', () => {
  it('returns the same string when no escaping is needed', () => {
    expect(escapeAppleScriptString('john@example.com')).toBe('john@example.com');
  });

  it('escapes double quotes', () => {
    expect(escapeAppleScriptString('he said "hi"')).toBe('he said \\"hi\\"');
  });

  it('escapes backslashes before quotes', () => {
    expect(escapeAppleScriptString('a\\b"c')).toBe('a\\\\b\\"c');
  });

  it('replaces newlines with the escape sequence', () => {
    expect(escapeAppleScriptString('line1\nline2')).toBe('line1\\nline2');
  });

  it('normalizes CRLF and CR to \\n', () => {
    expect(escapeAppleScriptString('a\r\nb\rc')).toBe('a\\nb\\nc');
  });

  it('handles empty strings', () => {
    expect(escapeAppleScriptString('')).toBe('');
  });
});
