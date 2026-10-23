import { STYLES, type CharacterMap } from "./character-maps";
import { EXTRA_MAPS } from "./extra-maps";

const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
export function graphemes(input: string): string[] {
  return Array.from(segmenter.segment(input), (part) => part.segment);
}

// Restore compatibility normalization without breaking multi-codepoint emoji.
export function normalizeText(input: string): string {
  return graphemes(input)
    .map((cluster) =>
      /[\uFE0F\u200D\u20E3]/u.test(cluster)
        ? cluster
        : cluster.normalize("NFKC"),
    )
    .join("");
}

export function convertText(input: string, charMap: CharacterMap): string {
  return createMapConverter(charMap)(graphemes(convertToPlainText(input)));
}

// Compile case fallbacks once for catalog maps; input clusters are already plain.
export function createMapConverter(charMap: CharacterMap) {
  const keys = Object.keys(charMap);
  const hasUpper = keys.some((key) => /^[A-Z]$/.test(key));
  const hasLower = keys.some((key) => /^[a-z]$/.test(key));
  const map = { ...charMap };
  if (hasUpper !== hasLower) {
    for (const key of keys) {
      if (/^[A-Za-z]$/.test(key)) {
        map[hasUpper ? key.toLowerCase() : key.toUpperCase()] = charMap[key]!;
      }
    }
  }
  return (clusters: readonly string[]): string =>
    clusters
      .map((cluster) => {
        if (cluster.length === 1) return map[cluster] ?? cluster;
        if (/[\uFE0F\u200D\u20E3]/u.test(cluster)) return cluster;
        return Array.from(cluster, (char) => map[char] ?? char).join("");
      })
      .join("");
}

const plainMap: CharacterMap = {};
for (const map of [
  ...Object.values(STYLES),
  ...EXTRA_MAPS.filter((style) => style.reversible !== false).map(
    (style) => style.map,
  ),
]) {
  for (const [source, target] of Object.entries(map)) {
    if (source !== target && plainMap[target] === undefined)
      plainMap[target] = source;
  }
}

export function convertToPlainText(input: string): string {
  return normalizeText(
    graphemes(
      input.replace(
        /[\u0332\u0333\u0335-\u0338\u0305\u033F\u20DD-\u20DF\u20E4]/gu,
        "",
      ),
    )
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

// Optional clusters let the catalog share its normalized input. Standalone calls
// still perform their original normalization before converting.
export function fullWidth(
  input: string,
  clusters: readonly string[] = graphemes(normalizeText(input)),
): string {
  return clusters
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

export function halfWidth(
  input: string,
  clusters: readonly string[] = graphemes(normalizeText(input)),
): string {
  return clusters
    .map((cluster) =>
      Array.from(cluster, (char) => {
        if (/[！-～]/u.test(char))
          return String.fromCharCode(char.charCodeAt(0) - 0xfee0);
        if (char === "　") return " ";
        if (char === "\u3099" || char === "゛") return "ﾞ";
        if (char === "\u309a" || char === "゜") return "ﾟ";
        return halfKana[char] ?? char;
      }).join(""),
    )
    .join("");
}

function addDakuten(clusters: readonly string[], mark: string): string {
  return clusters
    .map((cluster) => {
      if (/^\s+$/u.test(cluster)) return cluster;
      return cluster + mark;
    })
    .join("");
}
export const addCombiningDakutenToAll = (
  input: string,
  clusters: readonly string[] = graphemes(normalizeText(input)),
) => addDakuten(clusters, "\u3099");
export const addHalfwidthDakutenToAll = (
  input: string,
  clusters: readonly string[] = graphemes(normalizeText(input)),
) => addDakuten(clusters, "\uFF9E");
export const toUpperCase = (input: string) =>
  convertToPlainText(input).toUpperCase();
export const toLowerCase = (input: string) =>
  convertToPlainText(input).toLowerCase();
export const invertCase = (
  input: string,
  clusters: readonly string[] = graphemes(convertToPlainText(input)),
) =>
  clusters
    .map((cluster) =>
      Array.from(cluster, (char) =>
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase(),
      ).join(""),
    )
    .join("");
