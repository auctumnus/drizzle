import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { Source } from '../../src/source'


test('next', () => {
  const source = new Source('abcaaa', 'b')
  source.startSpan()
  assert.is(source.next(), 'a')
  const span = source.endSpan()
  assert.is(span.start.index, 0)
  assert.is(span.end.index, 1)
})

test('multiline', () => {
  const source = new Source('a\nbbb', 'a')
  source.startSpan()
  for(let i = 0; i < 15; i++) source.next()
  const span = source.endSpan()
  console.log(span.context())
})

test.run()
