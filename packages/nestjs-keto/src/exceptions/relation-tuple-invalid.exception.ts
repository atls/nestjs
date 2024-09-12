import { AssertionError }       from 'assert'

import { KetoExceptionMessage } from './exception-message.constants'

export class KetoRelationTupleInvalidException extends AssertionError {
  constructor() {
    super({ message: `${KetoExceptionMessage.RELATION_TUPLE_INVALID}` })
  }
}
