const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getGroupLetter(name: string): string {
  const first = slugify(name).charAt(0);
  return first ? first.toUpperCase() : '_';
}
