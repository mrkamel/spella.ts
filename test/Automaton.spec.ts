import Automaton from "../src/Automaton"
import TrieNode from "../src/TrieNode"

describe("Automaton", () => {
  describe("correct", () => {
    it("returns all applicable corrections with correct distance, score and original", () => {
      const trieNode = new TrieNode()
      trieNode.insert("some phrase", 1.0)
      trieNode.insert("some phrases", 2.0)
      trieNode.insert("same phrases", 3.0)
      trieNode.insert("other", 4.0)

      const corrections = new Automaton({ text: "some phrase", maxEdits: 2 }).correct(trieNode)
      
      const terminalCorrections =
        corrections
          .filter((correction) => correction.isTerminal)
          .map((correction) => [correction.value.string, correction.distance, correction.score])

      expect(terminalCorrections.sort()).toEqual(
        [
          ["some phrase", 0, 1.0],
          ["some phrases", 1, 2.0],
          ["same phrases", 2, 3.0],
        ].sort()
      )

      const nonTerminalCorrections =
        corrections
          .filter((correction) => !correction.isTerminal)
          .map((correction) => [correction.value.string, correction.distance, correction.score])

      expect(nonTerminalCorrections.sort()).toEqual(
        [
          ["same phrase", 1, 0.0],
          ["some phras", 1, 0.0],
          ["same phras", 2, 0.0],
          ["some phra", 2, 0.0],
        ].sort()
      )

      expect(new Set(corrections.map((correction) => correction.original.string))).toEqual(new Set(["some phrase"]))
    })

    it("includes partial corrections", () => {
      const trieNode = new TrieNode()
      trieNode.insert("processing", 1.0)
      trieNode.insert("processor", 2.0)
      trieNode.insert("procedure", 3.0)
      trieNode.insert("proceed", 4.0)
      trieNode.insert("other", 5.0)

      const corrections = new Automaton({ text: "process", maxEdits: 1 }).correct(trieNode)

      expect(corrections.map((correction) => [correction.value.string, correction.distance, correction.score]).sort()).toEqual(
        [
          ["process", 0, 0.0],
          ["proces", 1, 0.0],
          ["processi", 1, 0.0],
          ["processo", 1, 0.0]
        ].sort()
      )
    })

    it("starts from the head of the given node list", () => {
      const trieNode = new TrieNode()
      trieNode.insert("preprocess", 1.0)
      trieNode.insert("postprocess", 2.0)
      trieNode.insert("preprocessor", 3.0)
      trieNode.insert("preprocessing", 4.0)
      trieNode.insert("other", 5.0)

      const corrections = new Automaton({ text: "process", maxEdits: 2 }).correct(trieNode.lookup("pre") as any)

      expect(corrections.filter((correction) => correction.isTerminal).map((correction) => [correction.value.string, correction.distance, correction.score]).sort()).toEqual(
        [
          ["preprocess", 0, 1.0],
          ["preprocessor", 2, 3.0],
        ].sort()
      )
    })

    it("adds distance one for deletions", () => {
      const trieNode = new TrieNode()
      trieNode.insert("keyword", 1.0)

      const correction = new Automaton({ text: "keyyword", maxEdits: 1 }).correct(trieNode).map((correction) => [correction.value.string, correction.distance])[0]

      expect(correction).toEqual(["keyword", 1])
    })

    it("adds distance one for insertions", () => {
      const trieNode = new TrieNode()
      trieNode.insert("keyword", 1.0)

      const correction = new Automaton({ text: "keword", maxEdits: 1 }).correct(trieNode).map((correction) => [correction.value.string, correction.distance])[0]

      expect(correction).toEqual(["keyword", 1])
    })

    it("adds distance one for transpositions", () => {
      const trieNode = new TrieNode()
      trieNode.insert("keyword", 1.0)

      const correction = new Automaton({ text: "kewyord", maxEdits: 1 }).correct(trieNode).map((correction) => [correction.value.string, correction.distance])[0]

      expect(correction).toEqual(["keyword", 1])
    })

    it("adds distance one for transliterations", () => {
      const trieNode = new TrieNode()
      trieNode.insert("keywörd", 1.0)

      const correction = new Automaton({ text: "keywoerd", maxEdits: 1 }).correct(trieNode).map((correction) => [correction.value.string, correction.distance])[0]

      expect(correction).toEqual(["keywörd", 1])
    })
  })
})
