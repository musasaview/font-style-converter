import { describe, expect, test } from "bun:test";
import { catalog, convertAll } from "./catalog";
import { EXTRA_MAPS } from "./extra-maps";
import { convertToPlainText } from "./converter";
const output = (id: string, text: string) =>
  convertAll(text).results.find((result) => result.style.id === id)!.output;

describe("additional alphabets and numbers", () => {
  test("all style IDs are unique and the original styles remain", () => {
    expect(catalog).toHaveLength(82);
    expect(new Set(catalog.map((style) => style.id)).size).toBe(catalog.length);
    for (const id of [
      "Bold",
      "Italic",
      "Circled",
      "Fancy Strong",
      "Mahjong Bamboos 索",
      "half-dakuten",
    ]) {
      expect(catalog.some((style) => style.id === id)).toBe(true);
    }
  });
  test("all converters handle empty input and retain line breaks", () => {
    for (const style of catalog) {
      expect(style.convert("")).toBe("");
      expect(style.convert("Abc 123\r\n日本語 😀").includes("\r\n")).toBe(true);
    }
  });
  test("superscript, subscript and parenthesized capitals handle case", () => {
    expect(output("superscript", "ABC 123")).toBe("ᵃᵇᶜ ¹²³");
    expect(output("subscript", "HELLO 123")).toBe("ₕₑₗₗₒ ₁₂₃");
    expect(output("parenthesized-capitals", "abc")).toBe("🄐🄑🄒");
  });
  test("digits map to the intended symbols", () => {
    expect(output("sans-circled-digits", "123")).toBe("➀➁➂");
    expect(output("sans-negative-digits", "123")).toBe("➊➋➌");
    expect(output("roman-upper", "123")).toBe("ⅠⅡⅢ");
    expect(output("comma-digits", "012")).toBe("🄁🄂🄃");
    expect(output("arabic-indic-digits", "012")).toBe("٠١٢");
    expect(output("devanagari-digits", "012")).toBe("०१२");
    expect(output("keycap-digits", "12")).toBe("1️⃣2️⃣");
  });
  test("new alphabets and combining decorations can be restyled", () => {
    expect(output("Bold", "ᵃᵇᶜ ¹²³")).toBe("𝐚𝐛𝐜 𝟏𝟐𝟑");
    expect(output("Bold", "🄐🄑🄒")).toBe("𝐀𝐁𝐂");
    expect(output("Italic", "A\u0332B\u0332")).toBe("𝐴𝐵");
    expect(convertToPlainText("⠓⠑⠇⠇⠕")).toBe("⠓⠑⠇⠇⠕");
    expect(convertToPlainText("こんにちは 一二三")).toBe("こんにちは 一二三");
  });
  test("new decorations never split emoji sequences", () => {
    const emoji = "👨‍👩‍👧‍👦";

    expect(output("reverse", "A" + emoji + "B")).toBe("B" + emoji + "A");

    expect(convertToPlainText(emoji + "\u0332")).toBe(emoji);
  });
  test("encoding variants have known results", () => {
    expect(output("morse", "SOS 1")).toBe("... --- ... / .----");

    expect(output("leet", "TEST")).toBe("7357");
  });
  test("map targets contain no replacement characters or empty strings", () => {
    for (const style of EXTRA_MAPS)
      for (const target of Object.values(style.map)) {
        expect(target.length).toBeGreaterThan(0);
        expect(target).not.toContain("\uFFFD");
      }
  });
});

test("removed effects stay absent and categories integrate old and new styles", () => {
  for (const id of [
    "underline",
    "strikethrough",
    "letter-spaced",
    "binary-ascii",
    "hex-ascii",
    "braille-look",
  ])
    expect(catalog.some((style) => style.id === id)).toBe(false);
  expect(
    catalog.some((style) =>
      /追加|線・囲みの装飾|英字の組み合わせ/.test(style.category),
    ),
  ).toBe(false);
  const category = (id: string) =>
    catalog.find((style) => style.id === id)!.category;
  expect(category("Circled Digit")).toBe(category("sans-circled-digits"));
  expect(category("Parenthesized")).toBe(category("parenthesized-capitals"));
  expect(category("Spades ♠")).not.toBe(category("Circled Digit"));
});
test("rune, Hangul and kanji glyph conversions", () => {
  expect(output("runes", "ABC abc")).toBe("ᚨᛒᚲ ᚨᛒᚲ");
  expect(output("hangul-look", "ABC abc")).toBe("ㅐㅂㄷ ㅐㅂㄷ");
  expect(output("old-kanji", "国学体")).toBe("國學體");
  expect(output("kangxi-radicals", "一人山")).toBe("⼀⼈⼭");
  expect(output("squared-kanji", "月有満")).toBe("🈷🈶🈵");
});
