import type { CallHandler }                from '@nestjs/common'

import { ExecutionContextHost }            from '@nestjs/core/helpers/execution-context-host.js'
import { describe }                        from '@jest/globals'
import { it }                              from '@jest/globals'
import { expect }                          from '@jest/globals'
import { throwError }                      from 'rxjs'
import { lastValueFrom }                   from 'rxjs'

import { KratosRedirectRequiredException } from '../exceptions/index.js'
import { KratosFlowRequiredException }     from '../exceptions/index.js'
import { KratosRedirectInterceptor }       from './kratos-redirect.interceptor.js'

describe('KratosRedirectInterceptor', () => {
  it('skip not kratos errors', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => new Error('test')),
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.not.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 410 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => {
        const error: Error & { response?: { status: number } } = new Error()

        error.response = {
          status: 410,
        }

        return throwError(() => error)
      },
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 404 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => {
        const error: Error & { response?: { status: number } } = new Error()

        error.response = {
          status: 404,
        }

        return throwError(() => error)
      },
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 403 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => {
        const error: Error & { response?: { status: number } } = new Error()

        error.response = {
          status: 403,
        }

        return throwError(() => error)
      },
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service flow required error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => new KratosFlowRequiredException()),
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })
})
