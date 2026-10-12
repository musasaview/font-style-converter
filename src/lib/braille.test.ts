import { expect, test } from "bun:test";
import { toBraille } from "./braille";
import { convertAll } from "./catalog";

test("kana and katakana share Japanese braille, including halfwidth", () => {
  expect(toBraille("あいうえお")).toBe("⠁⠃⠉⠋⠊");
  expect(toBraille("カキクケコ")).toBe("⠡⠣⠩⠫⠪");
  expect(toBraille("がぱきゃぎゃぴゃ")).toBe("⠐⠡⠠⠥⠈⠡⠘⠡⠨⠥");
  expect(toBraille("ｶﾞﾊﾟｷｬ")).toBe(toBraille("がぱきゃ"));
  expect(toBraille("っーん")).toBe("⠂⠒⠴");
});
test("foreign, capital and number prefixes are retained", () => {
  expect(toBraille("abc ABC Abc 123")).toBe("⠰⠁⠃⠉ ⠰⠠⠠⠁⠃⠉ ⠰⠠⠁⠃⠉ ⠼⠁⠃⠉");
  expect(toBraille("3.07")).toBe("⠼⠉⠂⠚⠛");
  expect(toBraille("5えん")).toBe("⠼⠑⠤⠋⠴");
  expect(toBraille("Tしゃつ")).toBe("⠰⠠⠞⠤⠈⠱⠝");
});
test("foreign sounds and unsupported text", () => {
  expect(toBraille("ふぁてぃうぇ")).toBe("⠢⠥⠈⠗⠢⠋");
  expect(toBraille("漢字 😀\r\n")).toBe("漢字 😀\r\n");
  expect(toBraille("")).toBe("");
});
test("braille card uses undecorated input", () => {
  const result = convertAll("𝐀𝐛𝐜 ① が").results.find(
    (result) => result.style.id === "braille",
  )!;
  expect(result.output).toBe(toBraille("Abc 1 が"));
});
