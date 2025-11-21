import type { CallHandler }                from '@nestjs/common'

import { ExecutionContextHost }            from '@nestjs/core/helpers/execution-context-host.js'
import { describe }                        from '@jest/globals'
import { it }                              from '@jest/globals'
import { expect }                          from '@jest/globals'
import { lastValueFrom }                   from 'rxjs'
import { throwError }                      from 'rxjs'

import { KratosRedirectRequiredException } from '../exceptions/index.js'
import { KratosFlowRequiredException }     from '../exceptions/index.js'
import { KratosRedirectInterceptor }       from './kratos-redirect.interceptor.js'

describe('KratosRedirectInterceptor', () => {
  type ErrorWithResponse = Error & { response?: { status: number } }

  const createResponseError = (status: number): ErrorWithResponse => {
    const error = new Error() as ErrorWithResponse

    error.response = { status }

    return error
  }

  it('skip not kratos errors', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => new Error()),
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.not.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 410 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => createResponseError(410)),
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 404 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => createResponseError(404)),
    }

    await expect(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler))
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 403 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => createResponseError(403)),
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
