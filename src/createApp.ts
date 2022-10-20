import Tries from "./Tries"
import QueryMapper from "./QueryMapper"
import express from "express"

export default function createApp({ tries, allowedDistances }: { tries: Tries, allowedDistances: number[] }) {
  const app = express()

  app.get("/corrections", (req, res) => {
    const text = req.query.text as string
    const language = req.query.language as string

    res.setHeader("content-type", "application/json; charset=utf-8");

    if (!text) return res.status(422).send(JSON.stringify({ error: "No text given" }))
    if (!language) return res.status(422).send(JSON.stringify({ error: "No language given" }))

    const t1 = new Date().getTime()
    const correction = new QueryMapper({ query: text, language, tries, allowedDistances }).map({ maxLookahead: 5 })
    const t2 = new Date().getTime()

    res.send(JSON.stringify({
      text: correction.value.string,
      distance: correction.distance,
      score: correction.score,
      took: t2 - t1
    }))
  })

  return app
}
