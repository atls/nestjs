import type { ArgumentsHost }             from '@nestjs/common'

import { AssertionError }                 from 'node:assert'

import { Catch }                          from '@nestjs/common'
import { InternalServerErrorException }   from '@nestjs/common'
import { NotFoundException }              from '@nestjs/common'
import { BaseRpcExceptionFilter }         from '@nestjs/microservices'
import { Observable }                     from 'rxjs'

import { assertionExceptionFactory }      from '../exception-factories/index.js'
import { internalServerExceptionFactory } from '../exception-factories/index.js'
import { notFoundExceptionFactory }       from '../exception-factories/index.js'

@Catch()
export class GrpcExceptionsFilter extends BaseRpcExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override catch(exception: any, host: ArgumentsHost): Observable<any> {
    if (exception instanceof AssertionError) {
      return super.catch(assertionExceptionFactory(exception), host)
    }

    if (exception instanceof InternalServerErrorException) {
      return super.catch(internalServerExceptionFactory(exception), host)
    }

    if (exception instanceof NotFoundException) {
      return super.catch(notFoundExceptionFactory(exception), host)
    }

    return super.catch(exception, host)
  }
}
