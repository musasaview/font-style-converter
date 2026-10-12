import { STYLES, type CharacterMap } from "./character-maps";

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
export function graphemes(input: string): string[] {
  return Array.from(segmenter.segment(input), (part) => part.segment);
}

// Restore compatibility normalization without breaking multi-codepoint emoji.
function normalizeText(input: string): string {
  return graphemes(input)
    .map((cluster) =>
      /[\uFE0F\u200D\u20E3]/u.test(cluster)
        ? cluster
        : cluster.normalize("NFKC"),
    )
    .join("");
}

export function convertText(input: string, charMap: CharacterMap): string {
  const keys = Object.keys(charMap);
  const hasUpper = keys.some((key) => /^[A-Z]$/.test(key));
  const hasLower = keys.some((key) => /^[a-z]$/.test(key));
  return graphemes(convertToPlainText(input))
    .map((cluster) => {
      if (/[\uFE0F\u200D\u20E3]/u.test(cluster)) return cluster;
      return Array.from(cluster, (char) => {
        const key =
          hasUpper && !hasLower && /^[a-z]$/.test(char)
            ? char.toUpperCase()
            : hasLower && !hasUpper && /^[A-Z]$/.test(char)
              ? char.toLowerCase()
              : char;
        return charMap[key] ?? char;
      }).join("");
    })
    .join("");
}

const plainMap: CharacterMap = {};
for (const map of Object.values(STYLES)) {
  for (const [source, target] of Object.entries(map)) {
    if (source !== target && plainMap[target] === undefined)
      plainMap[target] = source;
  }
}

export function convertToPlainText(input: string): string {
  return normalizeText(
    graphemes(input)
      .map((cluster) => {
        // Leave emoji sequences (including variation selectors and keycaps) intact.
        if (/[\uFE0F\u200D\u20E3]/u.test(cluster)) return cluster;
        return Array.from(cluster, (char) => plainMap[char] ?? char).join("");
      })
      .join(""),
  );
}

const halfKana: CharacterMap = {};
for (let point = 0xff61; point <= 0xff9d; point++) {
  const half = String.fromCodePoint(point);
  const full = half.normalize("NFKC");
  halfKana[full] = half;
  for (const mark of ["ﾞ", "ﾟ"]) {
    const voiced = (half + mark).normalize("NFKC");
    if (Array.from(voiced).length === 1) halfKana[voiced] = half + mark;
  }
}

export function fullWidth(input: string): string {
  const kanaConverted = normalizeText(input).replace(
    /[\uFF61-\uFF9F]+/gu,
    (kana) => kana.normalize("NFKC"),
  );
  return graphemes(kanaConverted)
    .map((cluster) => {
      if (/[\uFE0F\u200D\u20E3]/u.test(cluster)) return cluster;
      return cluster
        .replace(/[!-~]/g, (char) =>
          String.fromCharCode(char.charCodeAt(0) + 0xfee0),
        )
        .replace(/ /g, "　");
    })
    .join("");
}

export function halfWidth(input: string): string {
  return Array.from(normalizeText(input), (char) => {
    if (/[！-～]/u.test(char))
      return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
    if (char === "　") return " ";
    if (char === "\u3099" || char === "゛") return "ﾞ";
    if (char === "\u309a" || char === "゜") return "ﾟ";
    return halfKana[char] ?? char;
  }).join("");
}

function addDakuten(input: string, mark: string): string {
  return graphemes(normalizeText(input))
    .map((cluster) => {
      if (/^\s+$/u.test(cluster)) return cluster;
      return cluster + mark;
    })
    .join("");
}
export const addCombiningDakutenToAll = (input: string) =>
  addDakuten(input, "\u3099");
export const addHalfwidthDakutenToAll = (input: string) =>
  addDakuten(input, "\uFF9E");
export const toUpperCase = (input: string) =>
  convertToPlainText(input).toUpperCase();
export const toLowerCase = (input: string) =>
  convertToPlainText(input).toLowerCase();
export const invertCase = (input: string) =>
  Array.from(convertToPlainText(input), (char) =>
    char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase(),
  ).join("");
