import { toBraille } from "./braille";
import type { TextStyle } from "./catalog";
import { EXTRA_MAPS } from "./extra-maps";
import { createMapConverter, graphemes } from "./converter";
import { toEnglishNumbers, toKanjiNumbers, toRomanNumbers } from "./number-styles";
import { toSquareLower, toSquareUnits, toSquareUpper } from "./square-styles";

function perLine(
  clusters: readonly string[],
  transform: (line: readonly string[]) => string,
): string {
  const output: string[] = [];
  let line: string[] = [];
  for (const cluster of clusters) {
    if (/^[\r\n]+$/.test(cluster)) {
      output.push(transform(line), cluster);
      line = [];
    } else line.push(cluster);
  }
  output.push(transform(line));
  return output.join("");
}
const lower = "abcdefghijklmnopqrstuvwxyz";
const morseCodes = [
  ".-",
  "-...",
  "-.-.",
  "-..",
  ".",
  "..-.",
  "--.",
  "....",
  "..",
  ".---",
  "-.-",
  ".-..",
  "--",
  "-.",
  "---",
  ".--.",
  "--.-",
  ".-.",
  "...",
  "-",
  "..-",
  "...-",
  ".--",
  "-..-",
  "-.--",
  "--..",
  "-----",
  ".----",
  "..---",
  "...--",
  "....-",
  ".....",
  "-....",
  "--...",
  "---..",
  "----.",
];
const morseMap = Object.fromEntries(
  Array.from(lower + "0123456789", (char, index) => [char, morseCodes[index]!]),
);
const upsideMap = EXTRA_MAPS.find((style) => style.id === "upside-glyphs")!.map;
const upside = createMapConverter(upsideMap);
function style(
  id: string,
  name: string,
  category: string,
  description: string,
  convert: TextStyle["convert"],
): TextStyle {
  return {
    id,
    name,
    category,
    description,
    convert,
    specimen: convert("Abc 123", graphemes("Abc 123")),
  };
}

export const extraStyles: TextStyle[] = [
  {
    id: "kanji-number",
    name: "漢数字（数値）",
    category: "",
    description: "15桁までの非負整数を十・百・千・万・億・兆で表記。ゼロは零",
    specimen: toKanjiNumbers("123 10000"),
    convert: toKanjiNumbers,
  },
  {
    id: "roman-number",
    name: "ローマ数字（数値）",
    category: "",
    description: "1〜3999の整数をローマ数字に変換。1〜12は専用字形",
    specimen: toRomanNumbers("12 49 2026"),
    convert: toRomanNumbers,
  },
  {
    id: "english-number",
    name: "英語（数値）",
    category: "",
    description: "15桁までの非負整数を米式の英語で表記。and は入れません",
    specimen: toEnglishNumbers("123"),
    convert: toEnglishNumbers,
  },
  {
    id: "square-units",
    name: "組文字・単位記号",
    category: "",
    description: "対応するカタカナ・漢字・単位を組文字へ。英字は大小を区別",
    specimen: "㍿ ㋿ ㌍ ㍍ ㎏ ㎠",
    convert: toSquareUnits,
  },
  {
    id: "square-upper",
    name: "組文字・上段読み",
    category: "",
    description: "上段のカタカナが入力と一致する組文字へ置換。上下の配置はフォントに依存",
    specimen: "カロ → ㌍　メー → ㍍",
    convert: toSquareUpper,
  },
  {
    id: "square-lower",
    name: "組文字・下段読み",
    category: "",
    description: "下段のカタカナが入力と一致する組文字へ置換。上下の配置はフォントに依存",
    specimen: "リー → ㌍　トル → ㍍",
    convert: toSquareLower,
  },
  {
    id: "braille",
    name: "点字",
    category: "点字・符号",
    description: "ひらがな・カタカナ・英数字を日本語点字の文字単位で変換",
    note: "漢字はかなで入力。分かち書き・助詞の読み替えは手動。",
    specimen: toBraille("あいうえお abc 123"),
    convert: toBraille,
  },
  ...EXTRA_MAPS.map((entry) => {
    const convert = createMapConverter(entry.map);
    return {
      id: entry.id,
      name: entry.name,
      category: "",
      description:
        entry.description ??
        (entry.id === "superscript"
          ? "英字・数字。専用字形のない q はそのまま"
          : entry.id === "subscript"
            ? "対応する英字・数字。専用字形のない文字はそのまま"
            : "対応する英字・数字を置換。表示はフォントによって異なります"),
      specimen: Object.entries(entry.map)
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
  style(
    "reverse",
    "逆順",
    "文字あそび",
    "行ごとに文字順を反転。絵文字は分断しません",
    (_input, clusters) => perLine(clusters, (line) => line.toReversed().join("")),
  ),
  style(
    "upside-down",
    "上下逆さま",
    "文字あそび",
    "行ごとに英字の向きと順序を反転",
    (_input, clusters) => perLine(clusters, (line) => upside(line.toReversed())),
  ),
  style(
    "leet",
    "Leet",
    "文字あそび",
    "A/E/I/O/S/T を 4/3/1/0/5/7 に置換",
    (input) =>
      input.replace(
        /[aeiost]/gi,
        (char) =>
          ({ a: "4", e: "3", i: "1", o: "0", s: "5", t: "7" })[
            char.toLowerCase()
          ]!,
      ),
  ),
  style(
    "morse",
    "モールス符号",
    "符号",
    "英字・数字を符号化。文字間は空白、単語間は /",
    (_input, clusters) =>
      perLine(clusters, (line) =>
        line.some((cluster) => /^[A-Za-z0-9]$/.test(cluster))
          ? line
              .map((char) =>
                /^[ \t]+$/.test(char)
                  ? "/"
                  : (morseMap[char.toLowerCase()] ?? char),
              )
              .join(" ")
          : line.join(""),
      ),
  ),
];
