import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Source } from '../../src/source'
import { src } from '../util'


test('next', () => {
  const source = src('abcaaa')
  source.startSpan()
  assert.is(source.next(), 'a')
  const span = source.endSpan()
  assert.is(span.start.index, 0)
  assert.is(span.end.index, 1)
})

test('multiline', () => {
  const source = src('a\nbbb')
  source.startSpan()
  for(let i = 0; i < 5; i++) source.next()
  const span = source.endSpan()
  assert.is(span.end.row, 1)
  assert.is(span.length, 5)
})

test.run()
