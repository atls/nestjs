import type { AssertionError } from 'node:assert'

import { Code }                from '@connectrpc/connect'
import { ConnectError }        from '@connectrpc/connect'
import { RpcException }        from '@nestjs/microservices'

export const assertionExceptionFactory = (error: AssertionError): RpcException =>
  new RpcException(new ConnectError(error.message, Code.InvalidArgument))
