import { graphemes, normalizeText } from "./converter";

// Japanese character transcription, based on Japan Braille Library's reading-side table:
// https://www.nittento.or.jp/images/pdf/information/braille_lists.pdf
// This does not infer kanji readings, particles, long-vowel spelling or word boundaries.
const cell = (dots: string) =>
  String.fromCodePoint(
    0x2800 +
      Array.from(dots).reduce(
        (bits, dot) => bits | (1 << (Number(dot) - 1)),
        0,
      ),
  );
const vowelDots = ["1", "12", "14", "124", "24"];
const kana: Record<string, string> = {};
for (const [letters, consonant] of [
  ["あいうえお", ""],
  ["かきくけこ", "6"],
  ["さしすせそ", "56"],
  ["たちつてと", "35"],
  ["なにぬねの", "3"],
  ["はひふへほ", "36"],
  ["まみむめも", "356"],
  ["らりるれろ", "5"],
]) {
  Array.from(letters!).forEach((letter, index) => {
    kana[letter] = cell(vowelDots[index]! + consonant);
  });
}
Object.assign(kana, {
  や: cell("34"),
  ゆ: cell("346"),
  よ: cell("345"),
  わ: cell("3"),
  ゐ: cell("23"),
  ゑ: cell("235"),
  を: cell("35"),
  ん: cell("356"),
  っ: cell("2"),
  ー: cell("25"),
});
for (const [voiced, unvoiced, prefix] of [
  [
    "がぎぐげござじずぜぞだぢづでどばびぶべぼ",
    "かきくけこさしすせそたちつてとはひふへほ",
    "5",
  ],
  ["ぱぴぷぺぽ", "はひふへほ", "6"],
  ["ゔ", "う", "5"],
]) {
  Array.from(voiced!).forEach((letter, index) => {
    kana[letter] = cell(prefix!) + kana[Array.from(unvoiced!)[index]!]!;
  });
}
const pairs: Record<string, string> = {};
for (const [head, bases, prefix] of [
  ["き", "かくこ", "4"],
  ["し", "さすそ", "4"],
  ["ち", "たつと", "4"],
  ["に", "なぬの", "4"],
  ["ひ", "はふほ", "4"],
  ["み", "まむも", "4"],
  ["り", "らるろ", "4"],
  ["ぎ", "かくこ", "45"],
  ["じ", "さすそ", "45"],
  ["ぢ", "たつと", "45"],
  ["び", "はふほ", "45"],
  ["ぴ", "はふほ", "46"],
]) {
  Array.from("ゃゅょ").forEach((tail, index) => {
    pairs[head! + tail] = cell(prefix!) + kana[Array.from(bases!)[index]!]!;
  });
}
for (const [pair, prefix, base] of [
  ["いぇ", "4", "え"],
  ["きぇ", "4", "け"],
  ["しぇ", "4", "せ"],
  ["じぇ", "45", "せ"],
  ["ちぇ", "4", "て"],
  ["にぇ", "4", "ね"],
  ["ひぇ", "4", "へ"],
  ["うぃ", "26", "い"],
  ["うぇ", "26", "え"],
  ["うぉ", "26", "お"],
  ["くぁ", "26", "か"],
  ["くぃ", "26", "き"],
  ["くぇ", "26", "け"],
  ["くぉ", "26", "こ"],
  ["ぐぁ", "256", "か"],
  ["ぐぃ", "256", "き"],
  ["ぐぇ", "256", "け"],
  ["ぐぉ", "256", "こ"],
  ["つぁ", "26", "た"],
  ["つぃ", "26", "ち"],
  ["つぇ", "26", "て"],
  ["つぉ", "26", "と"],
  ["ふぁ", "26", "は"],
  ["ふぃ", "26", "ひ"],
  ["ふぇ", "26", "へ"],
  ["ふぉ", "26", "ほ"],
  ["ゔぁ", "256", "は"],
  ["ゔぃ", "256", "ひ"],
  ["ゔぇ", "256", "へ"],
  ["ゔぉ", "256", "ほ"],
  ["すぃ", "4", "し"],
  ["ずぃ", "45", "し"],
  ["てぃ", "4", "ち"],
  ["でぃ", "45", "ち"],
  ["とぅ", "26", "つ"],
  ["どぅ", "256", "つ"],
  ["てゅ", "146", "つ"],
  ["でゅ", "1456", "つ"],
  ["ふゅ", "346", "ゆ"],
  ["ゔゅ", "3456", "ゆ"],
  ["ふょ", "346", "よ"],
  ["ゔょ", "3456", "よ"],
])
  pairs[pair!] = cell(prefix!) + kana[base!]!;
const small: Record<string, string> = Object.fromEntries(
  Array.from("ぁぃぅぇぉゃゅょゎゕゖ").map((char, index) => [
    char,
    Array.from("あいうえおやゆよわかけ")[index]!,
  ]),
);
const alphabet = Object.fromEntries(
  Array.from("abcdefghijklmnopqrstuvwxyz").map((char, index) => [
    char,
    Array.from("⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵")[index]!,
  ]),
);
const digits = Object.fromEntries(
  Array.from("1234567890").map((char, index) => [
    char,
    alphabet["abcdefghij"[index]!]!,
  ]),
);
const foreign = cell("56"),
  capital = cell("6"),
  numeric = cell("3456"),
  connector = cell("36");
const punctuation: Record<string, string> = {
  "、": cell("6"),
  "。": cell("256"),
  "?": cell("26"),
  "!": cell("235"),
  "・": cell("5"),
  "「": cell("36"),
  "」": cell("36"),
  "(": cell("2356"),
  ")": cell("2356"),
};

export function toBraille(
  input: string,
  clusters: readonly string[] = graphemes(normalizeText(input)),
): string {
  // Keep extended grapheme clusters intact (Unicode UAX #29), including emoji
  // presentation selectors, keycaps and unsupported combining sequences.
  const chars = clusters.map((cluster) =>
    /^[ァ-ヶ]$/.test(cluster)
      ? String.fromCharCode(cluster.charCodeAt(0) - 0x60)
      : cluster,
  );
  let result = "";
  let previous: "kana" | "number" | "latin" | "other" = "other";
  for (let index = 0; index < chars.length;) {
    const char = chars[index]!;
    if (/^[A-Za-z]$/.test(char)) {
      let word = "";
      while (index < chars.length && /^[A-Za-z]$/.test(chars[index]!))
        word += chars[index++]!;
      const allCaps = word.length > 1 && /^[A-Z]+$/.test(word);
      result += foreign + (allCaps ? capital + capital : "");
      result += Array.from(
        word,
        (letter) =>
          (!allCaps && /^[A-Z]$/.test(letter) ? capital : "") +
          alphabet[letter.toLowerCase()]!,
      ).join("");
      previous = "latin";
      continue;
    }
    if (/^[0-9]$/.test(char)) {
      result += numeric;
      while (index < chars.length) {
        const digit = chars[index]!;
        if (/^[0-9]$/.test(digit)) {
          result += digits[digit];
          index++;
        } else if (
          (digit === "." || digit === ",") &&
          /^[0-9]$/.test(chars[index + 1] ?? "")
        ) {
          result += cell(digit === "." ? "2" : "3");
          index++;
        } else break;
      }
      previous = "number";
      continue;
    }
    const pair = char + (chars[index + 1] ?? "");
    const plainKana = small[char] ?? char;
    const mapped = pairs[pair] ?? kana[plainKana];
    if (mapped) {
      if (
        previous === "latin" ||
        (previous === "number" && /^[あいうえおらりるれろ]$/.test(plainKana))
      )
        result += connector;
      result += mapped;
      index += pairs[pair] ? 2 : 1;
      previous = "kana";
      continue;
    }
    result += punctuation[char] ?? char;
    previous = "other";
    index++;
  }
  return result;
}
