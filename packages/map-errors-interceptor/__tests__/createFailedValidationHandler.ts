import { ValidationError, validate } from 'class-validator'
import { from }                      from 'rxjs'

class ErrorToIntrecept extends Error {
  response: {
    message: Array<ValidationError>
  }

  constructor(validationErrors: Array<ValidationError>) {
    super('Validation error')
    this.response = { message: validationErrors }
  }
}

export const createFailedValidationHandler = <T extends {}>(invalidObj: T) => {
  return {
    handle: () =>
      from(
        validate(invalidObj).then((validationErrors: Array<ValidationError>) => {
          throw new ErrorToIntrecept(validationErrors)
        })
      ),
  }
}
