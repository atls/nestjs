import type { InternalServerErrorException } from '@nestjs/common'

import * as grpcErrorStatus                  from '@atls/grpc-error-status'
import { RpcException }                      from '@nestjs/microservices'
import { status }                            from '@grpc/grpc-js'

const { ErrorStatus } = grpcErrorStatus

export const internalServerExceptionFactory = (
  error: InternalServerErrorException
): RpcException => {
  const errorStatus = new ErrorStatus(status.INTERNAL, error.message)

  return new RpcException(errorStatus.toServiceError())
}
