import { Source } from "../src/source";
import { Lexer } from '../src/lexer'
import * as assert from 'uvu/assert'
import { DrizzleError, DrizzleErrorHandler } from "../src/error";
import { Token } from "../src/token";

const silence = (_: any) => {}

export const src = (text: string) => new Source(text, 'test.dzl')
export const lex = (text: string) => new Lexer(src(text), silence, silence)

export const expectError = (text: string, errorFn: DrizzleErrorHandler) => {
  let hadError = false
  new Lexer(src(text), silence, e => {
    hadError = true
    errorFn(e)
  }).next()
  if(!hadError) {
    throw new Error('Expected error, but error handler was not called!')
  }
}

export const expectWarn = (text: string, errorFn: DrizzleErrorHandler) => {
  let hadError = false
  new Lexer(src(text), e => {
    hadError = true
    errorFn(e)
  }, silence).next()
  if(!hadError) {
    throw new Error('Expected warn, but warn handler was not called!')
  }
}

export const firstToken = (text: string, testFn: (t: Token<any>) => any) =>
  testFn(lex(text).next())
