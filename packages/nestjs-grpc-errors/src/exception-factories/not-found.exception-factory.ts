import type { NotFoundException } from '@nestjs/common'

import * as grpcErrorStatus       from '@atls/grpc-error-status'
import { RpcException }           from '@nestjs/microservices'
import { status }                 from '@grpc/grpc-js'

const { ErrorStatus } = grpcErrorStatus

export const notFoundExceptionFactory = (error: NotFoundException): RpcException => {
  const errorStatus = new ErrorStatus(status.NOT_FOUND, error.message)

  return new RpcException(errorStatus.toServiceError())
}
