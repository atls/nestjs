import { RpcException }   from '@nestjs/microservices'
import { ErrorStatus }    from '@atls/grpc-error-status'
import { status }         from '@grpc/grpc-js'
import { AssertionError } from 'assert'

export const assertionExceptionFactory = (error: AssertionError) => {
  const errorStatus = new ErrorStatus(status.INVALID_ARGUMENT, error.message)

  return new RpcException(errorStatus.toServiceError())
}
