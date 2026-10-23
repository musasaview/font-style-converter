import { describe, expect, test } from "bun:test";
import { catalog, convertAll } from "./catalog";
import { convertToPlainText, graphemes } from "./converter";
import { KATAKANA_SQUARE_ROWS, toSquareLower, toSquareUnits, toSquareUpper } from "./square-styles";

const output = (id: string, text: string) =>
  convertAll(text).results.find(({ style }) => style.id === id)!.output;

describe("square words and units", () => {
  test("multi-character matches prefer the longest source from left to right", () => {
    expect(output("square-units", "株式会社カロリー キログラム キロメートル グラムトン キロ グラム kg km cm2"))
      .toBe("㍿㌍ ㌕ ㌖ ㌙ ㌔ ㌘ ㎏ ㎞ ㎠");
  });

  test("compatibility decompositions cover the exact requested ranges", () => {
    for (const [start, end] of [[0x32ff, 0x32ff], [0x3300, 0x3357], [0x3371, 0x33df]]) {
      for (let point = start!; point <= end!; point++) {
        const target = String.fromCodePoint(point);
        const source = target.normalize("NFKC");
        expect(output("square-units", source)).toBe(target);
        expect(output("square-units", target)).toBe(target);
      }
    }
    expect(output("square-units", "0点 24点 1日 31日 gal"))
      .toBe("0点 24点 1日 31日 gal");
  });

  test("units preserve case and do not replace part of a Latin word", () => {
    expect(output("square-units", "kg KG Kg kG Pa PA pA hPa kgf log login inch blackguard 12kg 5cm²"))
      .toBe("㎏ KG Kg kG ㎩ PA ㎀ ㍱ kgf ㏒ login inch blackguard 12㎏ 5㎠");
    expect(output("square-units", "_kg kg_ cm20 cafékg kgé"))
      .toBe("_kg kg_ cm20 cafékg kgé");
  });

  test("normalized unit decompositions retain Greek letters, powers and punctuation", () => {
    expect(output("square-units", "µg μℓ kΩ m² m∕s² rad∕s C∕kg a.m. Co. 令和 平成"))
      .toBe("㎍ ㎕ ㏀ ㎡ ㎨ ㎮ ㏆ ㏂ ㏇ ㋿ ㍻");
  });

  test("all 88 fixed row pairs correspond to their complete word", () => {
    expect(KATAKANA_SQUARE_ROWS).toHaveLength(88);
    for (let index = 0; index < KATAKANA_SQUARE_ROWS.length; index++) {
      const [target, upper, lower] = KATAKANA_SQUARE_ROWS[index]!;
      expect(target.codePointAt(0)).toBe(0x3300 + index);
      expect(upper + lower).toBe(target.normalize("NFKC"));
      expect(upper).toMatch(/^[ァ-ヶー]+$/u);
      expect(lower).toMatch(/^[ァ-ヶー]+$/u);
    }
  });

  test("row readings follow reference glyph layout, including uneven rows", () => {
    expect(output("square-upper", "カロ メー キロメ ギニ グラム ファ ブッ ヘク"))
      .toBe("㌍ ㍍ ㌖ ㌑ ㌙ ㌲ ㌴ ㌶");
    expect(output("square-lower", "リー トル グラム ートル クード チーム ラッド シェル タール トゲン"))
      .toBe("㌍ ㍍ ㌕ ㌖ ㌇ ㌠ ㌲ ㌴ ㌶ ㍖");
  });

  test("duplicate readings choose the first code point and matches are not rescanned", () => {
    expect(output("square-upper", "キロ セン パー ホー マイ ヤー カロメー"))
      .toBe("㌕ ㌢ ㌫ ㍁ ㍃ ㍎ ㌍㍍");
    expect(output("square-lower", "リー トル ン ム ル トントル"))
      .toBe("㌍ ㍍ ㌆ ㌊ ㌃ ㌙㍍");
  });

  test("rows only match katakana and preserve unsupported characters", () => {
    const text = "ひらがな 株式会社 令和 kg ABC 123 😀 ヰヱヲ";
    expect(output("square-upper", text)).toBe(text);
    expect(output("square-lower", text)).toBe(text);
    expect(output("square-units", "ひらがな 未対応 😀 ヰヱヲ"))
      .toBe("ひらがな 未対応 😀 ヰヱヲ");
  });

  test("multi-character matching does not cross grapheme or line boundaries", () => {
    const inputs = [
      [toSquareUnits, "kg\u0301 カロリー\u0301 👨‍👩‍👧‍👦 1️⃣ k\r\ng カロ\nリー"],
      [toSquareUpper, "キ\u3099 カロ\u0301 👨‍👩‍👧‍👦 1️⃣ カ\r\nロ"],
      [toSquareLower, "リ\u0301ー\u0301 ト\u0301ル\u0301 👨‍👩‍👧‍👦 1️⃣ リ\u0301ー\u200d"],
    ] as const;
    for (const [convert, text] of inputs)
      expect(convert(text, Object.freeze(graphemes(text)))).toBe(text);
    expect(output("square-upper", "カロ\r\nメー")).toBe("㌍\r\n㍍");
    expect(output("square-lower", "リー\nトル")).toBe("㌍\n㍍");
  });

  test("row conversions never change undecoration of a full square word", () => {
    expect(convertToPlainText("㌍ ㍍ ㍿ ㎏")).toBe("カロリー メートル 株式会社 kg");
    const converted = convertAll("㌍ １２ kg");
    expect(converted.plainText).toBe("カロリー 12 kg");
    expect(converted.results.find(({ style }) => style.id === "square-units")!.output)
      .toBe("㌍ 12 ㎏");
    expect(convertToPlainText("カロ リー 百二十三 one hundred twenty-three"))
      .toBe("カロ リー 百二十三 one hundred twenty-three");
  });

  test("the six cards have specimens and belong to existing categories", () => {
    for (const id of ["kanji-number", "roman-number", "english-number"])
      expect(catalog.find((style) => style.id === id)?.category).toBe("数字 · 数の表記・算木");
    for (const id of ["square-units", "square-upper", "square-lower"])
      expect(catalog.find((style) => style.id === id)?.category).toBe("漢字・かな · 字形・組文字");
    for (const id of ["kanji-number", "roman-number", "english-number", "square-units", "square-upper", "square-lower"])
      expect(catalog.find((style) => style.id === id)?.specimen).toBeTruthy();
  });
});
