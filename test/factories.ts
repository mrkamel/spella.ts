import TransliterableString from "../src/TransliterableString"
import TrieNode from "../src/TrieNode"
import Correction from "../src/Correction"

export function buildCorrection(
  { value = "value", original = "original", distance = 1, score = 1.0, isTerminal = true, trieNode = null }:
  { value?: string, original?: string, distance?: number, score?: number, isTerminal?: boolean, trieNode?: TrieNode | null }
) {
  return new Correction({ value: new TransliterableString(value), original: new TransliterableString(original), distance, score, isTerminal, trieNode })
}
