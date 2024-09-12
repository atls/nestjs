import { AssertionError }       from 'assert'

import { KetoExceptionMessage } from './exception-message.constants.js'

export class KetoRelationTupleInvalidException extends AssertionError {
  constructor() {
    super({ message: `${KetoExceptionMessage.RELATION_TUPLE_INVALID}` })
  }
}
