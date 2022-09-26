import fs from "fs"
import TrieNode from "./TrieNode"

/**
 * The Tries class is used to build one trie per language. It reads the
 * input files and inserts it to the trie for the respective language.
 */

export default class Tries {
  readonly tries: { [key:string]: TrieNode } = {}

  async addFile(path: string) {
    return this._readFile(path, (line) => {
      const [language, phrase, score] = line.split("\t")

      this.insert({ language, phrase, score: parseFloat(score) })
    })
  }

  insert({ language, phrase, score }: { language: string, phrase: string, score: number }) {
    let trieNode = this.tries[language]

    if (!trieNode) {
      trieNode = new TrieNode()

      this.tries[language] = trieNode
    }

    trieNode.insert(phrase.toLowerCase(), score)
  }

  get(language: string): TrieNode {
    return this.tries[language]
  }

  _readFile(path: string, fn: (line: string) => void) {
    fs.readFileSync(path, { encoding: "utf-8" }).split(/\r?\n/).filter((e) => e).forEach((line) => fn(line))
  }
}