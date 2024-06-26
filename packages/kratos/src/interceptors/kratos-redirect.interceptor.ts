/* eslint-disable no-else-return */

import { CallHandler }                     from '@nestjs/common'
import { ExecutionContext }                from '@nestjs/common'
import { Injectable }                      from '@nestjs/common'
import { NestInterceptor }                 from '@nestjs/common'

import { Observable }                      from 'rxjs'
import { throwError }                      from 'rxjs'
import { catchError }                      from 'rxjs/operators'

import { KratosRedirectRequiredException } from '../exceptions'
import { KratosFlowRequiredException }     from '../exceptions'
import { KratosBrowserUrlFlow }            from '../urls'

@Injectable()
export class KratosRedirectInterceptor implements NestInterceptor {
  constructor(private readonly redirectTo: KratosBrowserUrlFlow) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        if (error.response && [403, 404, 410].includes(error.response.status)) {
          return throwError(new KratosRedirectRequiredException(this.redirectTo))
        } else if (error instanceof KratosFlowRequiredException) {
          return throwError(new KratosRedirectRequiredException(this.redirectTo))
        } else {
          return throwError(error)
        }
      })
    )
  }
}
