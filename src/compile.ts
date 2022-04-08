import { createReadStream } from 'fs'
import { Parser } from './parser'
import { Lexer } from './lexer'
import { readFile } from 'fs/promises'
import { Source } from './source'

/**
 * Read a file, compile it, output to the destination.
 * @param sourceFile The Lluviecita source file.
 * @param destinationFile Where to emit the binary.
 */
export const compile = async (sourceFile: string, destinationFile: string) => {
  try {
    const file = (await readFile(sourceFile)).toString()
    const source = new Source(file, sourceFile)

  } catch(e) {
    console.error(e)
  }
}
