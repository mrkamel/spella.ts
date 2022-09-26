/**
 * Implements a trie. The full string is not stored in each trie node to
 * minimize memory usage. Instead, it can be retrieved by traversing up
 * the trie and concatenating the characters of each node.
 */

export default class TrieNode {
  readonly parent: TrieNode | null
  readonly char: string | null
  isTerminal: boolean
  score: number
  readonly children: { [key:string]: TrieNode } = {}

  constructor(
    { parent = null, char = null, isTerminal = false, score = 0.0 }: {
      parent?: TrieNode | null,
      char?: string | null,
      isTerminal?: boolean,
      score?: number,
    } = {}
  ) {
    this.parent = parent
    this.char = char
    this.isTerminal = isTerminal
    this.score = score
  }

  insert(phrase: string, score: number) {
    if (phrase.length === 0) return

    let node: TrieNode = this

    for (let index = 0; index < phrase.length; index++) {
      const char = phrase[index]
      let newNode = node.children[char]

      if (!newNode) {
        newNode = new TrieNode({ parent: node, char })

        node.children[char] = newNode
      }

      node = newNode

      if (phrase.length <= index + 1 || phrase[index + 1] === " ") {
        node.isTerminal = true
      }
    }

    node.score = score
  }

  lookup(phrase: string): TrieNode | undefined {
    let res: TrieNode = this

    for (const char of phrase) {
      const cur = res.children[char]

      if (!cur) return

      res = cur
    }

    return res
  }

  getPhrase(): string {
    const res = []
    let curNode: TrieNode | null = this

    while (curNode) {
      res.push(curNode.char || "")
      curNode = curNode.parent
    }

    return res.reverse().join("")
  }

  root(): TrieNode {
    return this.parent?.root() || this
  }
}