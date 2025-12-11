import { toHalf, toFull } from 'conv-str-width';
import stylesData from './styles.json';

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

export function convertToPlainText(input: string): string {
  let result = input;

  // すべてのスタイルの to → from への変換を適用
  Object.values(stylesData.styles).forEach(style => {
    if (style.from && style.to) {
      result = convertText(result, style.to, style.from);
    }
  });

  // Unicode結合文字（ダイアクリティカルマークなど）を削除
  // 結合文字の範囲: U+0300-U+036F (Combining Diacritical Marks)
  // U+1AB0-U+1AFF, U+1DC0-U+1DFF, U+20D0-U+20FF, U+FE20-U+FE2F
  // U+3099-U+309A (濁点・半濁点), U+FF9E-U+FF9F (半角濁点・半濁点)
  result = result.normalize('NFD').replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f\u3099-\u309a\uff9e-\uff9f]/g, '');

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
  // まずplain textに変換してから大文字化
  const plainText = convertToPlainText(str);
  return plainText.toUpperCase();
}

export function toLowerCase(str: string): string {
  // まずplain textに変換してから小文字化
  const plainText = convertToPlainText(str);
  return plainText.toLowerCase();
}

export function toggleCase(str: string): string {
  // まずplain textに変換してから大小反転
  const plainText = convertToPlainText(str);
  return Array.from(plainText).map(ch => {
    if (ch === ch.toUpperCase() && ch !== ch.toLowerCase()) {
      return ch.toLowerCase();
    } else if (ch === ch.toLowerCase() && ch !== ch.toUpperCase()) {
      return ch.toUpperCase();
    }
    return ch;
  }).join('');
}
