import { Location } from './location'
import { File } from './file'
import wcwidth from 'wcwidth'
import colors from '@colors/colors'

const makeUnderline = (character: string) => (offset: number, length: number) =>
  ' '.repeat(offset) + character.repeat(length)

const addContextLineNumsFactory =
  (longestLineNum: number) =>
  (start: number) =>
  (line: string, index: number) =>
    colors.blue(' ' + (start + index).toString().padEnd(longestLineNum) + ' │ ') + colors.gray(line)

const linesBefore = (sourceLines: string[], lines: number, startLine: number) =>
  sourceLines.slice(
    startLine - lines > 0 ? startLine - lines : 0,
    startLine
  )

const linesAfter = (sourceLines: string[], lines: number, endLine: number) =>
  sourceLines.slice(endLine + 1, endLine + lines + 1)


/**
 * Represents an area of text.
 */
export class Span {
  constructor(
    readonly file: File,
    readonly start: Location,
    readonly end: Location
  ) {}

  static join(a: Span, b: Span) {
    if(a.file !== b.file) {
      throw new Error('Spans are of different files!')
    }
    if(a.start.index < b.start.index) {
      return new Span(a.file, a.start, b.end)
    } else {
      return new Span(a.file, b.start, a.end)
    }
  }

  get length() {
    return this.end.index - this.start.index
  }

  toString() {
    return this.file.source.slice(this.start.index, this.end.index)
  }

  /**
   * @param numLines The maximum number of lines to include around the span.
   */
  context(includeMeta=true, numLines=1, highlightCharacter='^') {
    const underline = makeUnderline(highlightCharacter)

    const lines = this.file.source.split('\n')
    const before = linesBefore(lines, numLines, this.start.row)
    const after  = linesAfter(lines, numLines, this.end.row)
    const spanLines = lines.slice(this.start.row, this.end.row + 1)

    const longestLineNum = ([...before, ...after, ...spanLines].length + this.start.row).toString().length

    const addContextLineNums = addContextLineNumsFactory(longestLineNum)

    const lineNum = (n?: number) => colors.cyan(
      ' ' + (n ? n.toString() : '').padEnd(longestLineNum) + ' │ '
    )

    let highlightedSpanLines = []

    if(spanLines.length === 1) {
      const line = spanLines[0]
      const startOffset = wcwidth(line.slice(0, this.start.column))

      highlightedSpanLines = [
        lineNum(this.start.row) + line,
        lineNum() + underline(startOffset, wcwidth(this.toString()))
      ]
    } else {
      for(let i = 0; i < spanLines.length; i++) {
        const line = spanLines[i]
        highlightedSpanLines.push(lineNum(this.start.row + i) + line)
        if(i === 0) { // first line
          const startOffset = wcwidth(line.slice(0, this.start.column))
          highlightedSpanLines.push(lineNum() + underline(startOffset, wcwidth(line.slice(this.start.column))))
        } else if(i === (spanLines.length - 1)) { // ending line
          highlightedSpanLines.push(lineNum() + underline(0, wcwidth(line.slice(0, line.length - this.end.column))))
        } else {
          highlightedSpanLines.push(lineNum() + underline(0, wcwidth(line)))
        }
      }
    }

    const l = (o: Location) =>
      colors.red(o.row + '') + colors.blue(':') + colors.red(o.column + '')

    const location = colors.blue('(') + l(this.start) + colors.blue('..') + l(this.end) + colors.blue(')')

    const filename = colors.blue('—— ') + this.file.path

    let meta = colors.blue(' '.repeat(longestLineNum + 2) + '╭')

    meta += filename

    meta += ' '

    meta += colors.blue('—— ') + location + colors.blue(' ——')

    return [
      includeMeta ? meta : '',
      ...before.map(addContextLineNums(this.start.row - before.length)),
      ...highlightedSpanLines,
      ...after.map(addContextLineNums(this.start.row + spanLines.length))
    ].filter(s => s).join('\n')
  }
}
