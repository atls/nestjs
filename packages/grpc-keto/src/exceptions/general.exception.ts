import { AssertionError }       from 'assert'

import { KetoExceptionMessage } from './exception-message.constants'

export class KetoGeneralException extends AssertionError {
  constructor(message: string) {
    super({ message: `${KetoExceptionMessage.GENERAL_ERROR}: ${message}` })
  }
}
