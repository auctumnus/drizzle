import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Token } from '../../src/token'
import { firstToken } from '../util'

const opOf = (o: string) => (t: Token<string>) => {
  assert.is(t.kind.value, o)
  assert.is(t.kind.name, 'operator')
}

const firstIsOpOf = (o: string) => firstToken(o, opOf(o))

test('short operators', () => {
  '^!.:?(){}[];^@'.split('').forEach(firstIsOpOf)
})

test('*= vs *', () => {
  '+-*/%='.split('').forEach(o => {
    firstIsOpOf(o)
    firstIsOpOf(o + '=')
  })
})

test('=>, >=, <=, >>= and <<=', () => {
  '=> >= <= >>= <<='.split(' ').forEach(firstIsOpOf)
})

test('identifier keyword', () => {
  'and or not xor shl shr'.split(' ').forEach(firstIsOpOf)
})

test('keyword', () => {
  'return if else import export from'.split(' ').forEach(s => firstToken(s, t => {
    assert.is(t.kind.name, s)
  }))
})

test.run()

