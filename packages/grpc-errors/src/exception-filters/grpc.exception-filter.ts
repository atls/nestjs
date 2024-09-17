import { Catch }                     from '@nestjs/common'
import { ArgumentsHost }             from '@nestjs/common'
import { BaseRpcExceptionFilter }    from '@nestjs/microservices'
import { AssertionError }            from 'node:assert'

import { assertionExceptionFactory } from '../exception-factories/index.js'

@Catch()
export class GrpcExceptionsFilter extends BaseRpcExceptionFilter {
  override catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof AssertionError) {
      return super.catch(assertionExceptionFactory(exception), host)
    }

    return super.catch(exception, host)
  }
}
