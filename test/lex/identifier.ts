import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { firstToken } from '../util'

test('ascii ident', () => {
  firstToken('abc', t => {
    assert.is(t.kind.name, 'identifier')
    assert.is(t.kind.value, 'abc')
  })
})

test('unicode ident', () => {
  firstToken('東京', t => {
    assert.is(t.kind.value, '東京')
  })
})

test.run()
