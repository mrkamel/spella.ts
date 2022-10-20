import { transliterate, transliterateChar } from "../src/transliterate"

describe("transliterate", () => {
  describe("transliterate", () => {
    expect(transliterate("AbcÄüÖßDef")).toEqual("AbcAeueOessDef")
  })

  describe("transliterateChar", () => {
    it("returns the transliterated string", () => {
      expect(transliterateChar("Ä")).toEqual("Ae")
      expect(transliterateChar("ö")).toEqual("oe")
    })
  })
})
