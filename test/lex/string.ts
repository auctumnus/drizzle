import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { expectError, firstToken } from '../util'

test('single quote', () => {
  firstToken(`'ab"c'`, t => {
    assert.type(t.kind.value, 'string')
    assert.is(t.kind.value, 'ab"c')
  })
})

test('escape', () => {
  firstToken(`'a\nb'`, t => {
    assert.is(t.kind.value, 'a\nb')
  })
})

test('hex escape', () => {
  firstToken(`'a\\x40b'`, t => {
    assert.is(t.kind.value, 'a@b')
  })
})

test('eof in hex escape', () => {
  expectError(`'a\\x`, e => {
    // this actually creates an "unclosed string" error as well
    assert.ok(e.message.includes('Unclosed') || e.message.includes('EOF'))
  })
})

test('invalid char in hex escape', () => {
  expectError(`'a\\xgf'`, e => {
    assert.ok(e.hint)
    assert.ok(e.message.includes('Invalid'))
  })
})

test('unicode escape short', () => {
  firstToken(`'a\\u{79cb}'`, t => {
    assert.is(t.kind.value, 'a秋')
  })
})

test('unicode escape long', () => {
  firstToken(`'a\\u{01f327}'`, t => {
    assert.is(t.kind.value, 'a🌧')
  })
})

test('unclosed unicode escape', () => {
  expectError(`'a\\u{ffef'`, e => {
    assert.ok(e.message.toLowerCase().includes('unclosed'))
    assert.ok(e.replaceWith)
  })
})

test('end of string in escape', () => {
  expectError(`'a\\xa'`, e => {
    assert.ok(e.message.toLowerCase().includes('end of string'))
  })
})

test.run()
