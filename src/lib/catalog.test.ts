import { describe, expect, test } from "bun:test";
import { catalog, convertAll } from "./catalog";
import { STYLES } from "./character-maps";
import { convertText } from "./converter";

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
