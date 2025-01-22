import type { GuardErrors }       from '@atls/guard-clause'

import { Code }                   from '@connectrpc/connect'
import { ConnectError }           from '@connectrpc/connect'
import { ValidationError }        from '@atls/protobuf-rpc'
import { ValidationErrorMessage } from '@atls/protobuf-rpc'
import { RpcException }           from '@nestjs/microservices'

export const guardExceptionFactory = (errors: GuardErrors): RpcException => {
  const validationErrors: Array<ValidationError> = errors.errors.map(
    (error) =>
      new ValidationError({
        id: error.code,
        property: error.parameter,
        messages: [
          new ValidationErrorMessage({
            id: error.code,
            constraint: error.message,
          }),
        ],
      })
  )

  return new RpcException(
    new ConnectError('Request validation failed', Code.InvalidArgument, undefined, validationErrors)
  )
}
