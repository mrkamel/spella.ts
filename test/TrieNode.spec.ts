import TrieNode from "../src/TrieNode"

describe("TrieNode", () => {
  describe("insert", () => {
    it("inserts the specified string", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)

      expect(trieNode.lookup("some phrase")?.getPhrase()).toEqual("some phrase")
    })

    it("does not do anything if the specified string is empty", () => {
      const trieNode = new TrieNode()
      trieNode.insert("", 1.0)

      expect(trieNode.isTerminal).toEqual(false)
      expect(trieNode.parent).toBeNull()
    })

    it("sets isTerminal to true for the last node", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)

      expect(trieNode.lookup("some")?.isTerminal).toEqual(true)
      expect(trieNode.lookup("some phrase")?.score).toEqual(1.0)
    })

    it("sets the score for the last node", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)

      expect(trieNode.lookup("some")?.score).toEqual(0.0)
      expect(trieNode.lookup("some phrase")?.score).toEqual(1.0)
    })
  })

  describe("lookup", () => {
    it("returns the node of the last character when the full phrase can be found", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)
      trieNode.insert("another phrase", 2.0)

      expect(trieNode.lookup("some phrase")?.getPhrase()).toEqual("some phrase")
      expect(trieNode.lookup("some phrase")?.score).toEqual(1.0)

      expect(trieNode.lookup("another phrase")?.getPhrase()).toEqual("another phrase")
      expect(trieNode.lookup("another phrase")?.score).toEqual(2.0)
    })

    it("returns undefined when the phrase is not fully present", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)

      expect(trieNode.lookup("some phrases")).toBeUndefined()
      expect(trieNode.lookup("unknown")).toBeUndefined()
    })
  })

  describe("getPhrase", () => {
    it("returns the phrase represented by the node", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)

      expect(trieNode.lookup("some phrase")?.getPhrase()).toEqual("some phrase")
    })
  })
})
