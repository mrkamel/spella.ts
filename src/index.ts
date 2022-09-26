import Tries from "./Tries"
import QueryMapper from "./QueryMapper"
import express from "express"

const tries = new Tries()

process.argv.slice(2, -1).forEach((path) => {
  console.log(path)
  tries.addFile(path)
})

const app = express()

app.get("/corrections", function (req, res) {
  const text = req.query.text as string
  const language = req.query.language as string

  if (!text) return res.send(JSON.stringify({ error: "No text given" }))
  if (!language) return res.send(JSON.stringify({ error: "No language given" }))

  const t1 = new Date().getTime()
  const correction = new QueryMapper({ string: text, language: language, tries }).map({ maxLookahead: 5 })
  const t2 = new Date().getTime()

  res.send(JSON.stringify({
    text: correction.value.string,
    distance: correction.distance,
    score: correction.score,
    took: t2 - t1
  }))
})

app.listen(8889, () => {
  console.log("started")
})