import Correction from "../src/Correction"
import { buildCorrection } from "./factories"

describe("Correction", () => {
  describe("compareTo", () => {
    it("returns -1 or 1 when the distance is smaller or higher", () => {
      const correction1 = buildCorrection({ distance: 1 })
      const correction2 = buildCorrection({ distance: 2 })

      expect(correction1.compareTo(correction2)).toEqual(-1)
      expect(correction2.compareTo(correction1)).toEqual(1)
    })

    it("returns -1 or 1 when the score is higher or smaller", () => {
      const correction1 = buildCorrection({ score: 1.0 })
      const correction2 = buildCorrection({ score: 2.0 })

      expect(correction1.compareTo(correction2)).toEqual(1)
      expect(correction2.compareTo(correction1)).toEqual(-1)
    })

    it("returns -1 or 1 when the transliteration matches or not matches", () => {
      const correction1 = buildCorrection({ value: "süden", original: "sueden" })
      const correction2 = buildCorrection({ value: "value", original: "original" })

      expect(correction1.compareTo(correction2)).toEqual(-1)
      expect(correction2.compareTo(correction1)).toEqual(1)
    }) 

    it("returns 0 when distance, score and transliteration check is equal", () => {
      const correction1 = buildCorrection({ value: "value1", original: "original1", distance: 1, score: 1.0 })
      const correction2 = buildCorrection({ value: "value2", original: "original2", distance: 1, score: 1.0 })

      expect(correction1.compareTo(correction2)).toEqual(0)
    })
  })

  describe("matchesTransliterated", () => {
    it("returns true when the transliterated value matches the transliterated original", () => {
      expect(buildCorrection({ value: "süden", original: "sueden" }).matchesTransliterated()).toEqual(true)
    })

    it("returns false when the transliterated value does not match the transliterated original", () => {
      expect(buildCorrection({ value: "value", original: "original" }).matchesTransliterated()).toEqual(false)
    })
  })
})
