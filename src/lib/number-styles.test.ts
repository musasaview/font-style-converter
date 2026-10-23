import { describe, expect, test } from "bun:test";
import { convertAll } from "./catalog";
import { toEnglishNumbers, toKanjiNumbers, toRomanNumbers } from "./number-styles";

describe("integer notation", () => {
  test("kanji uses positional units and omits zero groups", () => {
    expect(toKanjiNumbers("0 1 9 10 11 20 99 100 101 110 999 1000 1001 1010 1100 9999"))
      .toBe("零 一 九 十 十一 二十 九十九 百 百一 百十 九百九十九 千 千一 千十 千百 九千九百九十九");
    expect(toKanjiNumbers("10000 10001 10000000 100000000 100000001 1000000000000 1000100010001"))
      .toBe("一万 一万一 千万 一億 一億一 一兆 一兆一億一万一");
    expect(toKanjiNumbers("999999999999999"))
      .toBe("九百九十九兆九千九百九十九億九千九百九十九万九千九百九十九");
  });

  test("English uses US cardinal notation without and", () => {
    expect(toEnglishNumbers("0 1 10 11 19 20 21 40 99 100 101 123"))
      .toBe("zero one ten eleven nineteen twenty twenty-one forty ninety-nine one hundred one hundred one one hundred twenty-three");
    expect(toEnglishNumbers("1000 1001 1100 1000000 1000000000 1000000000000 1000000000001"))
      .toBe("one thousand one thousand one one thousand one hundred one million one billion one trillion one trillion one");
    expect(toEnglishNumbers("999999999999999"))
      .toBe("nine hundred ninety-nine trillion nine hundred ninety-nine billion nine hundred ninety-nine million nine hundred ninety-nine thousand nine hundred ninety-nine");
  });

  test("Roman 1–12 use dedicated glyphs", () => {
    expect(toRomanNumbers("1 2 3 4 5 6 7 8 9 10 11 12"))
      .toBe("Ⅰ Ⅱ Ⅲ Ⅳ Ⅴ Ⅵ Ⅶ Ⅷ Ⅸ Ⅹ Ⅺ Ⅻ");
  });

  test("larger Roman numbers use subtractive notation with seven base glyphs", () => {
    expect(toRomanNumbers("13 14 19 40 49 90 99 400 900 1994 3999"))
      .toBe("ⅩⅠⅠⅠ ⅩⅠⅤ ⅩⅠⅩ ⅩⅬ ⅩⅬⅠⅩ ⅩⅭ ⅩⅭⅠⅩ ⅭⅮ ⅭⅯ ⅯⅭⅯⅩⅭⅠⅤ ⅯⅯⅯⅭⅯⅩⅭⅠⅩ");
    expect(toRomanNumbers("0 000 4000 4,000 1000000000000000"))
      .toBe("0 000 4000 4,000 1000000000000000");
  });

  test("leading zeros and valid comma grouping are interpreted numerically", () => {
    expect(toKanjiNumbers("000 000123 1,234 000,012 000000000000000001"))
      .toBe("零 百二十三 千二百三十四 十二 一");
    expect(toEnglishNumbers("000 000123 1,234 000,012"))
      .toBe("zero one hundred twenty-three one thousand two hundred thirty-four twelve");
    expect(toRomanNumbers("00012 1,234 3,999"))
      .toBe("Ⅻ ⅯⅭⅭⅩⅩⅩⅠⅤ ⅯⅯⅯⅭⅯⅩⅭⅠⅩ");
  });

  test("more than fifteen significant digits remain intact", () => {
    const input = "1000000000000000 1,000,000,000,000,000 999999999999999999999999999999";
    for (const convert of [toKanjiNumbers, toEnglishNumbers, toRomanNumbers])
      expect(convert(input)).toBe(input);
  });

  test("unsupported numeric syntax and identifiers are never partially converted", () => {
    const input = [
      "-12", "−12", "+12", "- 12", "0.5", ".5", "-1,234.56", "1.2.3",
      "1/2", "1 / 2", "1⁄2", "1∕2", "1e3", "1E+3", "1e-3", "1.2e+34",
      "item123", "123abc", "abc12def34", "_12", "12_34", "v1.2", "0xFF",
      "1,23", "12,34,567", "1234,567", "1,,234", "1,2345",
    ].join(" ");
    for (const convert of [toKanjiNumbers, toEnglishNumbers, toRomanNumbers])
      expect(convert(input)).toBe(input);
  });

  test("integers in sentences preserve punctuation, spacing and line breaks", () => {
    expect(toKanjiNumbers("合計123個、残り45個。 (12), 34.\r\n\t0\n"))
      .toBe("合計百二十三個、残り四十五個。 (十二), 三十四.\r\n\t零\n");
    expect(toEnglishNumbers("There are 12 items, 34 left."))
      .toBe("There are twelve items, thirty-four left.");
  });

  test("emoji and combining sequences remain whole", () => {
    const text = "1️⃣ 2\u20e3 12\u0301 👨‍👩‍👧‍👦 3\ufe0f";
    for (const convert of [toKanjiNumbers, toEnglishNumbers, toRomanNumbers])
      expect(convert(text)).toBe(text);
  });

  test("catalog uses the same undecorated source for all three styles", () => {
    const { plainText, results } = convertAll("１２３ 𝟏𝟐 ⓪");
    expect(plainText).toBe("123 12 0");
    const output = (id: string) => results.find(({ style }) => style.id === id)!.output;
    expect(output("kanji-number")).toBe("百二十三 十二 零");
    expect(output("english-number")).toBe("one hundred twenty-three twelve zero");
    expect(output("roman-number")).toBe("ⅭⅩⅩⅠⅠⅠ Ⅻ 0");
    expect(output("roman-upper")).toBe("ⅠⅡⅢ ⅠⅡ 0");
  });
});
