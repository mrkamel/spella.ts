import createApp from "./createApp"
import Tries from "./Tries"

const port = parseInt(process.env.PORT || "8080", 10)
const tries = new Tries()

process.argv.slice(2, -1).forEach((path) => {
  // tslint:disable-next-line no-console
  console.log(path)
  tries.addFile(path)
})

createApp({ tries }).listen(port, () => {
  // tslint:disable-next-line no-console
  console.log(`started on ${ port }`)
})
