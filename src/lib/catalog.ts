import { STYLES, CATEGORIES } from "./character-maps";
import {
  convertText,
  convertToPlainText,
  fullWidth,
  halfWidth,
  addCombiningDakutenToAll,
  addHalfwidthDakutenToAll,
  toUpperCase,
  toLowerCase,
  invertCase,
} from "./converter";

export interface TextStyle {
  id: string;
  name: string;
  category: string;
  description: string;
  specimen?: string;
  convert: (input: string) => string;
}
const groups: Record<keyof typeof CATEGORIES, string> = {
  "Serif Styles": "セリフ",
  "Sans-Serif Styles": "サンセリフ",
  "Monospace & Script": "等幅・筆記体",
  "Enclosed Characters": "囲み文字",
  "Gothic & Decorative": "装飾",
  Numbers: "数字・記号",
};
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
  ([group, ids]) =>
    ids.map((id) => {
      const map = STYLES[id];
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
        category: groups[group as keyof typeof CATEGORIES],
        description: supported,
        specimen: Object.entries(map)
          .sort(
            ([a], [b]) =>
              Number(/^[0-9]$/.test(a)) - Number(/^[0-9]$/.test(b)) ||
              a.codePointAt(0)! - b.codePointAt(0)!,
          )
          .map(([, value]) => value)
          .join(""),
        convert: (input: string) => convertText(input, map),
      };
    }),
);

catalog.push(
  {
    id: "plain",
    name: "標準文字に戻す",
    category: "文字の整形",
    description: "装飾を解除。一部の文字は元に戻せません",
    convert: convertToPlainText,
  },
  {
    id: "upper",
    name: "大文字",
    category: "文字の整形",
    description: "UPPERCASE",
    convert: toUpperCase,
  },
  {
    id: "lower",
    name: "小文字",
    category: "文字の整形",
    description: "lowercase",
    convert: toLowerCase,
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

export function convertAll(input: string) {
  const plainText = convertToPlainText(input);
  return {
    plainText,
    results: catalog.map((style) => ({
      style,
      output: style.id === "plain" ? plainText : style.convert(plainText),
    })),
  };
}
