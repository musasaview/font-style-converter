// Helper to format characters as "UPPERCASE lowercase 0123456789"
export function formatCharacterSet(from: string, to: string): string {
  const fromChars = Array.from(from);
  const toChars = Array.from(to);
  
  const lowercase: string[] = [];
  const uppercase: string[] = [];
  const digits: string[] = [];
  
  for (let i = 0; i < fromChars.length; i++) {
    const fromChar = fromChars[i];
    const toChar = toChars[i];
    
    if (!fromChar || !toChar) continue;
    
    if (/[a-z]/.test(fromChar)) {
      lowercase.push(toChar);
    } else if (/[A-Z]/.test(fromChar)) {
      uppercase.push(toChar);
    } else if (/[0-9]/.test(fromChar)) {
      digits.push(toChar);
    }
  }
  
  const parts = [];
  if (uppercase.length > 0) parts.push(uppercase.join(''));
  if (lowercase.length > 0) parts.push(lowercase.join(''));
  if (digits.length > 0) parts.push(digits.join(''));

  return parts.join(' ');
}
