import type { TextStyle } from "./catalog";
import { STYLES } from "./character-maps";
import { EXTRA_MAPS } from "./extra-maps";
import { convertText, graphemes } from "./converter";

// Apply once per grapheme: emoji families and combining sequences stay together.
function decorate(input: string, mark: string): string {
  return graphemes(input)
    .map((char) => (/^\s+$/u.test(char) ? char : char + mark))
    .join("");
}
function perLine(input: string, transform: (line: string) => string): string {
  return input
    .split(/(\r\n|\r|\n)/)
    .map((line) => (/^[\r\n]+$/.test(line) ? line : transform(line)))
    .join("");
}
function spaced(input: string, separator: string): string {
  return input
    .split(/(\s+)/u)
    .map((word) =>
      /^\s+$/u.test(word) ? word : graphemes(word).join(separator),
    )
    .join("");
}
function alternate(
  input: string,
  transform: (char: string, index: number) => string,
): string {
  let index = 0;
  return graphemes(input)
    .map((char) =>
      /^[A-Za-z0-9]$/.test(char) ? transform(char, index++) : char,
    )
    .join("");
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
const superMap = EXTRA_MAPS.find((style) => style.id === "superscript")!.map;

const marks: [string, string, string][] = [
  ["underline", "下線", "\u0332"],
  ["double-underline", "二重下線", "\u0333"],
  ["strike", "取り消し線", "\u0336"],
  ["short-strike", "短い取り消し線", "\u0335"],
  ["slash", "斜線", "\u0338"],
  ["short-slash", "短い斜線", "\u0337"],
  ["overline", "上線", "\u0305"],
  ["double-overline", "二重上線", "\u033F"],
  ["enclosing-circle", "結合丸囲み", "\u20DD"],
  ["enclosing-square", "結合四角囲み", "\u20DE"],
  ["enclosing-diamond", "結合ひし形囲み", "\u20DF"],
  ["enclosing-triangle", "結合三角囲み", "\u20E4"],
];

function style(
  id: string,
  name: string,
  category: string,
  description: string,
  convert: (input: string) => string,
): TextStyle {
  return {
    id,
    name,
    category,
    description,
    convert,
    specimen: convert("Abc 123"),
  };
}

export const extraStyles: TextStyle[] = [
  ...EXTRA_MAPS.map((entry) => ({
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description:
      entry.id === "superscript"
        ? "英字・数字。専用字形のない q はそのまま"
        : entry.id === "subscript"
          ? "対応する英字・数字。専用字形のない文字はそのまま"
          : "対応する英字・数字を置換。表示はフォントによって異なります",
    specimen: Object.entries(entry.map)
      .sort(
        ([a], [b]) =>
          Number(/^[0-9]$/.test(a)) - Number(/^[0-9]$/.test(b)) ||
          a.codePointAt(0)! - b.codePointAt(0)!,
      )
      .map(([, value]) => value)
      .join(""),
    convert: (input: string) => convertText(input, entry.map),
  })),
  ...marks.map(([id, name, mark]) =>
    style(
      id,
      name,
      "線・囲みの装飾",
      "文字ごとの結合記号。空白・改行は保持",
      (input) => decorate(input, mark),
    ),
  ),
  style(
    "bold-underline",
    "太字＋下線",
    "英字の組み合わせ",
    "太字の英数字に下線",
    (input) => decorate(convertText(input, STYLES.Bold), "\u0332"),
  ),
  style(
    "bold-strike",
    "太字＋取り消し線",
    "英字の組み合わせ",
    "太字の英数字に取り消し線",
    (input) => decorate(convertText(input, STYLES.Bold), "\u0336"),
  ),
  style(
    "italic-underline",
    "斜体＋下線",
    "英字の組み合わせ",
    "斜体の英数字に下線",
    (input) => decorate(convertText(input, STYLES.Italic), "\u0332"),
  ),
  style(
    "sans-double-underline",
    "サンセリフ太字＋二重下線",
    "英字の組み合わせ",
    "太字の英数字に二重下線",
    (input) =>
      decorate(convertText(input, STYLES["Sans-Serif Bold"]), "\u0333"),
  ),
  style(
    "mono-strike",
    "等幅＋取り消し線",
    "英字の組み合わせ",
    "等幅の英数字に取り消し線",
    (input) => decorate(convertText(input, STYLES.Monospace), "\u0336"),
  ),
  style(
    "double-struck-underline",
    "袋文字＋下線",
    "英字の組み合わせ",
    "袋文字の英数字に下線",
    (input) => decorate(convertText(input, STYLES["Double-Struck"]), "\u0332"),
  ),
  style(
    "smallcaps-spaced",
    "スモールキャップ＋字間",
    "英字の組み合わせ",
    "小型の英字を間隔付きで表示",
    (input) => spaced(convertText(input, STYLES["Small Caps"]), " "),
  ),
  style(
    "mono-spaced",
    "等幅＋字間",
    "英字の組み合わせ",
    "等幅の英数字を間隔付きで表示",
    (input) => spaced(convertText(input, STYLES.Monospace), " "),
  ),
  style(
    "reverse",
    "逆順",
    "文字あそび",
    "行ごとに文字順を反転。絵文字は分断しません",
    (input) => perLine(input, (line) => graphemes(line).reverse().join("")),
  ),
  style(
    "upside-down",
    "上下逆さま",
    "文字あそび",
    "行ごとに英字の向きと順序を反転",
    (input) =>
      perLine(convertText(input, upsideMap), (line) =>
        graphemes(line).reverse().join(""),
      ),
  ),
  style(
    "alternating-case",
    "交互の大文字・小文字",
    "文字あそび",
    "英字・数字の位置ごとに切り替え",
    (input) =>
      alternate(input, (char, index) =>
        index % 2 ? char.toLowerCase() : char.toUpperCase(),
      ),
  ),
  style(
    "alternating-bold",
    "交互の太字",
    "文字あそび",
    "英字・数字を1文字おきに太字",
    (input) =>
      alternate(input, (char, index) =>
        index % 2 ? char : convertText(char, STYLES.Bold),
      ),
  ),
  style(
    "alternating-super",
    "交互の上付き",
    "文字あそび",
    "英字・数字を1文字おきに上付き",
    (input) =>
      alternate(input, (char, index) =>
        index % 2 ? convertText(char, superMap) : char,
      ),
  ),
  style(
    "letter-spaced",
    "文字間に空白",
    "文字あそび",
    "単語内の文字間を広げます",
    (input) => spaced(input, " "),
  ),
  style(
    "dot-spaced",
    "文字間にドット",
    "文字あそび",
    "単語内を中点で区切ります",
    (input) => spaced(input, "·"),
  ),
  style(
    "slash-spaced",
    "文字間にスラッシュ",
    "文字あそび",
    "単語内をスラッシュで区切ります",
    (input) => spaced(input, "/"),
  ),
  style(
    "bracketed",
    "1文字ずつ角かっこ",
    "文字あそび",
    "英字・数字を角かっこで囲みます",
    (input) => input.replace(/[A-Za-z0-9]/g, (char) => `[${char}]`),
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
    (input) =>
      perLine(input, (line) =>
        graphemes(line)
          .map((char) =>
            /^[ \t]+$/.test(char)
              ? "/"
              : (morseMap[char.toLowerCase()] ?? char),
          )
          .join(" "),
      ),
  ),
  style(
    "binary-ascii",
    "ASCII 2進数",
    "符号",
    "英字・数字を8ビットの2進数に変換",
    (input) =>
      input.replace(/[A-Za-z0-9]+/g, (word) =>
        Array.from(word, (char) =>
          char.charCodeAt(0).toString(2).padStart(8, "0"),
        ).join(" "),
      ),
  ),
  style(
    "hex-ascii",
    "ASCII 16進数",
    "符号",
    "英字・数字を2桁の16進数に変換",
    (input) =>
      input.replace(/[A-Za-z0-9]+/g, (word) =>
        Array.from(word, (char) =>
          char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"),
        ).join(" "),
      ),
  ),
];
