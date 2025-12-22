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
  toggleCase,
} from "./converter";
import { STYLES } from "./character-maps";

describe("convertText", () => {
  test("converts characters based on mapping", () => {
    const charMap = { A: '𝐀', B: '𝐁', C: '𝐂' };
    expect(convertText("ABC", charMap)).toBe("𝐀𝐁𝐂");
  });

  test("preserves unmapped characters", () => {
    const charMap = { A: '𝐀', B: '𝐁' };
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

  test("preserves newlines in single line break", () => {
    const charMap = { A: '𝐀', B: '𝐁', C: '𝐂' };
    expect(convertText("ABC\nDEF", charMap)).toBe("𝐀𝐁𝐂\nDEF");
  });

  test("preserves newlines in multiple lines", () => {
    const input = "Hello\nWorld\n123";
    const expected = "𝐇𝐞𝐥𝐥𝐨\n𝐖𝐨𝐫𝐥𝐝\n𝟏𝟐𝟑";
    expect(convertText(input, STYLES.Bold)).toBe(expected);
  });

  test("handles empty lines", () => {
    const input = "ABC\n\nDEF";
    const charMap = { A: '𝐀', B: '𝐁', C: '𝐂', D: '𝐃', E: '𝐄', F: '𝐅' };
    expect(convertText(input, charMap)).toBe("𝐀𝐁𝐂\n\n𝐃𝐄𝐅");
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
    expect(convertToPlainText(textWithDakuten)).toBe(textWithDakuten.normalize('NFKC'));
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

  test("addCombiningDakutenToAll preserves newlines", () => {
    const result = addCombiningDakutenToAll("AB\nCD");
    expect(result).toBe("A\u3099B\u3099\nC\u3099D\u3099");
  });

  test("addHalfwidthDakutenToAll preserves newlines", () => {
    const result = addHalfwidthDakutenToAll("AB\nCD");
    expect(result).toBe("A\uFF9EB\uFF9E\nC\uFF9ED\uFF9E");
  });

  test("addCombiningDakutenToAll skips spaces", () => {
    const result = addCombiningDakutenToAll("AB CD");
    expect(result).toBe("A\u3099B\u3099 C\u3099D\u3099");
  });

  test("addHalfwidthDakutenToAll skips spaces", () => {
    const result = addHalfwidthDakutenToAll("AB CD");
    expect(result).toBe("A\uFF9EB\uFF9E C\uFF9ED\uFF9E");
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

  test("toggleCase toggles case", () => {
    expect(toggleCase("Hello")).toBe("hELLO");
  });

  test("toggleCase handles styled text", () => {
    expect(toggleCase("𝐇𝐞𝐥𝐥𝐨")).toBe("hELLO");
  });

  test("toggleCase preserves non-alphabetic characters", () => {
    expect(toggleCase("Hello World 123")).toBe("hELLO wORLD 123");
  });

  test("case functions handle empty strings", () => {
    expect(toUpperCase("")).toBe("");
    expect(toLowerCase("")).toBe("");
    expect(toggleCase("")).toBe("");
  });

  test("toggleCase preserves newlines", () => {
    expect(toggleCase("Hello\nWorld")).toBe("hELLO\nwORLD");
  });

  test("toUpperCase preserves newlines", () => {
    expect(toUpperCase("hello\nworld")).toBe("HELLO\nWORLD");
  });

  test("toLowerCase preserves newlines", () => {
    expect(toLowerCase("HELLO\nWORLD")).toBe("hello\nworld");
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

    expect(convertToPlainText(composedText)).toBe(convertToPlainText(decomposedText));
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
