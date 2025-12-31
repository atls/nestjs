import type { CallHandler }                from '@nestjs/common'

import assert                              from 'node:assert/strict'
import { describe }                        from 'node:test'
import { it }                              from 'node:test'

import { ExecutionContextHost }            from '@nestjs/core/helpers/execution-context-host.js'
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

    await assert.rejects(lastValueFrom(target.intercept(new ExecutionContextHost([]), handler)), (
      error
    ) => {
      assert.ok(!(error instanceof KratosRedirectRequiredException))
      return true
    })
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

    await assert.rejects(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler)),
      KratosRedirectRequiredException
    )
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

    await assert.rejects(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler)),
      KratosRedirectRequiredException
    )
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

    await assert.rejects(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler)),
      KratosRedirectRequiredException
    )
  })

  it('self service flow required error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(() => new KratosFlowRequiredException()),
    }

    await assert.rejects(
      lastValueFrom(target.intercept(new ExecutionContextHost([]), handler)),
      KratosRedirectRequiredException
    )
  })
})
