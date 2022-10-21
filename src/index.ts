import createApp from "./createApp"
import Tries from "./Tries"
import yargs from "yargs"

async function start() {
  const tries = new Tries()

  const options = await yargs(process.argv.slice(2))
    .usage("serve [options]")
    .option("files", { type: "string", array: true, demandOption: true })
    .option("port", { type: "number", default: 8080 })
    .option("distances", {
      type: "string",
      default: "4,9",
      description: "A comma separated list of allowed edit distances. The numbers represent the string lengths"
    })
    .strict()
    .parse()

  const allowedDistances = options.distances.split(/,/).map((distance) => parseInt(distance, 10))

  options.files.forEach((path) => {
    // tslint:disable-next-line no-console
    console.log(path)
    tries.addFile(path)
  })

  createApp({ tries, allowedDistances }).listen(options.port, () => {
    // tslint:disable-next-line no-console
    console.log(`started on ${ options.port }`)
  })
}

start()
