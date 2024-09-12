import { Catch }                     from '@nestjs/common'
import { ArgumentsHost }             from '@nestjs/common'
import { BaseRpcExceptionFilter }    from '@nestjs/microservices'

import { AssertionError }            from 'assert'

import { assertionExceptionFactory } from '../exception-factories'

@Catch()
export class GrpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    if (exception instanceof AssertionError) {
      return super.catch(assertionExceptionFactory(exception), host)
    }

    return super.catch(exception, host)
  }
}
