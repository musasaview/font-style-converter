import { STYLES, CATEGORIES } from "./character-maps";
import { extraStyles } from "./extra-styles";
import {
  createMapConverter,
  convertToPlainText,
  graphemes,
  fullWidth,
  halfWidth,
  addCombiningDakutenToAll,
  addHalfwidthDakutenToAll,
  invertCase,
} from "./converter";

export interface TextStyle {
  id: string;
  name: string;
  category: string;
  description: string;
  specimen?: string;
  note?: string;
  // Called with the undecorated source and its shared, immutable graphemes.
  convert: (plainText: string, clusters: readonly string[]) => string;
}
const names: Record<string, string> = {
  Bold: "太字",
  Italic: "斜体",
  "Bold Italic": "太字・斜体",
  "Sans-Serif": "サンセリフ",
  "Sans-Serif Bold": "サンセリフ太字",
  "Sans-Serif Italic": "サンセリフ斜体",
  "Sans-Serif Bold Italic": "サンセリフ太字・斜体",
  Monospace: "等幅",
  Script: "筆記体",
  "Bold Script": "太字の筆記体",
  Circled: "丸囲み",
  Squared: "四角囲み",
  "Negative Squared": "黒四角囲み",
  Parenthesized: "かっこ囲み",
  "Negative Circled": "黒丸囲み",
  "Double-Struck": "袋文字",
  "Small Caps": "スモールキャップ",
  "Fancy Strong": "ミックス文字",
  Fraktur: "フラクトゥール",
  "Bold Fraktur": "太字のフラクトゥール",
  "Circled Digit": "丸数字",
  "Filled Circled Digit": "黒丸数字",
  "Double Circled Numbers": "二重丸数字",
  "Parenthesized Digit": "かっこ数字",
  "Chemical Numbers": "リサイクル記号",
  "Subscript Numbers": "下付き数字",
  "Dice Numbers": "サイコロ",
  "漢数字 (Circled)": "丸囲み漢数字",
  "Spades ♠": "スペード",
  "Hearts ♥": "ハート",
  "Diamonds ♦": "ダイヤ",
  "Clubs ♣": "クラブ",
  "Mahjong Characters 萬": "麻雀・萬子",
  "Mahjong Circles 筒": "麻雀・筒子",
  "Mahjong Bamboos 索": "麻雀・索子",
};

export const catalog: TextStyle[] = Object.entries(CATEGORIES).flatMap(
  ([, ids]) =>
    ids.map((id) => {
      const map = STYLES[id];
      const convert = createMapConverter(map);
      const keys = Object.keys(map);
      const supported = [
        keys.some((c) => /[A-Z]/.test(c)) && "大文字",
        keys.some((c) => /[a-z]/.test(c)) && "小文字",
        keys.some((c) => /[0-9]/.test(c)) && "数字",
        keys.some((c) => /[^\x00-\x7f]/.test(c)) && "一部の日本語",
      ]
        .filter(Boolean)
        .join("・");
      return {
        id,
        name: names[id] ?? id,
        category: "",
        description: supported,
        specimen: Object.entries(map)
          .sort(
            ([a], [b]) =>
              Number(/^[0-9]$/.test(a)) - Number(/^[0-9]$/.test(b)) ||
              a.codePointAt(0)! - b.codePointAt(0)!,
          )
          .map(([, value]) => value)
          .join(""),
        convert: (_input: string, clusters: readonly string[]) => convert(clusters),
      };
    }),
);

catalog.push(
  {
    id: "plain",
    name: "標準文字に戻す",
    category: "文字の整形",
    description: "装飾を解除。一部の文字は元に戻せません",
    convert: (input) => input,
  },
  {
    id: "upper",
    name: "大文字",
    category: "文字の整形",
    description: "UPPERCASE",
    convert: (input) => input.toUpperCase(),
  },
  {
    id: "lower",
    name: "小文字",
    category: "文字の整形",
    description: "lowercase",
    convert: (input) => input.toLowerCase(),
  },
  {
    id: "invert",
    name: "大文字・小文字を反転",
    category: "文字の整形",
    description: "Abc → aBC",
    convert: invertCase,
  },
  {
    id: "full",
    name: "全角",
    category: "文字の整形",
    description: "英数字・記号・カタカナ・空白",
    convert: fullWidth,
  },
  {
    id: "half",
    name: "半角",
    category: "文字の整形",
    description: "英数字・記号・カタカナ・空白",
    convert: halfWidth,
  },
  {
    id: "dakuten",
    name: "濁点を追加",
    category: "文字の整形",
    description: "記号・絵文字にも追加。繰り返し追加できます",
    convert: addCombiningDakutenToAll,
  },
  {
    id: "half-dakuten",
    name: "半角濁点を追加",
    category: "文字の整形",
    description: "文字の右に添える濁点",
    convert: addHalfwidthDakutenToAll,
  },
);

catalog.push(...extraStyles);

// One ordered taxonomy for every style, regardless of when it was introduced.
export const styleGroups: Record<string, string[]> = {
  "英字 · セリフ・サンセリフ": [
    "Bold",
    "Italic",
    "Bold Italic",
    "Sans-Serif",
    "Sans-Serif Bold",
    "Sans-Serif Italic",
    "Sans-Serif Bold Italic",
  ],
  "英字 · 筆記体・装飾書体": [
    "Script",
    "Bold Script",
    "Fraktur",
    "Bold Fraktur",
    "Double-Struck",
    "Monospace",
    "Small Caps",
    "stroked",
    "Fancy Strong",
  ],
  "英字 · 囲み文字": [
    "Circled",
    "Negative Circled",
    "Squared",
    "Negative Squared",
    "Parenthesized",
    "parenthesized-capitals",
  ],
  "英字 · 他文字の字形": [
    "greek-look",
    "cyrillic-look",
    "runes",
    "hangul-look",
  ],
  "上付き・下付き": [
    "superscript",
    "superscript-capitals",
    "subscript",
    "Subscript Numbers",
  ],
  "数字 · 囲み・装飾": [
    "Circled Digit",
    "Filled Circled Digit",
    "Double Circled Numbers",
    "sans-circled-digits",
    "sans-negative-digits",
    "Parenthesized Digit",
    "period-digits",
    "comma-digits",
    "keycap-digits",
    "segmented-digits",
  ],
  "数字 · 数の表記・算木": [
    "kanji-digits",
    "daiji-digits",
    "kanji-number",
    "roman-upper",
    "roman-lower",
    "roman-number",
    "english-number",
    "counting-rods",
    "counting-rods-horizontal",
  ],
  "数字 · 各国の字形": [
    "arabic-indic-digits",
    "persian-digits",
    "devanagari-digits",
    "bengali-digits",
    "thai-digits",
    "myanmar-digits",
    "tibetan-digits",
    "khmer-digits",
    "lao-digits",
  ],
  "漢字・かな · 字形・組文字": [
    "old-kanji",
    "kangxi-radicals",
    "漢数字 (Circled)",
    "squared-kanji",
    "square-units",
    "square-upper",
    "square-lower",
  ],
  "記号 · トランプ・麻雀・サイコロ": [
    "Spades ♠",
    "Hearts ♥",
    "Diamonds ♦",
    "Clubs ♣",
    "Mahjong Characters 萬",
    "Mahjong Circles 筒",
    "Mahjong Bamboos 索",
    "Dice Numbers",
    "Chemical Numbers",
  ],
  "点字・符号": ["braille", "morse"],
  "反転・文字置換": ["upside-glyphs", "upside-down", "reverse", "leet"],
  "大文字・小文字・全角・半角": [
    "plain",
    "upper",
    "lower",
    "invert",
    "full",
    "half",
  ],
  濁点: ["dakuten", "half-dakuten"],
};
const orderedStyles = Object.entries(styleGroups).flatMap(([category, ids]) =>
  ids.map((id) => {
    const style = catalog.find((style) => style.id === id);
    if (!style) throw new Error(`Unknown style: ${id}`);
    return { ...style, category };
  }),
);
if (
  orderedStyles.length !== catalog.length ||
  new Set(orderedStyles.map((style) => style.id)).size !== catalog.length
)
  throw new Error("Every style must belong to exactly one category");
catalog.splice(0, catalog.length, ...orderedStyles);

export function convertAll(input: string) {
  const plainText = convertToPlainText(input);
  const clusters = graphemes(plainText);
  return {
    plainText,
    results: catalog.map((style) => ({
      style,
      output: style.convert(plainText, clusters),
    })),
  };
}
