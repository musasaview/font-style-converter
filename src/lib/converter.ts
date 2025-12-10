export function convertText(input: string, from: string, to: string): string {
  const fromChars = Array.from(from);
  const toChars = Array.from(to);

  let result = input;
  for (let i = 0; i < fromChars.length; i++) {
    const fromChar = fromChars[i];
    const toChar = toChars[i];
    if (fromChar && toChar) {
      result = result.replaceAll(fromChar, toChar);
    }
  }
  return result;
}

const MAP: Record<string, string> = {
  "ァ": "ｧ", "ア": "ｱ", "ィ": "ｨ", "イ": "ｲ", "ゥ": "ｩ", "ウ": "ｳ", "ェ": "ｪ", "エ": "ｴ", "ォ": "ｫ", "オ": "ｵ",
  "カ": "ｶ", "ガ": "ｶﾞ", "キ": "ｷ", "ギ": "ｷﾞ", "ク": "ｸ", "グ": "ｸﾞ", "ケ": "ｹ", "ゲ": "ｹﾞ", "コ": "ｺ", "ゴ": "ｺﾞ",
  "サ": "ｻ", "ザ": "ｻﾞ", "シ": "ｼ", "ジ": "ｼﾞ", "ス": "ｽ", "ズ": "ｽﾞ", "セ": "ｾ", "ゼ": "ｾﾞ", "ソ": "ｿ", "ゾ": "ｿﾞ",
  "タ": "ﾀ", "ダ": "ﾀﾞ", "チ": "ﾁ", "ヂ": "ﾁﾞ", "ッ": "ｯ", "ツ": "ﾂ", "ヅ": "ﾂﾞ", "テ": "ﾃ", "デ": "ﾃﾞ", "ト": "ﾄ", "ド": "ﾄﾞ",
  "ナ": "ﾅ", "ニ": "ﾆ", "ヌ": "ﾇ", "ネ": "ﾈ", "ノ": "ﾉ",
  "ハ": "ﾊ", "バ": "ﾊﾞ", "パ": "ﾊﾟ", "ヒ": "ﾋ", "ビ": "ﾋﾞ", "ピ": "ﾋﾟ", "フ": "ﾌ", "ブ": "ﾌﾞ", "プ": "ﾌﾟ", "ヘ": "ﾍ", "ベ": "ﾍﾞ", "ペ": "ﾍﾟ", "ホ": "ﾎ", "ボ": "ﾎﾞ", "ポ": "ﾎﾟ",
  "マ": "ﾏ", "ミ": "ﾐ", "ム": "ﾑ", "メ": "ﾒ", "モ": "ﾓ",
  "ャ": "ｬ", "ヤ": "ﾔ", "ュ": "ｭ", "ユ": "ﾕ", "ョ": "ｮ", "ヨ": "ﾖ",
  "ラ": "ﾗ", "リ": "ﾘ", "ル": "ﾙ", "レ": "ﾚ", "ロ": "ﾛ",
  "ワ": "ﾜ", "ヲ": "ｦ",
  "ン": "ﾝ",
  "ヴ": "ｳﾞ",
  "ヷ": "ﾜﾞ", "ヺ": "ｦﾞ",
  "・": "･", "ー": "ｰ",
  "。": "｡", "「": "｢", "」": "｣", "、": "､",
}

const ALNUM_DIFF = "Ａ".codePointAt(0)! - "A".codePointAt(0)!;

export function halfWidth(str: string) {
  return str
    .normalize("NFKC")
    .replace(/[、-ー]/gu, c => MAP[c] || c);
}

export function fullWidth(str: string) {
  return str
    .normalize("NFKC")
    .replace(/[!-~]/g, c => String.fromCodePoint(c.codePointAt(0)! + ALNUM_DIFF))
    .replace(/ /g, "　");
}

export function addHalfwidthDakutenToAll(str: string): string {
  const HALF_DAKUTEN = '\uFF9E';
  return Array.from(str).map(ch => ch + HALF_DAKUTEN).join('');
}

export function addCombiningDakutenToAll(str: string): string {
  const COMBINING_DAKUTEN = '\u3099';
  return Array.from(str).map(ch => ch + COMBINING_DAKUTEN).join('');
}
