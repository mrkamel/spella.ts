import createApp from "../src/createApp"
import Tries from "../src/Tries"
import request from "supertest"

describe("createApp", () => {
  describe("GET /corrections", () => {
    it("returns the correct text and distance", async () => {
      const tries = new Tries()
      tries.insert({ language: "en", phrase: "some phrase", score: 1.0 })
      tries.insert({ language: "en", phrase: "another phrase", score: 1.0 })

      const response = await request(createApp({ tries })).get("/corrections?text=some%20phrse&language=en")

      expect(response.headers["content-type"]).toEqual("application/json; charset=utf-8")
      expect(response.status).toEqual(200)
      expect(response.body).toEqual(expect.objectContaining({ text: 'some phrase', distance: 1, took: expect.any(Number) }))
    })

    it("returns 422 when no text is given", async () => {
      const app = createApp({ tries: new Tries() })

      const response1 = await request(app).get("/corrections?language=en")
      expect(response1.status).toEqual(422)
      expect(response1.body).toEqual({ error: "No text given" })

      const response2 = await request(app).get("/corrections?text=&language=en")
      expect(response2.status).toEqual(422)
      expect(response2.body).toEqual({ error: "No text given" })
    })

    it("returns 422 when no language is given", async () => {
      const app = createApp({ tries: new Tries() })

      const response1 = await request(app).get("/corrections?text=text")
      expect(response1.status).toEqual(422)
      expect(response1.body).toEqual({ error: "No language given" })

      const response2 = await request(app).get("/corrections?text=text&language=")
      expect(response2.status).toEqual(422)
      expect(response2.body).toEqual({ error: "No language given" })
    })
  })
})
