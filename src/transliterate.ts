const mapping: { [key:string]: string } = {
  "Ä": "Ae",
  "Ö": "Oe",
  "Ü": "Ue",
  "ä": "ae",
  "ö": "oe",
  "ü": "ue",
  "ß": "ss"
}

/**
 * Transliterates a string to its respective ascii version.
 */

export function transliterate(str: string): string {
  let res = ""

  for (const char of str) {
    res += mapping[char] || char
  }

  return res
}

export function transliterateChar(char: string): string | null {
  return mapping[char]
}