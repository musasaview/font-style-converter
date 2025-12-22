import { toHalf, toFull } from 'conv-str-width';
import type { CharacterMap } from './character-maps';
import { INVERSE_MAPS } from './character-maps';

const COMBINING_DAKUTEN = '\u3099';
const HALFWIDTH_DAKUTEN = '\uFF9E';

export function convertText(input: string, charMap: CharacterMap): string {
  if (!input) return input;

  const normalized = input.normalize('NFKC');

  return Array.from(normalized)
    .map(char => charMap[char] ?? char)
    .join('');
}

export function convertToPlainText(input: string): string {
  if (!input) return input;

  let result = input.normalize('NFKC');

  const sortedInverseMaps = Object.entries(INVERSE_MAPS)
    .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length);

  for (const [, inverseMap] of sortedInverseMaps) {
    result = convertText(result, inverseMap);
  }

  return result;
}

export function fullWidth(str: string): string {
  return toFull(str.normalize('NFKC'));
}

export function halfWidth(str: string): string {
  return toHalf(str.normalize('NFKC'));
}

export function addCombiningDakutenToAll(str: string): string {
  return Array.from(str.normalize('NFKC')).map(char =>
    char === '\n' || char === ' ' ? char : char + COMBINING_DAKUTEN
  ).join('');
}

export function addHalfwidthDakutenToAll(str: string): string {
  return Array.from(str.normalize('NFKC')).map(char =>
    char === '\n' || char === ' ' ? char : char + HALFWIDTH_DAKUTEN
  ).join('');
}

export function toUpperCase(str: string): string {
  const plainText = convertToPlainText(str);
  return plainText.toUpperCase();
}

export function toLowerCase(str: string): string {
  const plainText = convertToPlainText(str);
  return plainText.toLowerCase();
}

export function toggleCase(str: string): string {
  const plainText = convertToPlainText(str);
  return Array.from(plainText).map(char => {
    const upper = char.toUpperCase();
    const lower = char.toLowerCase();

    if (char === upper && char !== lower) {
      return lower;
    }
    if (char === lower && char !== upper) {
      return upper;
    }
    return char;
  }).join('');
}
