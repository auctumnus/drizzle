import { test } from 'uvu'
import * as assert from 'uvu/assert'
import { expectError, expectWarn, firstToken } from '../util'

test('base 10 integer', () => {
  firstToken('1234', t => {
    assert.is(t.kind.name, 'integer')
    assert.is(t.kind.value, 1234)
  })
})

test('float', () => {
  firstToken('3.14', t => {
    assert.is(t.kind.name, 'float')
    assert.is(t.kind.value, 3.14)
  })
})

test('float no fractional part', () => {
  expectError('5.', e => {
    assert.ok(e.message.includes('fractional'))
  })
})

test('float no leading 0 gets parsed as just the dot operator', () => {
  firstToken('.2', t => {
    assert.is(t.kind.name, 'operator')
  })
})

test('big float warn', () => {
  expectWarn('417298374983274234329472384239.2534343', w => {
    assert.ok(w.message.includes('JS'))
  })
})

test('big int warn', () => {
  expectWarn('417298374983274234329472384239', w => {
    assert.ok(w.message.includes('JS'))
  })
})

test('hex', () => {
  firstToken('0x10', t => assert.is(t.kind.value, 16))
})

test('octal', () => {
  firstToken('0c10', t => assert.is(t.kind.value, 8))
})

test('binary', () => {
  firstToken('0b10', t => assert.is(t.kind.value, 2))
})

test('exponent', () => {
  firstToken('10e6', t => assert.is(t.kind.value, 10e6))
})

test('float w exponent', () => {
  firstToken('10.4e6', t => {
    assert.is(t.kind.name, 'integer')
    assert.is(t.kind.value, 10.4e6)
  })
})

test('negative exponent', () => {
  firstToken('123e-2', t => assert.is(t.kind.value, 123e-2))
})

test('missing exponent at eof', () => {
  expectError('123e', e => assert.ok(e.message.includes('exponent')))
})

test('missing exponent, not eof', () => {
  expectError('123e ', e => assert.ok(e.message.includes('exponent')))
})

test('missing exponent, float', () => {
  expectError('12.3e', e => assert.ok(e.message.includes('exponent')))
})

test('underscores in int', () => {
  firstToken('1_000_000', t => assert.is(t.kind.value, 1000000))
})

test('underscores in float', () => {
  firstToken('1_000.00_1', t => assert.is(t.kind.value, 1000.001))
})

test('underscores in hex', () => {
  firstToken('0x10_00', t => assert.is(t.kind.value, 0x1000))
})

test('underscores at start of hex', () => {
  expectError('0x_10', e => assert.ok(e.message.includes('base tag')))
})

test('underscore at end', () => {
  expectError('10_', e => assert.ok(e.message.includes('underscore')))
})

test('underscore at end of hex', () => {
  expectError('0x10_', e => assert.ok(e.message.includes('underscore')))
})

test('big hex', () => {
  expectWarn('0xffffffffffffffffffffffffff', w => assert.ok(w.message.includes('JS')))
})

test.run()

