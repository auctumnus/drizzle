import { Span } from "./span";

export type DrizzleErrorHandler = (e: DrizzleError) => any

export class DrizzleError {
  /**
   * Where the error occurred.
   */
  location: Span

  /**
   * A description of the error.
   */
  message: string

  /**
   * A hint on how to fix the error; may not always be available.
   */
  hint?: string

  /**
   * One possible way to fix the error.
   */
  replaceWith?: string

  constructor(location: Span, message: string, hint?: string, replaceWith?: string) {
    this.location = location
    this.message = message
    this.hint = hint
    this.replaceWith = replaceWith
  }

  toString() {
    return this.location.context()
  }
}
