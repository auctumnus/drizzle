import { Source } from "./source";
import { Span } from "./span";
import { kinds, Token, keywords } from "./token";

// keywords that can also technically be identifiers
const IDENTIFIER_KEYWORDS = 'and or not xor shl shr'.split(' ')

const oneOf = (chars: string) => {
  // light memoization optimization
  // premature, for the record
  const a = chars.split('')
  return (c: string) => a.includes(c)
}

const isShortOperator = oneOf('^!.:?')
const isLongOperator  = oneOf('+-*/%=')
const isQuote         = oneOf('\'"`') // so unfortunate that at least one of
                                      // these needed to be escaped

const isUnicode = (p: string) => (c: string) => !!c.match(new RegExp(`^\\p{${p}}$`, 'u'))
const isWhitespace   = isUnicode('White_Space')
const isNameStart    = (c: string) => c === '_' || isUnicode('XID_Start')(c)
const isNameContinue = (c: string) => (c >= '0' && c <= '9') || isUnicode('XID_Continue')(c)

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

/**
 * Lexes the source file into tokens.
 */
export class Lexer {
  constructor(private source: Source) {}

  error() {
  
  }

  /**
   * Reads the next token.
   */
  next() {
    this.skipWhitespace()
    this.source.startSpan()
    return this.identifier() || this.operator()
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
      if(this.source.peek() === '=') {
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
    if(isQuote(openingQuote)) {
      
    } else {
      return null
    }
  }
}
