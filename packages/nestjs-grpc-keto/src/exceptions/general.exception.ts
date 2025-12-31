import { AssertionError }       from 'node:assert'

import { KetoExceptionMessage } from './exception-message.constants.js'

export class KetoGeneralException extends AssertionError {
  constructor(message: string) {
    super({ message: `${KetoExceptionMessage.GENERAL_ERROR}: ${message}` })
  }
}
