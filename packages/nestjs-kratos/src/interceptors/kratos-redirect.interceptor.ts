/* eslint-disable no-else-return */

import type { CallHandler }                from '@nestjs/common'
import type { ExecutionContext }           from '@nestjs/common'
import type { NestInterceptor }            from '@nestjs/common'
import type { Observable }                 from 'rxjs'

import type { KratosBrowserUrlFlow }       from '../urls/index.js'

import { Injectable }                      from '@nestjs/common'
import { throwError }                      from 'rxjs'
import { catchError }                      from 'rxjs/operators'

import { KratosRedirectRequiredException } from '../exceptions/index.js'
import { KratosFlowRequiredException }     from '../exceptions/index.js'

@Injectable()
export class KratosRedirectInterceptor implements NestInterceptor {
  constructor(private readonly redirectTo: KratosBrowserUrlFlow) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: { response?: { status?: number } }) => {
        const status = error.response?.status
        if (error.response && [403, 404, 410].includes(status!)) {
          return throwError(() => new KratosRedirectRequiredException(this.redirectTo))
        } else if (error instanceof KratosFlowRequiredException) {
          return throwError(() => new KratosRedirectRequiredException(this.redirectTo))
        } else {
          return throwError(() => error)
        }
      })
    )
  }
}
