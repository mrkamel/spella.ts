import { transliterate } from "./transliterate"

export default class TransliterableString {
  readonly string: string
  private _transliteratedString: string | null = null

  constructor(str: string) {
    this.string = str
  }

  wordCount(): number {
    let res = 1

    for (const char of this.string) {
      if (char === " ") res++
    }

    return res
  }

  transliteratedString() {
    if (this._transliteratedString) return this._transliteratedString

    this._transliteratedString = transliterate(this.string)

    return this._transliteratedString
  }
}