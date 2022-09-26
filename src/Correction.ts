import TransliterableString from "./TransliterableString"
import TrieNode from "./TrieNode"

export default class Correction {
  readonly value: TransliterableString
  readonly original: TransliterableString
  readonly distance: number
  readonly score: number
  readonly isTerminal: boolean
  readonly trieNode: TrieNode | null
  private _matchesTranslitedated: boolean | null = null

  constructor(
    { value, original, distance, score, isTerminal = true, trieNode = null }: {
      value: TransliterableString,
      original: TransliterableString,
      distance: number,
      score: number,
      isTerminal?: boolean,
      trieNode?: TrieNode | null,
    }
  ) {
    this.value = value
    this.original = original
    this.distance = distance
    this.score = score
    this.isTerminal = isTerminal
    this.trieNode = trieNode
  }

  /**
   * A correction is better/smaller when
   * 1. the distance is less
   * 2. it matches the original when transliterated
   * 3. the score is higher
   */

  compareTo(other: Correction): number {
    if (this.distance < other.distance) return -1
    if (this.distance > other.distance) return 1

    if (this.matchesTransliterated() && !other.matchesTransliterated()) return -1
    if (!this.matchesTransliterated() && other.matchesTransliterated()) return 1

    if (this.score > other.score) return -1
    if (this.score < other.score) return 1

    return 0
  }

  matchesTransliterated() {
    if (this._matchesTranslitedated !== null) return this._matchesTranslitedated

    this._matchesTranslitedated = this.value.transliteratedString() === this.original.transliteratedString()

    return this._matchesTranslitedated
  }
}