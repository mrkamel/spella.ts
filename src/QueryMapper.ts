import TrieNode from "./TrieNode"
import Tries from "./Tries"
import Correction from "./Correction"
import TransliterableString from "./TransliterableString"
import Automaton from "./Automaton"

/**
 * The QueryMapper takes an input string, splits it by whitespace and greedily
 * searches for the longest correction. Uses intermediary nodes as an
 * optimization to avoid correcting the prefix words again when a longer one
 * gets corrected.
 */

export default class QueryMapper {
  readonly string: string
  readonly language: string
  readonly tries: Tries
  readonly trie: TrieNode

  constructor({ string, language, tries }: { string: string, language: string, tries: Tries }) {
    this.string = string
    this.language = language
    this.tries = tries
    this.trie = tries.get(language)
  }

  map({ maxLookahead = 5 }: { maxLookahead: number } = { maxLookahead: 5 }): Correction {
    if (!this.trie) {
      return new Correction({
        value: new TransliterableString(this.string),
        original: new TransliterableString(this.string),
        distance: 0,
        score: 0.0,
      })
    }

    const words = this.string.split(" ").filter((e) => e.length > 0)
    const corrections: Correction[] = []
    let i = 0

    while (i < words.length) {
      const max = Math.min(maxLookahead, words.length - i)
      const correction = this.correct({ words, firstIndex: i, lastIndex: i + max - 1, trieNode: this.trie }) || new Correction({
        value: new TransliterableString(words[i]),
        original: new TransliterableString(words[i]),
        distance: 0,
        score: 0.0,
      })

      corrections.push(correction)

      i += correction.original.wordCount()
    }

    return new Correction({
      value: new TransliterableString(corrections.map((correction) => correction.value.string).join(", ")),
      original: new TransliterableString(this.string),
      distance: corrections.reduce((acc, cur) => acc + cur.distance, 0),
      score: corrections.reduce((acc, cur) => acc + cur.score, 0.0),
    })
  }


  /**
   * Returns the best correction that matches the edit distance criteria by recursively
   * and greedily correcting the list of words up until a word can not be corrected
   * anymore. This guarantees that every single word has the specified max edit
   * distance at most. Otherwise we'd need to increase the max edit distance the
   * longer the string we try to correct, which is not optimal performance wise and we
   * wouldn't be able to guarantee a max edit distance per word.
   */

  correct(
    { words, firstIndex, lastIndex, trieNode, phrase = false }: {
      words: string[],
      firstIndex: number,
      lastIndex: number,
      trieNode: TrieNode,
      phrase?: boolean,
    }
  ): Correction | null {
    const word = words[firstIndex]
    const maxEdits = word.length <= 3 ? 0 : (word.length <= 8 ? 1 : 2)
    const string = phrase ? ` ${word}` : word
    let bestCorrection: Correction | null = null

    new Automaton({ string, maxEdits }).correct(trieNode).forEach((correction) => {
      let currentCorrection = correction

      if (firstIndex < lastIndex) {
        const longerCorrection = this.correct({
          words,
          firstIndex: firstIndex + 1,
          lastIndex,
          trieNode: correction.trieNode!,
          phrase: true,
        })

        if (longerCorrection) {
          currentCorrection = new Correction({
            value: longerCorrection.value,
            original: new TransliterableString(`${correction.original.string}${longerCorrection.original.string}`),
            distance: longerCorrection.distance + correction.distance,
            score: longerCorrection.score,
            isTerminal: longerCorrection.isTerminal,
            trieNode: longerCorrection.trieNode,
          })
        }
      }

      if (currentCorrection.isTerminal) {
        bestCorrection = this.bestCorrectionOf(bestCorrection || currentCorrection, currentCorrection)
      }
    })

    return bestCorrection
  }

  /**
   * Returns the best correction out of two corrections. The criteria for choosing
   * the best correction are:
   * 1. The number of words corrected (more is better)
   * 2. The correction itself with its sort order
   */

  bestCorrectionOf(correction1: Correction, correction2: Correction) {
    if (correction1.original.wordCount() > correction2.original.wordCount()) return correction1
    if (correction1.original.wordCount() < correction2.original.wordCount()) return correction2

    if (correction1.compareTo(correction2) < 0) return correction1

    return correction2
  }
}