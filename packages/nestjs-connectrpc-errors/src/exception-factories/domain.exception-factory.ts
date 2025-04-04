import type { DomainError } from '@atls/core-errors'

import { LogicalError }     from '@atls/protobuf-rpc'
import { Code }             from '@connectrpc/connect'
import { ConnectError }     from '@connectrpc/connect'
import { RpcException }     from '@nestjs/microservices'

export const domainExceptionFactory = (error: DomainError): RpcException => {
  const logicalError = new LogicalError({
    id: error.name,
    message: error.message,
  })

  return new RpcException(
    new ConnectError('Logical Error', Code.InvalidArgument, undefined, [logicalError])
  )
}
