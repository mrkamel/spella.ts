import TransliterableString from "../src/TransliterableString"

describe("TransliterableString", () => {
  describe("wordCount", () => {
    it("returns the number of words", () => {
      expect(new TransliterableString("some arbitrary string").wordCount()).toEqual(3)
      expect(new TransliterableString("another string").wordCount()).toEqual(2)
      expect(new TransliterableString("string").wordCount()).toEqual(1)
    })
  })

  describe("transliteratedString", () => {
    it("returns the transliterated string", () => {
      expect(new TransliterableString("AbcÄüÖßDef").transliteratedString()).toEqual("AbcAeueOessDef")
    })
  })
})
