const COMBINING_DIACRITICS = /[̀-ͯ]/g;

// Letters that NFD does not decompose into a base letter + combining mark.
// Without this map they would be stripped and the contact grouped under the
// wrong letter (e.g. "Łukasz" → "ukasz" → "U").
const SPECIAL_LETTERS: Record<string, string> = {
  ł: 'l', ø: 'o', æ: 'ae', œ: 'oe', đ: 'd', ð: 'd', þ: 'th', ß: 'ss',
  ı: 'i', ħ: 'h', ŋ: 'n', ĸ: 'k',
};

function transliterate(value: string): string {
  let result = '';
  for (const char of value) {
    result += SPECIAL_LETTERS[char] ?? char;
  }
  return result;
}

export function slugify(name: string): string {
  return transliterate(name.toLowerCase())
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getGroupLetter(name: string): string {
  const first = slugify(name).charAt(0);
  return first ? first.toUpperCase() : '_';
}
