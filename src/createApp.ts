import Tries from "./Tries"
import QueryMapper from "./QueryMapper"
import { version } from "./version"
import express from "express"
import morgan from "morgan"

export default function createApp({ tries, allowedDistances }: { tries: Tries, allowedDistances: number[] }) {
  const app = express()

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(':method :url :status - :response-time ms'))
  }

  app.get("/corrections", (req, res) => {
    const text = req.query.text as string
    const language = req.query.language as string

    res.setHeader("content-type", "application/json; charset=utf-8")

    if (!text) return res.status(422).send(JSON.stringify({ error: "No text given" }))
    if (!language) return res.status(422).send(JSON.stringify({ error: "No language given" }))

    const t1 = new Date().getTime()
    const corrections = new QueryMapper({ query: text, language, tries, allowedDistances }).map({ maxLookahead: 5 })
    const t2 = new Date().getTime()

    res.send(JSON.stringify({
      text: corrections.map((correction) => correction.value.string).join(", "),
      distance: corrections.reduce((acc, cur) => acc + cur.distance, 0),
      score: corrections.reduce((acc, cur) => acc + cur.score, 0.0),
      took: t2 - t1,
      corrections: corrections.map((correction) => {
        return {
          original: correction.original.string,
          text: correction.value.string,
          distance: correction.distance,
          score: correction.score,
          found: !!correction.trieNode,
        }
      })
    }))
  })

  app.get("/info", (req, res) => {
    res.setHeader("content-type", "application/json; charset=utf-8").send(JSON.stringify({ name: "spella", version }))
  })

  return app
}
