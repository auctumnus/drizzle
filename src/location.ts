export class Location {
  public readonly path: string
  public index: number
  public row: number
  public column: number

  constructor({ path, index, row, column }) {
    this.path = path
    this.index = index
    this.row = row
    this.column = column
  }

  clone() {
    return new Location(this)
  }

  toString() {
    return `${this.row}:${this.column}`
  }
}
