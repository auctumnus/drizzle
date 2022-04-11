import { File } from './file'
import { Location } from './location'
import { Span } from './span'

/**
 * Represents a text source for a program.
 */
export class Source {
  private readonly file: File

  private loc: Location

  private spanStack: Location[] = []

  /**
   * Creates a Source object.
   * @param source The string to read from.
   * @param path The path that this string came from.
   */
  constructor(source: string, path: string) {
    this.file = { source, path }
    this.loc = new Location({ path, index: 0, row: 0, column: 0 })
  }

  /**
   * Returns the next character, or `null` for EOF.
   */
  next(): string | null {
    if(this.loc.index < this.file.source.length) {
      const character = this.file.source[this.loc.index++]!
      if(character === '\n') {
        this.loc.row++
        this.loc.column = 0
      } else {
        this.loc.column++
      }
      return character
    } else {
      return null
    }
  }

  /**
   * Returns the next character without consuming it.
   */
  peek(): string | null {
    return this.file.source[this.loc.index] || null
  }

  /**
   * Peeks to an offset.
   */
  peekOffset(offset: number): string | null {
    return this.file.source[this.loc.index + offset] || null
  }

  /**
   * Skips while the given function returns true for the next character.
   */
  skip(fn: (char: string) => boolean) {
    while(true) {
      const char = this.peek()
      if(char === null || !fn(char)) {
        break
      }
      this.next()
    }
  }

  match(s: string) {
    return s.split('').every((c, i) => this.peekOffset(i) === c)
  }

  /**
   * Begins a span, or area of text.
   */
  startSpan() {
    this.spanStack.push(this.loc.clone())
  }

  /**
   * Ends a span, or area of text.
   * @returns The span that is ended.
   */
  endSpan() {
    if(!this.spanStack.length) {
      throw new Error('popped empty span stack')
    }
    const start = this.spanStack.pop()
    const end = this.loc.clone()

    return new Span(this.file, start, end)
  }
}
