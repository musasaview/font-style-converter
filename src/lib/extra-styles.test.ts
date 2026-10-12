import { describe, expect, test } from "bun:test";
import { catalog, convertAll } from "./catalog";
import { EXTRA_MAPS } from "./extra-maps";
import { convertToPlainText } from "./converter";
const output = (id: string, text: string) =>
  convertAll(text).results.find((result) => result.style.id === id)!.output;

describe("additional alphabets and numbers", () => {
  test("all style IDs are unique and the original styles remain", () => {
    expect(catalog).toHaveLength(102);
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
    expect(convertToPlainText("⠓⠑⠇⠇⠕")).toBe("hello");
    expect(convertToPlainText("こんにちは 一二三")).toBe("こんにちは 一二三");
  });
  test("new decorations never split emoji sequences", () => {
    const emoji = "👨‍👩‍👧‍👦";
    expect(output("underline", emoji)).toBe(emoji + "\u0332");
    expect(output("reverse", "A" + emoji + "B")).toBe("B" + emoji + "A");
    expect(output("letter-spaced", "A" + emoji + "B")).toBe(
      "A " + emoji + " B",
    );
    expect(convertToPlainText(emoji + "\u0332")).toBe(emoji);
  });
  test("encoding variants have known results", () => {
    expect(output("morse", "SOS 1")).toBe("... --- ... / .----");
    expect(output("binary-ascii", "A1")).toBe("01000001 00110001");
    expect(output("hex-ascii", "A1")).toBe("41 31");
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
