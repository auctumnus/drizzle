import { Span } from "./span"

interface Kind<T> {
  name: string
  value?: T
}

const kind = <T>(name: string) => ({ [name]: { name } as Kind<T> })

const valuedKind = <T>(name: string) => (value: T) => ({
  ...kind<T>(name),
  value
})

export const keywords = `
  return
  if else
  import export from
  for in match
  continue break
  struct type
  `.split(/\s+/)
    .map(s => s.trim())
    .filter(s => s)
    .map(name => kind<never>(name))
    .reduce((a, v) => ({...a, ...v}), {})

export const kinds = Object.freeze(Object.assign({
  ...keywords,
  operator:   valuedKind<string>('operator'),
  identifier: valuedKind<string>('identifier'),
  integer:    valuedKind<number>('integer'),
  float:      valuedKind<number>('float')
}))

export interface Token<T> {
  kind: Kind<T>,
  span: Span
}
