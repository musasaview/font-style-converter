import { describe, expect, test } from "bun:test";
import { catalog, convertAll } from "./catalog";
import { STYLES } from "./character-maps";
import { convertText, graphemes } from "./converter";

describe("conversion from undecorated input", () => {
  test("all conversions start from the plain result", () => {
    const { plainText, results } = convertAll("⒣ⓔ𝕝𝕝ⓞ ①");
    expect(plainText).toBe("hello 1");
    const output = (id: string) =>
      results.find((result) => result.style.id === id)!.output;
    expect(output("Bold")).toBe("𝐡𝐞𝐥𝐥𝐨 𝟏");
    expect(output("full")).toBe("ｈｅｌｌｏ　１");
    expect(output("half")).toBe("hello 1");
    expect(output("dakuten")).toBe(
      "h\u3099e\u3099l\u3099l\u3099o\u3099 1\u3099",
    );
  });
  test("radicals are undecorated once, without a second conversion to modern kanji", () => {
    const { plainText, results } = convertAll("⿓⿆⿊");
    expect(plainText).toBe("龍麥黑");
    const unchangedStyles = [
      "plain", "upper", "lower", "invert", "full", "half", "old-kanji",
      "superscript", "arabic-indic-digits",
    ];
    for (const { style, output } of results) {
      if (style.id in STYLES || unchangedStyles.includes(style.id))
        expect(output).toBe(plainText);
    }
    const mixed = convertAll("⿓ ⿆ ⿊ 𝐀 ①");
    expect(mixed.plainText).toBe("龍 麥 黑 A 1");
    expect(mixed.results.find(({ style }) => style.id === "Bold")!.output).toBe(
      "龍 麥 黑 𝐀 𝟏",
    );
    // The standalone entry point still undecorates its own input once.
    expect(convertText("⿓ ⿆ ⿊ 𝐀 ①", STYLES.Bold)).toBe("龍 麥 黑 𝐀 𝟏");
  });
  test("converters accept shared immutable graphemes", () => {
    const text = "Abc 123\r\n日本語 👨‍👩‍👧‍👦 A\u3099";
    const clusters = Object.freeze(graphemes(text));
    for (const style of catalog) {
      expect(style.convert(text, clusters)).toContain("\r\n");
    }
    expect(clusters.join("")).toBe(text);
  });
  test("uppercase-only styles accept lowercase", () => {
    expect(convertText("Abc", STYLES.Squared)).toBe("🄰🄱🄲");
    expect(convertText("abc", STYLES["Negative Circled"])).toBe("🅐🅑🅒");
  });
  test("lowercase-only styles accept uppercase", () => {
    expect(convertText("ABC", STYLES.Parenthesized)).toBe("⒜⒝⒞");
    expect(convertText("ABC", STYLES["Small Caps"])).toBe("ᴀʙᴄ");
  });
  test("styles with both cases preserve case", () => {
    expect(convertText("AbC", STYLES.Bold)).toBe("𝐀𝐛𝐂");
  });
  test("unsupported symbols and emoji are retained during case fallback", () => {
    expect(convertText("abc!? 👨‍👩‍👧‍👦 1️⃣", STYLES.Squared)).toBe("🄰🄱🄲!? 👨‍👩‍👧‍👦 1️⃣");
  });
  test("an undecoration-only result is unchanged relative to the plain source", () => {
    const { plainText, results } = convertAll("𝐀𝐁𝐂");
    expect(
      results.find((result) => result.style.id === "Dice Numbers")!.output,
    ).toBe(plainText);
    expect(
      results.find((result) => result.style.id === "Bold")!.output,
    ).not.toBe(plainText);
  });
  test("specimens put numbers after letters", () => {
    const specimen = catalog.find((style) => style.id === "Bold")!.specimen!;
    expect(specimen.startsWith("𝐀𝐁𝐂")).toBe(true);
    expect(specimen.endsWith("𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗")).toBe(true);
  });
});
