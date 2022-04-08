export interface File {
  /**
   * The path to the file this source is from.
   */
  readonly path: string

  /**
   * The full text of the file that this source is reading from.
   */
  readonly source: string
}
