import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Token } from '../../src/token'
import { firstToken } from '../util'

const opOf = (o: string) => (t: Token<string>) => {
  assert.is(t.kind.value, o)
  assert.is(t.kind.name, 'operator')
}

test('short operators', () => {
  '^!.:?(){}[];^@'.split('').forEach(o => {
    firstToken(o, opOf(o))
  })
})

test('*= vs *', () => {
  '+-*/%='.split('').forEach(o => {
    firstToken(o, opOf(o))
    firstToken(o + '=', opOf(o + '='))
  })
})

test('=>', () => {
  firstToken('=>', opOf('=>'))
})

test('>>= and <<=', () => {
  firstToken('>>=', opOf('>>='))
  firstToken('<<=', opOf('<<='))
})

test.run()

