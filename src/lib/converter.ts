import { toHalf, toFull } from 'conv-str-width';

export function convertText(input: string, from: string, to: string): string {
  const fromChars = Array.from(from);
  const toChars = Array.from(to);

  let result = input;
  for (let i = 0; i < fromChars.length; i++) {
    const fromChar = fromChars[i];
    const toChar = toChars[i];
    if (fromChar && toChar) {
      result = result.replaceAll(fromChar, toChar);
    }
  }
  return result;
}

export function halfWidth(str: string) {
  return toHalf(str);
}

export function fullWidth(str: string) {
  return toFull(str);
}

export function addHalfwidthDakutenToAll(str: string): string {
  const HALF_DAKUTEN = '\uFF9E';
  return Array.from(str).map(ch => ch + HALF_DAKUTEN).join('');
}

export function addCombiningDakutenToAll(str: string): string {
  const COMBINING_DAKUTEN = '\u3099';
  return Array.from(str).map(ch => ch + COMBINING_DAKUTEN).join('');
}

export function toUpperCase(str: string): string {
  return str.toUpperCase();
}

export function toLowerCase(str: string): string {
  return str.toLowerCase();
}

export function toggleCase(str: string): string {
  return Array.from(str).map(ch => {
    if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
      return ch.toLowerCase();
    } else if (ch === ch.toLowerCase() && ch !== ch.toUpperCase()) {
      return ch.toUpperCase();
    }
    return ch;
  }).join('');
}
