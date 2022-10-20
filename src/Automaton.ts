import TransliterableString from "./TransliterableString"
import Correction from "./Correction"
import TrieNode from "./TrieNode"
import { transliterateChar } from "./transliterate"

interface State {
  indices: number[]
  values: number[]
}

/**
 * Implements a levenshtein automaton as described in
 * https://julesjacobs.com/2015/06/17/disqus-levenshtein-simple-and-fast.html
 */

export default class Automaton {
  readonly text: string
  readonly maxEdits: number
  private _transliteratedString: TransliterableString | null = null

  constructor({ text, maxEdits }: { text: string, maxEdits: number }) {
    this.text = text
    this.maxEdits = maxEdits
  }

  transliteratedString(): TransliterableString {
    if (this._transliteratedString) return this._transliteratedString

    this._transliteratedString = new TransliterableString(this.text)

    return this._transliteratedString
  }

  /**
   * Returns all available corrections which have distance <= maxEdits.
   * Partial matches are also considered as matches which is reflected
   * by the isTerminal property of the returned corrections. Partial
   * matches delimited by whitespace are treated as regular matches.
   */

  correct(trieNode: TrieNode): Correction[] {
    return this.correctRecursive(trieNode, this.start())
  }

  correctRecursive(trieNode: TrieNode, state: State): Correction[] {
    const res: Correction[] = []
    const distance = state.values[state.values.length - 1]

    if (this.isMatch(state)) { // TODO do we need non-terminal corrections at all?
      res.push(
        new Correction({
          value: new TransliterableString(trieNode.getPhrase()),
          original: this.transliteratedString(),
          distance,
          score: trieNode.score,
          isTerminal: trieNode.isTerminal,
          trieNode,
        })
      )
    }

    trieNode.children.forEach((_, char) => {
      const newState = this.step(state, char, trieNode.char)

      if (this.canMatch(newState)) {
        const corrections = this.correctRecursive(trieNode.children.get(char)!, newState)

        for (const correction of corrections) res.push(correction)
      }
    })

    return res
  }

  start(): State {
    return {
      indices: [...Array(this.maxEdits + 1)].map((_, i) => i),
      values: [...Array(this.maxEdits + 1)].map((_, i) => i)
    }
  }

  step(curState: State, curChar: string, prevChar: string | null): State {
    const indices = curState.indices
    const values = curState.values

    const newIndices: number[] = []
    const newValues: number[] = []

    if (indices.length > 0 && indices[0] === 0 && values[0] < this.maxEdits) {
      newIndices.push(0)
      newValues.push(values[0] + 1)
    }

    for (let j = 0; j < indices.length; j++) {
      const i = indices[j]

      if (i === this.text.length) break

      const cost = this.calculateCost(i, curChar, prevChar)
      let value = values[j] + cost

      if (newIndices.length > 0 && newIndices[newIndices.length - 1] === i) {
        value = Math.min(value, newValues[newValues.length - 1] + 1)
      }

      if (j + 1 < indices.length && indices[j + 1] === i + 1) {
        value = Math.min(value, values[j + 1] + 1)
      }

      if (value <= this.maxEdits) {
        newIndices.push(i + 1)
        newValues.push(value)
      }
    }

    return { indices: newIndices, values: newValues }
  }

  isMatch(state: State): boolean {
    return state.indices.length > 0 && state.indices[state.indices.length - 1] === this.text.length
  }

  canMatch(state: State): boolean {
    return state.indices.length > 0
  }

  private calculateCost(i: number, curChar: string, prevChar: string | null): number {
    if (this.text[i] === curChar) return 0

    // Handle transposition

    if (i > 0 && prevChar && this.text[i - 1] === curChar && this.text[i] === prevChar) return 0

    // Handle transliteration

    const ascii: string | null = transliterateChar(curChar)
    if (ascii && i > 0 && this.text[i - 1] === ascii[0] && this.text[i] === ascii[1]) return 0

    return 1
  }
}
