import type { CharacterMap } from "./character-maps";

export interface ExtraMap {
  id: string;
  name: string;
  category: string;
  map: CharacterMap;
  reversible?: boolean;
}
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
function zip(source: string, target: string): CharacterMap {
  const values = Array.from(target);
  if (Array.from(source).length !== values.length)
    throw new Error(`Invalid character map: ${source}`);
  return Object.fromEntries(
    Array.from(source, (char, index) => [char, values[index]!]),
  );
}
function range(source: string, start: number): CharacterMap {
  return Object.fromEntries(
    Array.from(source, (char, index) => [
      char,
      String.fromCodePoint(start + index),
    ]),
  );
}
const superscript = {
  ...zip(alphabet, "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ"),
  ...zip(digits, "⁰¹²³⁴⁵⁶⁷⁸⁹"),
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
};
const subscript = {
  ...zip("aehijklmnoprstuvx", "ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ"),
  ...zip(digits, "₀₁₂₃₄₅₆₇₈₉"),
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
};

// Character blocks: https://unicode.org/Public/17.0.0/charts/
// Lookalike alphabets are decorative substitutions, not translations.
export const EXTRA_MAPS: ExtraMap[] = [
  {
    id: "superscript",
    name: "上付き英数字",
    category: "追加の英字",
    map: superscript,
  },
  {
    id: "subscript",
    name: "下付き英数字",
    category: "追加の英字",
    map: subscript,
  },
  {
    id: "parenthesized-capitals",
    name: "かっこ付き大文字",
    category: "追加の英字",
    map: range(alphabet.toUpperCase(), 0x1f110),
  },
  {
    id: "greek-look",
    name: "ギリシャ文字風",
    category: "追加の英字",
    map: zip(alphabet.toUpperCase(), "ΛΒϹDΣϜGΗΙЈΚⅬΜΝΟΡϘЯЅΤЦⅤШΧΥΖ"),
  },
  {
    id: "cyrillic-look",
    name: "キリル文字風",
    category: "追加の英字",
    map: zip(alphabet.toUpperCase(), "ДБҀDЄҒԌНІЈКLМИФРԚЯЅТЦѴШЖУZ"),
  },
  {
    id: "stroked",
    name: "線入り英字",
    category: "追加の英字",
    map: {
      a: "Ⱥ",
      b: "Ƀ",
      c: "Ȼ",
      d: "Đ",
      e: "Ɇ",
      g: "Ǥ",
      h: "Ħ",
      i: "Ɨ",
      l: "Ł",
      o: "Ø",
      p: "Ᵽ",
      r: "Ɍ",
      t: "Ŧ",
      u: "Ʉ",
      y: "Ɏ",
      z: "Ƶ",
    },
  },
  {
    id: "upside-glyphs",
    name: "逆さまの字形",
    category: "追加の英字",
    map: zip(alphabet, "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz"),
    reversible: false,
  },
  {
    id: "braille-look",
    name: "点字風の英字",
    category: "追加の英字",
    map: zip(alphabet, "⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵"),
  },
  {
    id: "sans-circled-digits",
    name: "サンセリフ丸数字",
    category: "追加の数字",
    map: range("123456789", 0x2780),
  },
  {
    id: "sans-negative-digits",
    name: "サンセリフ黒丸数字",
    category: "追加の数字",
    map: range("123456789", 0x278a),
  },
  {
    id: "period-digits",
    name: "ピリオド付き数字",
    category: "追加の数字",
    map: { "0": "🄀", ...range("123456789", 0x2488) },
  },
  {
    id: "comma-digits",
    name: "カンマ付き数字",
    category: "追加の数字",
    map: range(digits, 0x1f101),
  },
  {
    id: "roman-upper",
    name: "ローマ数字・大文字",
    category: "追加の数字",
    map: zip("123456789", "ⅠⅡⅢⅣⅤⅥⅦⅧⅨ"),
  },
  {
    id: "roman-lower",
    name: "ローマ数字・小文字",
    category: "追加の数字",
    map: zip("123456789", "ⅰⅱⅲⅳⅴⅵⅶⅷⅸ"),
  },
  {
    id: "kanji-digits",
    name: "漢数字",
    category: "追加の数字",
    map: zip(digits, "〇一二三四五六七八九"),
    reversible: false,
  },
  {
    id: "daiji-digits",
    name: "大字",
    category: "追加の数字",
    map: zip(digits, "零壱弐参肆伍陸漆捌玖"),
    reversible: false,
  },
  {
    id: "arabic-indic-digits",
    name: "アラビア・インド数字",
    category: "追加の数字",
    map: range(digits, 0x660),
  },
  {
    id: "persian-digits",
    name: "ペルシャ数字",
    category: "追加の数字",
    map: range(digits, 0x6f0),
  },
  {
    id: "devanagari-digits",
    name: "デーヴァナーガリー数字",
    category: "追加の数字",
    map: range(digits, 0x966),
  },
  {
    id: "bengali-digits",
    name: "ベンガル数字",
    category: "追加の数字",
    map: range(digits, 0x9e6),
  },
  {
    id: "thai-digits",
    name: "タイ数字",
    category: "追加の数字",
    map: range(digits, 0xe50),
  },
  {
    id: "myanmar-digits",
    name: "ミャンマー数字",
    category: "追加の数字",
    map: range(digits, 0x1040),
  },
  {
    id: "segmented-digits",
    name: "デジタル数字",
    category: "追加の数字",
    map: range(digits, 0x1fbf0),
  },
  {
    id: "keycap-digits",
    name: "キートップ数字",
    category: "追加の数字",
    map: Object.fromEntries(
      Array.from(digits, (char) => [char, `${char}\uFE0F\u20E3`]),
    ),
    reversible: false,
  },
  {
    id: "counting-rods",
    name: "算木数字・縦",
    category: "追加の数字",
    map: range("123456789", 0x1d360),
  },
  {
    id: "counting-rods-horizontal",
    name: "算木数字・横",
    category: "追加の数字",
    map: range("123456789", 0x1d369),
  },
];
