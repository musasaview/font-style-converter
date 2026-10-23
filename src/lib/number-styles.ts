import { graphemes } from "./converter";

type IntegerFormatter = (value: bigint) => string | undefined;

// Inspect whole digit runs, including malformed comma groups, before replacing.
// The surrounding syntax and grapheme boundaries keep unsupported forms intact.
function convertIntegers(
  input: string,
  clusters: readonly string[],
  format: IntegerFormatter,
): string {
  const boundaries = new Set<number>([0]);
  let offset = 0;
  for (const cluster of clusters) {
    offset += cluster.length;
    boundaries.add(offset);
  }
  return input.replace(/[0-9]+(?:,+[0-9]+)*/g, (token, start: number) => {
    const end = start + token.length;
    if (!boundaries.has(start) || !boundaries.has(end)) return token;
    const before = input[start - 1] ?? "";
    const after = input[end] ?? "";
    if (/[A-Za-z0-9_]/.test(before + after)) return token;
    if (/[.\/⁄∕+−-]/u.test(before)) return token;
    if (after === "." && /[0-9]/.test(input[end + 1] ?? "")) return token;

    // Fractions may contain horizontal spaces; never cross a line boundary.
    let left = start - 1;
    let right = end;
    while (left >= 0 && /[ \t]/.test(input[left]!)) left--;
    while (right < input.length && /[ \t]/.test(input[right]!)) right++;
    if (/[\/⁄∕+−-]/u.test(input[left] ?? "")) return token;
    if (/[\/⁄∕]/u.test(input[right] ?? "")) return token;
    if (/[+−-]/u.test(after) && /[0-9]/.test(input[end + 1] ?? ""))
      return token;
    if (!/^(?:[0-9]+|[0-9]{1,3}(?:,[0-9]{3})+)$/.test(token)) return token;

    const digits = token.replaceAll(",", "").replace(/^0+(?=[0-9])/, "");
    if (digits.length > 15) return token;
    return format(BigInt(digits)) ?? token;
  });
}

const kanjiDigits = "零一二三四五六七八九";
const kanjiPlaces = ["", "十", "百", "千"];
const kanjiGroups = ["", "万", "億", "兆"];

function kanjiInteger(value: bigint): string {
  if (value === 0n) return "零";
  let result = "";
  for (const group of kanjiGroups) {
    let part = value % 10000n;
    value /= 10000n;
    if (part === 0n) continue;
    let text = "";
    for (const place of kanjiPlaces) {
      const digit = part % 10n;
      part /= 10n;
      if (digit !== 0n)
        text =
          (digit === 1n && place ? "" : kanjiDigits[Number(digit)]) +
          place + text;
    }
    result = text + group + result;
  }
  return result;
}

const englishSmall = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen",
  "seventeen", "eighteen", "nineteen",
];
const englishTens = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
];
const englishGroups = ["", "thousand", "million", "billion", "trillion"];

function englishInteger(value: bigint): string {
  if (value === 0n) return "zero";
  const result: string[] = [];
  for (const group of englishGroups) {
    const part = value % 1000n;
    value /= 1000n;
    if (part === 0n) continue;
    const words: string[] = [];
    if (part >= 100n) words.push(englishSmall[Number(part / 100n)]!, "hundred");
    const rest = part % 100n;
    if (rest > 0n && rest < 20n) words.push(englishSmall[Number(rest)]!);
    if (rest >= 20n)
      words.push(
        englishTens[Number(rest / 10n)]! +
          (rest % 10n === 0n ? "" : "-" + englishSmall[Number(rest % 10n)]),
      );
    if (group) words.push(group);
    result.unshift(words.join(" "));
  }
  return result.join(" ");
}

const romanPlaces: readonly (readonly [bigint, string])[] = [
  [1000n, "Ⅿ"], [900n, "ⅭⅯ"], [500n, "Ⅾ"], [400n, "ⅭⅮ"],
  [100n, "Ⅽ"], [90n, "ⅩⅭ"], [50n, "Ⅼ"], [40n, "ⅩⅬ"],
  [10n, "Ⅹ"], [9n, "ⅠⅩ"], [5n, "Ⅴ"], [4n, "ⅠⅤ"], [1n, "Ⅰ"],
];

function romanInteger(value: bigint): string | undefined {
  if (value < 1n || value > 3999n) return undefined;
  if (value <= 12n) return String.fromCodePoint(0x215f + Number(value));
  let result = "";
  for (const [amount, glyph] of romanPlaces) {
    while (value >= amount) {
      result += glyph;
      value -= amount;
    }
  }
  return result;
}

export function toKanjiNumbers(
  input: string,
  clusters: readonly string[] = graphemes(input),
): string {
  return convertIntegers(input, clusters, kanjiInteger);
}
export function toEnglishNumbers(
  input: string,
  clusters: readonly string[] = graphemes(input),
): string {
  return convertIntegers(input, clusters, englishInteger);
}
export function toRomanNumbers(
  input: string,
  clusters: readonly string[] = graphemes(input),
): string {
  return convertIntegers(input, clusters, romanInteger);
}
