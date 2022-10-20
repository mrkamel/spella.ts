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
  readonly query: string
  readonly language: string
  readonly tries: Tries
  readonly trie: TrieNode
  readonly allowedDistances: number[]
  readonly wordCorrectionCache: Map<string, Correction>

  constructor({ query, language, tries, allowedDistances }: { query: string, language: string, tries: Tries, allowedDistances: number[] }) {
    this.query = query
    this.language = language
    this.tries = tries
    this.trie = tries.get(language)
    this.allowedDistances = allowedDistances
    this.wordCorrectionCache = new Map()
  }

  map({ maxLookahead = 5 }: { maxLookahead: number } = { maxLookahead: 5 }): Correction {
    if (!this.trie) {
      return new Correction({
        value: new TransliterableString(this.query),
        original: new TransliterableString(this.query),
        distance: 0,
        score: 0.0,
      })
    }

    const words = this.query.split(" ").filter((e) => e.length > 0)
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
      original: new TransliterableString(this.query),
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
    const maxEdits = this.maxEdits(word)
    const wordCorrection = this.correctWord(word, maxEdits)
    const text = phrase ? ` ${word}` : word
    let bestCorrection: Correction | null = null

    new Automaton({ text, maxEdits }).correct(trieNode).forEach((correction) => {
      // Skip the phrase correction if the word correction distance is better
      if (wordCorrection && correction.distance > wordCorrection.distance) return

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
   * Returns the max number of edits for the given word.
   */

  maxEdits(word: string): number {
    for(let i = 0; i < this.allowedDistances.length; i++) {
      if (word.length < this.allowedDistances[i]) return i
    }

    return this.allowedDistances.length
  }

  /**
   * Lookup and cache the best correction of a single word.
   */

  correctWord(word: string, maxEdits: number): Correction | undefined {
    if (this.wordCorrectionCache.has(word)) return this.wordCorrectionCache.get(word)

    const correction =
      new Automaton({ text: word, maxEdits })
        .correct(this.trie)
        .sort((a, b) => a.compareTo(b))[0]

    this.wordCorrectionCache.set(word, correction)

    return correction
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
