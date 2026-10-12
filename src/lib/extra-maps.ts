import type { CharacterMap } from "./character-maps";

export interface ExtraMap {
  id: string;
  name: string;
  map: CharacterMap;
  reversible?: boolean;
  description?: string;
}
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const digits = "0123456789";
function zip(source: string, target: string): CharacterMap {
  const values = Array.from(target);
  if (Array.from(source).length !== values.length)
    throw new Error(`Invalid character map: ${source}`);
  return Object.fromEntries(
    Array.from(source, (char, index) => [char, values[index]!]),
  );
}
function range(source: string, start: number): CharacterMap {
  return Object.fromEntries(
    Array.from(source, (char, index) => [
      char,
      String.fromCodePoint(start + index),
    ]),
  );
}
const superscript = {
  ...zip(alphabet, "ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖqʳˢᵗᵘᵛʷˣʸᶻ"),
  ...zip(digits, "⁰¹²³⁴⁵⁶⁷⁸⁹"),
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
};
const subscript = {
  ...zip("aehijklmnoprstuvx", "ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ"),
  ...zip(digits, "₀₁₂₃₄₅₆₇₈₉"),
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
};

// Character blocks: https://unicode.org/Public/17.0.0/charts/
// Lookalike alphabets are decorative substitutions, not translations.
function compatibilityMap(start: number, end: number): CharacterMap {
  const map: CharacterMap = {};
  for (let code = start; code <= end; code++) {
    const target = String.fromCodePoint(code);
    const source = target.normalize("NFKC");
    if (/^[\u3400-\u9fff]$/.test(source) && source !== target)
      map[source] = target;
  }
  return map;
}

export const EXTRA_MAPS: ExtraMap[] = [
  {
    id: "runes",
    name: "ルーン文字",
    reversible: false,
    description: "英字をルーン字形へ置換。翻訳・発音の転写ではありません",
    map: zip(alphabet, "ᚨᛒᚲᛞᛖᚠᚷᚺᛁᛃᚲᛚᛗᚾᛟᛈᚲᚱᛊᛏᚢᚹᚹᛉᛃᛉ"),
  },
  {
    id: "hangul-look",
    name: "ハングル風",
    reversible: false,
    description: "英字をハングルの字母へ置換。韓国語への翻訳ではありません",
    map: zip(
      alphabet.toUpperCase(),
      "ㅐㅂㄷㅁㅌㅋㄹㅐㅣㅓㅋㄴㅁㅅㅇㅍㆁㄹㅅㅜㅐㅅㅆㅈㅛㅈ",
    ),
  },
  {
    id: "superscript-capitals",
    name: "上付き大文字",
    description: "対応する大文字を上付きに変換。専用字形のない英字は保持",
    map: zip("ABDEGHIJKLMNOPRTUW", "ᴬᴮᴰᴱᴳᴴᴵᴶᴷᴸᴹᴺᴼᴾᴿᵀᵁᵂ"),
  },
  {
    id: "old-kanji",
    name: "旧字体",
    description:
      "対応する新字体を旧字体に置換。文脈による異体字の使い分けはしません",
    map: Object.fromEntries(
      "国國 学學 体體 会會 図圖 広廣 気氣 円圓 来來 帰歸 読讀 声聲 変變 鉄鐵 駅驛 楽樂 桜櫻 竜龍 万萬 与與 争爭 仮假 伝傳 価價 写寫 医醫 単單 双雙 台臺 号號 団團 塩鹽 壊壞 売賣 奥奧 実實 対對 寿壽 将將 巣巢 帯帶 弁辨 弥彌 従從 徳德 応應 恵惠 悪惡 拝拜 拡擴 挙擧 数數 断斷 旧舊 昼晝 条條 栄榮 様樣 権權 横橫 歩步 歴歷 残殘 殻殼 沢澤 浅淺 浜濱 涙淚 済濟 満滿 湾灣 灯燈 点點 独獨 猟獵 県縣 真眞 礼禮 神神 称稱 稲稻 穂穗 竃竈 糸絲 経經 続續 総總 縁緣 缶罐 聴聽 脳腦 芸藝 虫蟲 覚覺 観觀 証證 訳譯 豊豐 賛贊 転轉 辺邊 遅遲 郷鄕 酔醉 醸釀 釈釋 銭錢 関關 険險 隠隱 雑雜 霊靈 静靜 顔顏 顕顯 餅餠 騒騷 髪髮 麦麥 黒黑 齢齡"
        .split(" ")
        .map((pair) => Array.from(pair)),
    ),
  },
  {
    id: "kangxi-radicals",
    name: "康熙部首",
    description: "対応する漢字を康熙部首の字形へ置換",
    map: compatibilityMap(0x2f00, 0x2fd5),
  },
  {
    id: "squared-kanji",
    name: "四角囲み漢字",
    description: "対応する漢字を専用の四角囲み字形へ置換",
    map: compatibilityMap(0x1f210, 0x1f23b),
  },
  { id: "tibetan-digits", name: "チベット数字", map: range(digits, 0xf20) },
  { id: "khmer-digits", name: "クメール数字", map: range(digits, 0x17e0) },
  { id: "lao-digits", name: "ラオ数字", map: range(digits, 0xed0) },
  {
    id: "superscript",
    name: "上付き英数字",
    map: superscript,
  },
  {
    id: "subscript",
    name: "下付き英数字",
    map: subscript,
  },
  {
    id: "parenthesized-capitals",
    name: "かっこ付き大文字",
    map: range(alphabet.toUpperCase(), 0x1f110),
  },
  {
    id: "greek-look",
    name: "ギリシャ文字風",
    map: zip(alphabet.toUpperCase(), "ΛΒϹDΣϜGΗΙЈΚⅬΜΝΟΡϘЯЅΤЦⅤШΧΥΖ"),
  },
  {
    id: "cyrillic-look",
    name: "キリル文字風",
    map: zip(alphabet.toUpperCase(), "ДБҀDЄҒԌНІЈКLМИФРԚЯЅТЦѴШЖУZ"),
  },
  {
    id: "stroked",
    name: "線入り英字",
    map: {
      a: "Ⱥ",
      b: "Ƀ",
      c: "Ȼ",
      d: "Đ",
      e: "Ɇ",
      g: "Ǥ",
      h: "Ħ",
      i: "Ɨ",
      l: "Ł",
      o: "Ø",
      p: "Ᵽ",
      r: "Ɍ",
      t: "Ŧ",
      u: "Ʉ",
      y: "Ɏ",
      z: "Ƶ",
    },
  },
  {
    id: "upside-glyphs",
    name: "逆さまの字形",
    map: zip(alphabet, "ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz"),
    reversible: false,
  },
  {
    id: "sans-circled-digits",
    name: "サンセリフ丸数字",
    map: range("123456789", 0x2780),
  },
  {
    id: "sans-negative-digits",
    name: "サンセリフ黒丸数字",
    map: range("123456789", 0x278a),
  },
  {
    id: "period-digits",
    name: "ピリオド付き数字",
    map: { "0": "🄀", ...range("123456789", 0x2488) },
  },
  {
    id: "comma-digits",
    name: "カンマ付き数字",
    map: range(digits, 0x1f101),
  },
  {
    id: "roman-upper",
    name: "ローマ数字・大文字",
    map: zip("123456789", "ⅠⅡⅢⅣⅤⅥⅦⅧⅨ"),
  },
  {
    id: "roman-lower",
    name: "ローマ数字・小文字",
    map: zip("123456789", "ⅰⅱⅲⅳⅴⅵⅶⅷⅸ"),
  },
  {
    id: "kanji-digits",
    name: "漢数字",
    map: zip(digits, "〇一二三四五六七八九"),
    reversible: false,
  },
  {
    id: "daiji-digits",
    name: "大字",
    map: zip(digits, "零壱弐参肆伍陸漆捌玖"),
    reversible: false,
  },
  {
    id: "arabic-indic-digits",
    name: "アラビア・インド数字",
    map: range(digits, 0x660),
  },
  {
    id: "persian-digits",
    name: "ペルシャ数字",
    map: range(digits, 0x6f0),
  },
  {
    id: "devanagari-digits",
    name: "デーヴァナーガリー数字",
    map: range(digits, 0x966),
  },
  {
    id: "bengali-digits",
    name: "ベンガル数字",
    map: range(digits, 0x9e6),
  },
  {
    id: "thai-digits",
    name: "タイ数字",
    map: range(digits, 0xe50),
  },
  {
    id: "myanmar-digits",
    name: "ミャンマー数字",
    map: range(digits, 0x1040),
  },
  {
    id: "segmented-digits",
    name: "デジタル数字",
    map: range(digits, 0x1fbf0),
  },
  {
    id: "keycap-digits",
    name: "キートップ数字",
    map: Object.fromEntries(
      Array.from(digits, (char) => [char, `${char}\uFE0F\u20E3`]),
    ),
    reversible: false,
  },
  {
    id: "counting-rods",
    name: "算木数字・縦",
    map: range("123456789", 0x1d360),
  },
  {
    id: "counting-rods-horizontal",
    name: "算木数字・横",
    map: range("123456789", 0x1d369),
  },
];
