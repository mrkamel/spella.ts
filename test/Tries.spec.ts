import Tries from "../src/Tries"

jest.mock("fs", () => ({
  readFileSync: jest.fn().mockReturnValue("en\tsome phrase\t1.0\nde\tandere phrase\t2.0")
}))

describe("Tries", () => {
  describe("addFile", () => {
    it("reads and inserts the data from the specified file", () => {
      const tries = new Tries()
      tries.addFile("test.dic")

      const trieNode1 = tries.get("en")?.lookup("some phrase")

      expect(trieNode1?.score).toEqual(1.0)
      expect(trieNode1?.getPhrase()).toEqual("some phrase")

      const trieNode2 = tries.get("de")?.lookup("andere phrase")

      expect(trieNode2?.score).toEqual(2.0)
      expect(trieNode2?.getPhrase()).toEqual("andere phrase")
    })
  })

  describe("insert", () => {
    it("inserts the phrase into the correct trie", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })
      tries.insert({ language: "de", phrase: "andere phrase", score: 2.0 })

      const trieNode1 = tries.get("en")?.lookup("some phrase")

      expect(trieNode1?.score).toEqual(1.0)
      expect(trieNode1?.getPhrase()).toEqual("some phrase")

      const trieNode2 = tries.get("de")?.lookup("andere phrase")

      expect(trieNode2?.score).toEqual(2.0)
      expect(trieNode2?.getPhrase()).toEqual("andere phrase")
    })
  })

  describe("get", () => {
    it("returns the trie for the specified language", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })
      tries.insert({ language: "de", phrase: "andere phrase", score: 2.0 })

      expect(tries.get("en")).not.toBeUndefined()
      expect(tries.get("de")).not.toBeUndefined()
      expect(tries.get("fr")).toBeUndefined()
    })
  })
})
