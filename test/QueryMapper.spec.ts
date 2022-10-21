import QueryMapper from "../src/QueryMapper"
import Tries from "../src/Tries"

describe("QueryMapper", () => {
  describe("map", () => {
    const allowedDistances = [4, 9]

    it("returns the correction", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const correction = new QueryMapper({ language: "en", query: "some phrse", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("some phrase")
      expect(correction.original.string).toEqual("some phrse")
      expect(correction.score).toEqual(1.0)
    })

    it("applies the allowed distances", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const correction1 = new QueryMapper({ language: "en", query: "some phrse", tries, allowedDistances: [100] }).map()

      expect(correction1.value.string).toEqual("some, phrse")
      expect(correction1.original.string).toEqual("some phrse")
      expect(correction1.score).toEqual(0.0)

      const correction2 = new QueryMapper({ language: "en", query: "some phse", tries, allowedDistances: [0, 0, 100] }).map()

      expect(correction2.value.string).toEqual("some phrase")
      expect(correction2.original.string).toEqual("some phse")
      expect(correction2.score).toEqual(1.0)

      const correction3 = new QueryMapper({ language: "en", query: "some phse", tries, allowedDistances: [0] }).map()

      expect(correction3.value.string).toEqual("some, phse")
      expect(correction3.original.string).toEqual("some phse")
      expect(correction3.score).toEqual(0.0)
    })

    it("ignores the tries of other languages", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })
      tries.insert({ language: "de", phrase: "some phrse", score: 2.0 })

      const correction = new QueryMapper({ language: "en", query: "some phrse", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("some phrase")
    })

    it("returns the words as is when they can not be corrected", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const correction = new QueryMapper({ language: "en", query: "some phrse anoter phrase", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("some phrase, anoter, phrase")
      expect(correction.original.string).toEqual("some phrse anoter phrase")
      expect(correction.distance).toEqual(1)
      expect(correction.score).toEqual(1.0)
    })

    it("returns the input as is when there is no trie for the specified language", () => {
      const correction = new QueryMapper({ language: "en", query: "unkown phrse", tries: new Tries(), allowedDistances }).map()

      expect(correction.value.string).toEqual("unkown phrse")
      expect(correction.original.string).toEqual("unkown phrse")
      expect(correction.distance).toEqual(0)
      expect(correction.score).toEqual(0.0)
    })

    it("corrects all the words", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "beach bar", score: 1.0 })
      tries.insert({ language: "en", phrase: "cocktail", score: 2.0 })
      tries.insert({ language: "en", phrase: "summer", score: 3.0 })

      const correction = new QueryMapper({ language: "en", query: "beahc bar cocktal summmer", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("beach bar, cocktail, summer")
      expect(correction.distance).toEqual(3)
      expect(correction.score).toEqual(6.0)
    })

    it("returns the summed distance and score", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "first phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "second phrase", score: 2.0 })

      const correction = new QueryMapper({ language: "en", query: "fist phrase secnd phrase", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("first phrase, second phrase")
      expect(correction.distance).toEqual(2)
      expect(correction.score).toEqual(3.0)
    })

    it("splits words when neccessary", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })

      const correction = new QueryMapper({ language: "en", query: "somephrase", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("some phrase")
    })

    it("joins words when neccessary", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "skyscraper", score: 1.0 })

      const correction = new QueryMapper({ language: "en", query: "skys craper", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("skyscraper")
    })

    it("applies a max distance per word", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "skyscraper", score: 1.0 })
      tries.insert({ language: "en", phrase: "beach bar", score: 2.0 })
      tries.insert({ language: "en", phrase: "cocktail", score: 3.0 })

      const correction = new QueryMapper({ language: "en", query: "skscrapr beahc bar coktail", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("skscrapr, beach bar, cocktail")
      expect(correction.distance).toEqual(2)
      expect(correction.score).toEqual(5.0)
    })

    it("prefers longer/greedy corrections", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some long phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "some long", score: 2.0 })
      tries.insert({ language: "en", phrase: "some", score: 3.0 })
      tries.insert({ language: "en", phrase: "long", score: 4.0 })
      tries.insert({ language: "en", phrase: "phrase", score: 5.0 })

      const correction = new QueryMapper({ language: "en", query: "somee lnog phrse", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("some long phrase")
      expect(correction.score).toEqual(1.0)
    })

    it("does not prefer longer/greedy corrections when a single word correction has a smaller distance", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "some phrases", score: 2.0 })

      const correction = new QueryMapper({ language: "en", query: "some phrase", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("some, phrase")
    })

    it("does not use partial corrections", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "another phrase", score: 1.0 })

      const correction1 = new QueryMapper({ language: "en", query: "phras", tries, allowedDistances }).map()
      expect(correction1.value.string).toEqual("phrase")

      const correction2 = new QueryMapper({ language: "en", query: "another phras", tries, allowedDistances }).map()
      expect(correction2.value.string).toEqual("another phrase")
    })

    it("prefers corrections with smaller distance", () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase1", score: 1.0 })
      tries.insert({ language: "en", phrase: "phrase2", score: 1.0 })

      const correction = new QueryMapper({ language: "en", query: "phrase1", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("phrase1")
    })

    it("prefers corrections matching when transliterated", () => {
      const tries = new Tries()
      tries.insert({ language: "de", phrase: "schön", score: 1.0 })
      tries.insert({ language: "de", phrase: "schon", score: 2.0 })

      const correction = new QueryMapper({ language: "de", query: "schoen", tries, allowedDistances }).map()

      expect(correction.value.string).toEqual("schön")
    })
  })
})
