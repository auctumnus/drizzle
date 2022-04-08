import { Span } from "./span";

export class DrizzleError extends Error {
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
    super(message)
    this.location = location
    this.message = message
    this.hint = hint
    this.replaceWith = replaceWith
  }
}
