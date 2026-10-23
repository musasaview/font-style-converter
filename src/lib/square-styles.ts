import { graphemes } from "./converter";

// Upper/lower rows transcribed from the reference glyphs, not string halves.
// https://www.unicode.org/charts/PDF/U3300.pdf (U+3300–U+3357)
// Actual row placement depends on the font. Do not register these as inverse maps.
export const KATAKANA_SQUARE_ROWS: readonly (readonly [string, string, string])[] = [
  ["㌀", "アパ", "ート"],
  ["㌁", "アル", "ファ"],
  ["㌂", "アン", "ペア"],
  ["㌃", "アー", "ル"],
  ["㌄", "イニ", "ング"],
  ["㌅", "イン", "チ"],
  ["㌆", "ウォ", "ン"],
  ["㌇", "エス", "クード"],
  ["㌈", "エー", "カー"],
  ["㌉", "オン", "ス"],
  ["㌊", "オー", "ム"],
  ["㌋", "カイ", "リ"],
  ["㌌", "カラ", "ット"],
  ["㌍", "カロ", "リー"],
  ["㌎", "ガロ", "ン"],
  ["㌏", "ガン", "マ"],
  ["㌐", "ギ", "ガ"],
  ["㌑", "ギニ", "ー"],
  ["㌒", "キュ", "リー"],
  ["㌓", "ギル", "ダー"],
  ["㌔", "キ", "ロ"],
  ["㌕", "キロ", "グラム"],
  ["㌖", "キロメ", "ートル"],
  ["㌗", "キロ", "ワット"],
  ["㌘", "グラ", "ム"],
  ["㌙", "グラム", "トン"],
  ["㌚", "クル", "ゼイロ"],
  ["㌛", "クロ", "ーネ"],
  ["㌜", "ケー", "ス"],
  ["㌝", "コル", "ナ"],
  ["㌞", "コー", "ポ"],
  ["㌟", "サイ", "クル"],
  ["㌠", "サン", "チーム"],
  ["㌡", "シリ", "ング"],
  ["㌢", "セン", "チ"],
  ["㌣", "セン", "ト"],
  ["㌤", "ダー", "ス"],
  ["㌥", "デ", "シ"],
  ["㌦", "ド", "ル"],
  ["㌧", "ト", "ン"],
  ["㌨", "ナ", "ノ"],
  ["㌩", "ノッ", "ト"],
  ["㌪", "ハイ", "ツ"],
  ["㌫", "パー", "セント"],
  ["㌬", "パー", "ツ"],
  ["㌭", "バー", "レル"],
  ["㌮", "ピア", "ストル"],
  ["㌯", "ピク", "ル"],
  ["㌰", "ピ", "コ"],
  ["㌱", "ビ", "ル"],
  ["㌲", "ファ", "ラッド"],
  ["㌳", "フィ", "ート"],
  ["㌴", "ブッ", "シェル"],
  ["㌵", "フラ", "ン"],
  ["㌶", "ヘク", "タール"],
  ["㌷", "ペ", "ソ"],
  ["㌸", "ペニ", "ヒ"],
  ["㌹", "ヘル", "ツ"],
  ["㌺", "ペン", "ス"],
  ["㌻", "ペー", "ジ"],
  ["㌼", "ベー", "タ"],
  ["㌽", "ポイ", "ント"],
  ["㌾", "ボル", "ト"],
  ["㌿", "ホ", "ン"],
  ["㍀", "ポン", "ド"],
  ["㍁", "ホー", "ル"],
  ["㍂", "ホー", "ン"],
  ["㍃", "マイ", "クロ"],
  ["㍄", "マイ", "ル"],
  ["㍅", "マッ", "ハ"],
  ["㍆", "マル", "ク"],
  ["㍇", "マン", "ション"],
  ["㍈", "ミク", "ロン"],
  ["㍉", "ミ", "リ"],
  ["㍊", "ミリ", "バール"],
  ["㍋", "メ", "ガ"],
  ["㍌", "メガ", "トン"],
  ["㍍", "メー", "トル"],
  ["㍎", "ヤー", "ド"],
  ["㍏", "ヤー", "ル"],
  ["㍐", "ユア", "ン"],
  ["㍑", "リッ", "トル"],
  ["㍒", "リ", "ラ"],
  ["㍓", "ルピ", "ー"],
  ["㍔", "ルー", "ブル"],
  ["㍕", "レ", "ム"],
  ["㍖", "レン", "トゲン"],
  ["㍗", "ワッ", "ト"],
];

interface SquareEntry {
  source: readonly string[];
  target: string;
  unit: boolean;
}

function createSquareConverter(pairs: readonly (readonly [string, string])[]) {
  const byFirst = new Map<string, SquareEntry[]>();
  for (const [sourceText, target] of pairs) {
    const source = graphemes(sourceText);
    const first = source[0]!;
    const entries = byFirst.get(first) ?? [];
    entries.push({ source, target, unit: /[A-Za-z]/.test(sourceText) });
    byFirst.set(first, entries);
  }
  for (const entries of byFirst.values())
    entries.sort(
      (a, b) =>
        b.source.length - a.source.length ||
        a.target.codePointAt(0)! - b.target.codePointAt(0)!,
    );

  return (_input: string, clusters: readonly string[]): string => {
    const output: string[] = [];
    for (let index = 0; index < clusters.length; ) {
      const cluster = clusters[index]!;
      const entry = byFirst.get(cluster)?.find(({ source, unit }) => {
        if (!source.every((part, offset) => clusters[index + offset] === part))
          return false;
        if (!unit) return true;
        // Keep units out of Latin words, including accented letters, and identifiers.
        // A preceding quantity is allowed (12kg); trailing digits must match the unit.
        return (
          !/[\p{Script=Latin}\p{Script=Greek}_]/u.test(clusters[index - 1] ?? "") &&
          !/[\p{Script=Latin}\p{Script=Greek}\p{N}_]/u.test(
            clusters[index + source.length] ?? "",
          )
        );
      });
      output.push(entry?.target ?? cluster);
      index += entry?.source.length ?? 1;
    }
    return output.join("");
  };
}

// Official compatibility decompositions, normalized like convertAll's shared input.
// https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt
const squarePairs: [string, string][] = [];
for (const [start, end] of [
  [0x32ff, 0x32ff], [0x3300, 0x3357], [0x3371, 0x33df],
] as const)
  for (let point = start; point <= end; point++) {
    const target = String.fromCodePoint(point);
    squarePairs.push([target.normalize("NFKC"), target]);
  }

export const toSquareUnits = createSquareConverter(squarePairs);
export const toSquareUpper = createSquareConverter(
  KATAKANA_SQUARE_ROWS.map(([target, upper]) => [upper, target]),
);
export const toSquareLower = createSquareConverter(
  KATAKANA_SQUARE_ROWS.map(([target, , lower]) => [lower, target]),
);
