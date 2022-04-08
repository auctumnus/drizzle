import sade from 'sade'
import { version } from '../package.json'

const cli = sade('llu')

cli
  .version(version)

cli
  .command('build <src> <dest>')
  .action((src, dest, opts) => {
    console.log(`${src} ${dest}`)
  })

cli.parse(process.argv)
