import createApp from "../src/createApp"
import Tries from "../src/Tries"
import request from "supertest"

describe("createApp", () => {
  describe("GET /corrections", () => {
    it("returns the correct text and distance", async () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "another phrase", score: 1.0 })

      const response = await request(createApp({ tries, allowedDistances: [4, 9] })).get("/corrections?text=some%20phrse&language=en")

      expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8")
      expect(response.status).toEqual(200)
      expect(response.body).toEqual(expect.objectContaining({ text: 'some phrase', distance: 1, took: expect.any(Number) }))
    })

    it("respects the language", async () => {
      const tries = new Tries()
      tries.insert({ language: "de", phrase: "eine phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "eine phrose", score: 1.0 })

      const response = await request(createApp({ tries, allowedDistances: [4, 9] })).get("/corrections?text=eine%20phrose&language=de")
      expect(response.body).toEqual(expect.objectContaining({ text: 'eine phrase', distance: 1, took: expect.any(Number) }))
    })

    it("respects the allowed distances", async () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "phrase", score: 1.0 })

      const response1 = await request(createApp({ tries, allowedDistances: [5] })).get("/corrections?text=phrse&language=en")
      expect(response1.body.text).toEqual("phrase")

      const response2 = await request(createApp({ tries, allowedDistances: [6] })).get("/corrections?text=phrse&language=en")
      expect(response2.body.text).toEqual("phrse")
    })

    it("returns 422 when no text is given", async () => {
      const app = createApp({ tries: new Tries(), allowedDistances: [4, 9] })

      const response1 = await request(app).get("/corrections?language=en")
      expect(response1.status).toEqual(422)
      expect(response1.body).toEqual({ error: "No text given" })

      const response2 = await request(app).get("/corrections?text=&language=en")
      expect(response2.status).toEqual(422)
      expect(response2.body).toEqual({ error: "No text given" })
    })

    it("returns 422 when no language is given", async () => {
      const app = createApp({ tries: new Tries(), allowedDistances: [4, 9] })

      const response1 = await request(app).get("/corrections?text=text")
      expect(response1.status).toEqual(422)
      expect(response1.body).toEqual({ error: "No language given" })

      const response2 = await request(app).get("/corrections?text=text&language=")
      expect(response2.status).toEqual(422)
      expect(response2.body).toEqual({ error: "No language given" })
    })
  })

  describe("GET /info", () => {
    it("returns version and server name", async () => {
      const app = createApp({ tries: new Tries(), allowedDistances: [4, 9] })
      const response = await request(app).get("/info")

      expect(response.status).toEqual(200)
      expect(response.body).toEqual({ name: "spella", version: expect.stringMatching(/^[0-9]+\.[0-9]+\.[0-9]+$/) })
    })
  })
})
