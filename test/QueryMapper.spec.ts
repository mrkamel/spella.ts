import QueryMapper from "../src/QueryMapper"
import Tries from "../src/Tries"

describe("QueryMapper", () => {
  describe("map", () => {
    const allowedDistances = [4, 9]

    it("returns the corrections", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const corrections = new QueryMapper({ language: "en", query: "some phrse", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["some phrase"])
      expect(corrections.map((correction) => correction.original.string)).toEqual(["some phrse"])
      expect(corrections.map((correction) => correction.score)).toEqual([1.0])
    })

    it("applies the allowed distances", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const corrections1 = new QueryMapper({ language: "en", query: "some phrse", tries, allowedDistances: [100] }).map()

      expect(corrections1.map((correction) => correction.value.string)).toEqual(["some", "phrse"])
      expect(corrections1.map((correction) => correction.original.string)).toEqual(["some", "phrse"])
      expect(corrections1.map((correction) => correction.score)).toEqual([0.0, 0.0])

      const corrections2 = new QueryMapper({ language: "en", query: "some phse", tries, allowedDistances: [0, 0, 100] }).map()

      expect(corrections2.map((correction) => correction.value.string)).toEqual(["some phrase"])
      expect(corrections2.map((correction) => correction.original.string)).toEqual(["some phse"])
      expect(corrections2.map((correction) => correction.score)).toEqual([1.0])

      const corrections3 = new QueryMapper({ language: "en", query: "some phse", tries, allowedDistances: [0] }).map()

      expect(corrections3.map((correction) => correction.value.string)).toEqual(["some", "phse"])
      expect(corrections3.map((correction) => correction.original.string)).toEqual(["some", "phse"])
      expect(corrections3.map((correction) => correction.score)).toEqual([0.0, 0.0])
    })

    it("ignores the tries of other languages", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })
      tries.insert({ language: "de", phrase: "some phrse", score: 2.0 })

      const corrections = new QueryMapper({ language: "en", query: "some phrse", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["some phrase"])
    })

    it("returns the words as is when they can not be corrected", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const corrections = new QueryMapper({ language: "en", query: "some phrse anoter phrase", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["some phrase", "anoter", "phrase"])
      expect(corrections.map((correction) => correction.original.string)).toEqual(["some phrse", "anoter", "phrase"])
      expect(corrections.map((correction) => correction.distance)).toEqual([1, 0, 0])
      expect(corrections.map((correction) => correction.score)).toEqual([1.0, 0.0, 0.0])
    })

    it("returns the input as is when there is no trie for the specified language", () => {
      const corrections = new QueryMapper({ language: "en", query: "unkown phrse", tries: new Tries(), allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["unkown phrse"])
      expect(corrections.map((correction) => correction.original.string)).toEqual(["unkown phrse"])
      expect(corrections.map((correction) => correction.distance)).toEqual([0])
      expect(corrections.map((correction) => correction.score)).toEqual([0.0])
    })

    it("corrects all the words", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "beach bar", score: 1.0 })
      tries.insert({ language: "en", phrase: "cocktail", score: 2.0 })
      tries.insert({ language: "en", phrase: "summer", score: 3.0 })

      const corrections = new QueryMapper({ language: "en", query: "beahc bar cocktal summmer", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["beach bar", "cocktail", "summer"])
      expect(corrections.map((correction) => correction.distance)).toEqual([1, 1, 1])
      expect(corrections.map((correction) => correction.score)).toEqual([1.0, 2.0, 3.0])
    })

    it("splits words when neccessary", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const corrections = new QueryMapper({ language: "en", query: "somephrase", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["some phrase"])
    })

    it("joins words when neccessary", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "skyscraper", score: 1.0 })

      const corrections = new QueryMapper({ language: "en", query: "skys craper", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["skyscraper"])
    })

    it("applies a max distance per word", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "skyscraper", score: 1.0 })
      tries.insert({ language: "en", phrase: "beach bar", score: 2.0 })
      tries.insert({ language: "en", phrase: "cocktail", score: 3.0 })

      const corrections = new QueryMapper({ language: "en", query: "skscrapr beahc bar coktail", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["skscrapr", "beach bar", "cocktail"])
      expect(corrections.map((correction) => correction.distance)).toEqual([0, 1, 1])
      expect(corrections.map((correction) => correction.score)).toEqual([0.0, 2.0, 3.0])
    })

    it("prefers longer/greedy corrections", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some long phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "some long", score: 2.0 })
      tries.insert({ language: "en", phrase: "some", score: 3.0 })
      tries.insert({ language: "en", phrase: "long", score: 4.0 })
      tries.insert({ language: "en", phrase: "phrase", score: 5.0 })

      const corrections = new QueryMapper({ language: "en", query: "somee lnog phrse", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["some long phrase"])
      expect(corrections.map((correction) => correction.score)).toEqual([1.0])
    })

    it("does not prefer longer/greedy corrections when a single word correction has a smaller distance", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "some phrases", score: 2.0 })

      const corrections = new QueryMapper({ language: "en", query: "some phrase", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["some", "phrase"])
    })

    it("does not use partial corrections", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "another phrase", score: 1.0 })

      const corrections1 = new QueryMapper({ language: "en", query: "phras", tries, allowedDistances }).map()
      expect(corrections1.map((correction) => correction.value.string)).toEqual(["phrase"])

      const corrections2 = new QueryMapper({ language: "en", query: "another phras", tries, allowedDistances }).map()
      expect(corrections2.map((correction) => correction.value.string)).toEqual(["another phrase"])
    })

    it("prefers corrections with smaller distance", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase1", score: 1.0 })
      tries.insert({ language: "en", phrase: "phrase2", score: 1.0 })

      const corrections = new QueryMapper({ language: "en", query: "phrase1", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["phrase1"])
    })

    it("prefers corrections matching when transliterated", () => {
      const tries = new Tries()
      tries.insert({ language: "de", phrase: "schön", score: 1.0 })
      tries.insert({ language: "de", phrase: "schon", score: 2.0 })

      const corrections = new QueryMapper({ language: "de", query: "schoen", tries, allowedDistances }).map()

      expect(corrections.map((correction) => correction.value.string)).toEqual(["schön"])
    })
  })
})
