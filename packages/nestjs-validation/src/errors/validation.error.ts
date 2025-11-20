import type { ValidationError as VError } from 'class-validator'

export class ValidationError extends Error {
  constructor(public readonly errors: Array<VError>) {
    super('Validation failed')

    this.name = 'ValidationError'
  }
}
