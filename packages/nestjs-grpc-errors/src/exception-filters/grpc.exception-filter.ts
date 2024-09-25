import type { ArgumentsHost }        from '@nestjs/common'

import { AssertionError }            from 'node:assert'

import { Catch }                     from '@nestjs/common'
import { BaseRpcExceptionFilter }    from '@nestjs/microservices'

import { assertionExceptionFactory } from '../exception-factories/index.js'

@Catch()
export class GrpcExceptionsFilter extends BaseRpcExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/explicit-function-return-type
  override catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof AssertionError) {
      return super.catch(assertionExceptionFactory(exception), host)
    }

    return super.catch(exception, host)
  }
}
