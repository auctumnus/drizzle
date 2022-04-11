import { DrizzleError, DrizzleErrorHandler } from "./error";
import { Source } from "./source";
import { Span } from "./span";
import { kinds, Token, keywords } from "./token";
import colors from '@colors/colors'

// keywords that can also technically be identifiers
const IDENTIFIER_KEYWORDS = 'and or not xor shl shr'.split(' ')

const oneOf = (chars: string) => {
  // light memoization optimization
  // premature, for the record
  const a = chars.split('')
  return (c: string) => a.includes(c)
}

const isShortOperator = oneOf('^!.:?(){}[];^@')
const isLongOperator  = oneOf('+-*/%=')
const isQuote         = oneOf('\'"`') // so unfortunate that at least one of
                                      // these needed to be escaped
const isEscape        = oneOf('nrt\\\'"ae')

const isUnicode = (p: string) => (c: string) => !!c.match(new RegExp(`^\\p{${p}}$`, 'u'))
const isWhitespace   = isUnicode('White_Space')
const isNameStart    = (c: string) => c === '_' || isUnicode('XID_Start')(c)
const isNameContinue = (c: string) => (c >= '0' && c <= '9') || isUnicode('XID_Continue')(c)

const escapes = {
  n: '\n',
  r: '\r',
  t: '\t',
  '\\': '\\',
  "'": "'",
  '"': '"',
  a: '\x07',
  e: '\x1b'
}

// emma 🍞 — 03/13/2022
// world if js had pattern matching
// autumn — 03/13/2022
// real
const identify = (span: Span): Token<never | string> => {
  const text = span.toString()
  if(IDENTIFIER_KEYWORDS.includes(text)) {
    return { kind: kinds.operator(text), span }
  } if(keywords.hasOwnProperty(text)) {
    return { kind: kinds[text], span }
  } else {
    return { kind: kinds.identifier(text), span }
  }
}

const isHex = (c: string) =>
  (c >= '0') && (c <= '9') ||
  (c >= 'a') && (c <= 'f') ||
  (c >= 'A') && (c <= 'F')

const prettyPrint = (level: string) => (e: DrizzleError) => {
  console.error(level, colors.bold(e.message))
  console.error(e.location.context())
  if(e.hint) {
    console.error(
      colors.gray(`${colors.bold('hint:')} ${e.hint}`) +
      (e.replaceWith ? `${colors.gray(':')} \`${e.replaceWith}\`` : '')
    )
  }
}

const prettyPrintWarn = prettyPrint(colors.yellow(colors.bold('warn:')))
const prettyPrintErr = prettyPrint(colors.red(colors.bold('error:')))

const fromCodePoint = (s: string) => String.fromCodePoint(parseInt(s, 16))

/**
 * Lexes the source file into tokens.
 */
export class Lexer {
  constructor(
    private source: Source,
    public warnHandler: DrizzleErrorHandler = prettyPrintWarn,
    public errorHandler: DrizzleErrorHandler = prettyPrintErr
  ) {}

  /**
   * Reads the next token.
   */
  next() {
    this.skipWhitespace()
    this.source.startSpan()
    return this.identifier() || this.operator() || this.string()
  }

  private skipWhitespace() {
    this.source.skip(isWhitespace)
  }

  private identifier(): Token<string | never> | null {
    if(!isNameStart(this.source.peek())) {
      return null
    } else {
      this.source.skip(isNameContinue)
      return identify(this.source.endSpan())
    }
  }

  private operator(): Token<string> | null {
    const next = this.source.peek()
    if(isLongOperator(next)) {
      this.source.next()
      if(next === '=' && this.source.peek() === '>') {
        this.source.next()
      } else if(this.source.peek() === '=') {
        this.source.next()
      }
    } else if(isShortOperator(next)) {
      this.source.next()
    } else if(next === '>' || next === '<') {
      this.source.next()
      if(this.source.peek() === next) { // >> or <<
        this.source.next()
        if(this.source.peek() === '=') { // >>= or <<=
          this.source.next()
        }
      }
    } else {
      return null
    }
    const span = this.source.endSpan()
    return { kind: kinds.operator(span.toString()), span }
  }

  private string(): Token<string> {
    const openingQuote = this.source.peek()
    let value = ""
    if(isQuote(openingQuote)) {
      this.source.next()
      let next = this.source.peek()
      while(next = this.source.peek(), next !== openingQuote) {
        if(next === null) {
          const s = this.source.endSpan()
          this.errorHandler(new DrizzleError(s, 'Unclosed string', 'close the string', s + openingQuote))
          return null
        } else if(next === '\\') {
          value += this.escapeSequence(openingQuote)
        } else {
          value += this.source.next()
        }
      }
      this.source.next()
      const span = this.source.endSpan()
      return { kind: kinds.string(value), span}
    } else {
      return null
    }
  }

  private hexOfLength(quoteChar: string, length: number) {
    this.source.startSpan()
    for(let _ = 0; _ < length; _++) {
      const next = this.source.peek()
      if(next === null) {
        this.errorHandler(new DrizzleError(this.source.endSpan(), 'Unexpected EOF in escape sequence'))
        return null
      } else if(next === quoteChar) {
        this.errorHandler(new DrizzleError(this.source.endSpan(), 'Unexpected end of string in escape sequence'))
        return null
      } else if(isHex(next)) {
        this.source.next()
      } else {
        this.errorHandler(new DrizzleError(this.source.endSpan(), 'Invalid characters following hex or unicode escape', `"${next}" is not a-f / A-F / 0-9`))
        this.source.endSpan()
        return null
      }
    }
    return this.source.endSpan()
  }

  private escapeSequence(openingQuote: string): string {
    this.source.startSpan()
    this.source.next()
    const esc = this.source.next()
    if(esc === 'x') {
      const span = this.hexOfLength(openingQuote, 2)
      if(!span) return ''
      this.source.endSpan()
      return fromCodePoint(span.toString())
    } else if(esc === 'u') {
      if(this.source.next() !== '{') {
        const s = this.source.endSpan()
        this.errorHandler(new DrizzleError(s, 'Expected {', 'complete the unicode escape', s + '{01f327}'))
        return ''
      }
      let span = this.hexOfLength(openingQuote, 4)
      if(!span) return ''
      if(isHex(this.source.peek()) && isHex(this.source.peekOffset(1))) {
        const extension = this.hexOfLength(openingQuote, 2)
        if(!extension) return ''
        span = Span.join(span, extension)
      }
      if(this.source.next() !== '}') {
        const s = this.source.endSpan()
        this.errorHandler(new DrizzleError(
          s,
          'Unclosed bracket in escape sequence',
          'add a bracket at the end',
          s + '}'
        ))
        return ''
      }
      this.source.endSpan()
      return fromCodePoint(span.toString())
    } else if(escapes.hasOwnProperty(esc)) {
      return escapes[esc]
    } else {
      this.warnHandler(new DrizzleError(this.source.endSpan(), 'Invalid escape sequence', ))
      return esc
    }
  }
}
