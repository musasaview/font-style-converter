export function convertText(input: string, from: string, to: string): string {
  const fromChars = Array.from(from);
  const toChars = Array.from(to);

  let result = input;
  for (let i = 0; i < fromChars.length; i++) {
    const fromChar = fromChars[i];
    const toChar = toChars[i];
    if (fromChar && toChar) {
      result = result.replaceAll(fromChar, toChar);
    }
  }
  return result;
}
