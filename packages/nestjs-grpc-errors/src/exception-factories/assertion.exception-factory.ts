import { AssertionError } from 'node:assert'

import { ErrorStatus }    from '@atls/grpc-error-status'
import { RpcException }   from '@nestjs/microservices'
import { status }         from '@grpc/grpc-js'

export const assertionExceptionFactory = (error: AssertionError) => {
  const errorStatus = new ErrorStatus(status.INVALID_ARGUMENT, error.message)

  return new RpcException(errorStatus.toServiceError())
}
