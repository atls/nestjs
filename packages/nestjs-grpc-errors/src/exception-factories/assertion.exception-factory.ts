import type { AssertionError } from 'node:assert/strict'

import * as grpcErrorStatus    from '@atls/grpc-error-status'
import { RpcException }        from '@nestjs/microservices'
import { status }              from '@grpc/grpc-js'

const { ErrorStatus } = grpcErrorStatus

export const assertionExceptionFactory = (error: AssertionError): RpcException => {
  const errorStatus = new ErrorStatus(status.INVALID_ARGUMENT, error.message)

  return new RpcException(errorStatus.toServiceError())
}
