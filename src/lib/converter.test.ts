import { test, expect, describe } from "bun:test";
import {
  convertText,
  convertToPlainText,
  fullWidth,
  halfWidth,
  addCombiningDakutenToAll,
  addHalfwidthDakutenToAll,
  toUpperCase,
  toLowerCase,
} from "./converter";
import { STYLES } from "./character-maps";

describe("convertText", () => {
  test("converts characters based on mapping", () => {
    const charMap = { A: "𝐀", B: "𝐁", C: "𝐂" };
    expect(convertText("ABC", charMap)).toBe("𝐀𝐁𝐂");
  });

  test("preserves unmapped characters", () => {
    const charMap = { A: "𝐀", B: "𝐁" };
    expect(convertText("ABC", charMap)).toBe("𝐀𝐁C");
  });

  test("handles empty input", () => {
    expect(convertText("", STYLES.Bold)).toBe("");
  });

  test("handles empty mapping", () => {
    expect(convertText("ABC", {})).toBe("ABC");
  });

  test("converts full alphabet with numbers", () => {
    expect(convertText("Hello World 123", STYLES.Bold)).toBe("𝐇𝐞𝐥𝐥𝐨 𝐖𝐨𝐫𝐥𝐝 𝟏𝟐𝟑");
  });
});

describe("convertToPlainText", () => {
  test("converts bold text back to plain", () => {
    expect(convertToPlainText("𝐇𝐞𝐥𝐥𝐨")).toBe("Hello");
  });

  test("converts italic text back to plain", () => {
    expect(convertToPlainText("𝐻𝑒𝑙𝑙𝑜")).toBe("Hello");
  });

  test("converts monospace text back to plain", () => {
    expect(convertToPlainText("𝙷𝚎𝚕𝚕𝚘")).toBe("Hello");
  });

  test("preserves manually added combining marks", () => {
    const textWithDakuten = "H\u3099e\u3099l\u3099l\u3099o\u3099";
    expect(convertToPlainText(textWithDakuten)).toBe(textWithDakuten);
  });

  test("handles empty input", () => {
    expect(convertToPlainText("")).toBe("");
  });

  test("preserves plain text", () => {
    expect(convertToPlainText("Hello World")).toBe("Hello World");
  });

  test("converts mixed styled text", () => {
    expect(convertToPlainText("𝐇𝑒𝚕𝚕𝚘")).toBe("Hello");
  });
});

describe("fullWidth and halfWidth", () => {
  test("fullWidth converts to full-width characters", () => {
    const result = fullWidth("ABC123");
    expect(result).toMatch(/[Ａ-Ｚ０-９]/);
  });

  test("halfWidth converts to half-width characters", () => {
    const result = halfWidth("ＡＢＣ１２３");
    expect(result).toBe("ABC123");
  });

  test("fullWidth handles empty string", () => {
    expect(fullWidth("")).toBe("");
  });

  test("halfWidth handles empty string", () => {
    expect(halfWidth("")).toBe("");
  });
});

describe("dakuten functions", () => {
  test("addCombiningDakutenToAll adds combining dakuten", () => {
    const result = addCombiningDakutenToAll("ABC");
    expect(result).toBe("A\u3099B\u3099C\u3099");
  });

  test("addHalfwidthDakutenToAll adds halfwidth dakuten", () => {
    const result = addHalfwidthDakutenToAll("ABC");
    expect(result).toBe("A\uFF9EB\uFF9EC\uFF9E");
  });

  test("addCombiningDakutenToAll handles empty string", () => {
    expect(addCombiningDakutenToAll("")).toBe("");
  });

  test("addHalfwidthDakutenToAll handles empty string", () => {
    expect(addHalfwidthDakutenToAll("")).toBe("");
  });
});

describe("case conversion functions", () => {
  test("toUpperCase converts to uppercase", () => {
    expect(toUpperCase("hello")).toBe("HELLO");
  });

  test("toUpperCase handles styled text", () => {
    expect(toUpperCase("𝐡𝐞𝐥𝐥𝐨")).toBe("HELLO");
  });

  test("toLowerCase converts to lowercase", () => {
    expect(toLowerCase("HELLO")).toBe("hello");
  });

  test("toLowerCase handles styled text", () => {
    expect(toLowerCase("𝐇𝐄𝐋𝐋𝐎")).toBe("hello");
  });

  test("case functions handle empty strings", () => {
    expect(toUpperCase("")).toBe("");
    expect(toLowerCase("")).toBe("");
  });
});

describe("unicode normalization", () => {
  test("normalizes input before conversion", () => {
    const composedE = "\u00E9";
    const decomposedE = "e\u0301";

    expect(composedE).not.toBe(decomposedE);

    const result1 = convertText("café", STYLES.Bold);
    const result2 = convertText("cafe\u0301", STYLES.Bold);

    expect(result1).toBe(result2);
  });

  test("handles normalization in fullWidth", () => {
    const composedE = "café";
    const decomposedE = "cafe\u0301";

    const result1 = fullWidth(composedE);
    const result2 = fullWidth(decomposedE);

    expect(result1).toBe(result2);
  });

  test("handles normalization in convertToPlainText", () => {
    const composedText = "é";
    const decomposedText = "e\u0301";

    expect(convertToPlainText(composedText)).toBe(
      convertToPlainText(decomposedText),
    );
  });

  test("handles katakana with dakuten correctly", () => {
    const katakana = "ガギグゲゴ";
    const result = convertText(katakana, STYLES.Bold);
    expect(result).toBe(katakana);
  });

  test("preserves katakana dakuten in convertToPlainText", () => {
    const input = "ガギグゲゴ";
    expect(convertToPlainText(input)).toBe(input);
  });
});

describe("edge cases and integration", () => {
  test("converts and reverts text correctly", () => {
    const original = "Hello World 123";

    const converted = convertText(original, STYLES.Bold);
    const reverted = convertToPlainText(converted);

    expect(reverted).toBe(original);
  });

  test("handles special characters and spaces", () => {
    const text = "Hello, World! @#$%";

    const converted = convertText(text, STYLES.Bold);
    expect(converted).toContain(",");
    expect(converted).toContain("!");
    expect(converted).toContain("@");
  });

  test("handles unicode properly", () => {
    const emoji = "Hello 👋 World 🌍";

    const converted = convertText(emoji, STYLES.Bold);
    expect(converted).toContain("👋");
    expect(converted).toContain("🌍");
  });

  test("handles Japanese text", () => {
    const japanese = "こんにちは世界";
    expect(convertText(japanese, STYLES.Bold)).toBe(japanese);
  });
});

describe("restored conversion behavior", () => {
  test("style conversion normalizes width, units and ligatures", () => {
    expect(convertText("A ｶﾞ ㍿ ① ﬀ Ａ", STYLES.Bold)).toBe(
      "𝐀 ガ 株式会社 𝟏 𝐟𝐟 𝐀",
    );
  });
  test("plain text restores characters borrowed by Fancy Strong", () => {
    expect(convertToPlainText("к є χ ค ๑")).toBe("k e x a q");
  });
  test("parenthesized letters are reversed before compatibility decomposition", () => {
    expect(convertToPlainText("⒜⒝⑴⑵")).toBe("ab12");
  });
  test("inverse collisions prefer original Japanese rather than numeric lookalikes", () => {
    expect(convertToPlainText("㊀㊁")).toBe("一二");
  });
  test("width conversion also normalizes compatibility characters", () => {
    expect(halfWidth("Ａ　ガギグゲゴ パピプペポ ヴ。「」①㍿")).toBe(
      "A ｶﾞｷﾞｸﾞｹﾞｺﾞ ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ ｳﾞ｡｢｣1株式会社",
    );
    expect(fullWidth("A ｶﾞｷﾞｸﾞｹﾞｺﾞ ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ ｳﾞ｡｢｣①㍿")).toBe(
      "Ａ　ガギグゲゴ　パピプペポ　ヴ。「」１株式会社",
    );
  });
  test("dakuten decorates whole emoji clusters and preserves whitespace", () => {
    const emoji = "👨‍👩‍👧‍👦 👍🏽 🇯🇵 1️⃣ ❤️";
    expect(addCombiningDakutenToAll(emoji + "\t\r\n!")).toBe(
      "👨‍👩‍👧‍👦\u3099 👍🏽\u3099 🇯🇵\u3099 1️⃣\u3099 ❤️\u3099\t\r\n!\u3099",
    );
    expect(addHalfwidthDakutenToAll(emoji)).toBe("👨‍👩‍👧‍👦ﾞ 👍🏽ﾞ 🇯🇵ﾞ 1️⃣ﾞ ❤️ﾞ");
  });
  test("dakuten is appended to graphemes, not inside combining sequences", () => {
    expect(addCombiningDakutenToAll("e\u0301")).toBe("é\u3099");
    expect(addCombiningDakutenToAll("A\u3099")).toBe("A\u3099\u3099");
  });
  test("plain text preserves emoji presentation and keycaps", () => {
    expect(convertToPlainText("🅰️ 1️⃣ 👨‍👩‍👧‍👦")).toBe("🅰️ 1️⃣ 👨‍👩‍👧‍👦");
  });
});

describe("character map regressions", () => {
  test("keycaps survive style and full-width conversion", () => {
    expect(convertText("1️⃣ 2", STYLES.Bold)).toBe("1️⃣ 𝟐");
    expect(fullWidth("1️⃣ 2")).toBe("1️⃣　２");
  });
  test("playing cards use queens and kings, not knights", () => {
    expect(convertText("JQK", STYLES["Spades ♠"])).toBe("🂫🂭🂮");
    expect(convertText("JQK", STYLES["Hearts ♥"])).toBe("🂻🂽🂾");
    expect(convertText("JQK", STYLES["Diamonds ♦"])).toBe("🃋🃍🃎");
    expect(convertText("JQK", STYLES["Clubs ♣"])).toBe("🃛🃝🃞");
  });
});

describe("restored original features", () => {
  test("converts fullwidth and already styled letters directly", () => {
    expect(convertText("Ａ𝘈𝐴A", STYLES.Bold)).toBe("𝐀𝐀𝐀𝐀");
  });
  test("restores small caps and mixed letters", () => {
    expect(convertToPlainText(convertText("hello", STYLES["Small Caps"]))).toBe(
      "hello",
    );
    expect(
      convertToPlainText(convertText("Hello", STYLES["Fancy Strong"])),
    ).toBe("Hello");
  });
  test("normalizes compatibility characters in the plain result", () => {
    expect(convertToPlainText("㍿ ﬀ Ａ ｶﾞ")).toBe("株式会社 ff A ガ");
  });
  test("adds dakuten to symbols and permits repeated additions", () => {
    expect(addCombiningDakutenToAll("!★😀")).toBe("!\u3099★\u3099😀\u3099");
    expect(addCombiningDakutenToAll(addCombiningDakutenToAll("A"))).toBe(
      "A\u3099\u3099",
    );
    expect(addHalfwidthDakutenToAll("!★😀")).toBe("!ﾞ★ﾞ😀ﾞ");
  });
});
