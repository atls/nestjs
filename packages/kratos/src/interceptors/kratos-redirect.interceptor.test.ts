import { CallHandler }                     from '@nestjs/common'
import { ExecutionContextHost }            from '@nestjs/core/helpers/execution-context-host'
import { throwError }                      from 'rxjs'

import { KratosRedirectRequiredException } from '../exceptions'
import { KratosFlowRequiredException }     from '../exceptions'
import { KratosRedirectInterceptor }       from './kratos-redirect.interceptor'

describe('KratosRedirectInterceptor', () => {
  it('skip not kratos errors', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(new Error()),
    }

    await expect(
      target.intercept(new ExecutionContextHost([]), handler).toPromise()
    ).rejects.not.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 410 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => {
        const error: any = new Error()

        error.response = {
          status: 410,
        }

        return throwError(error)
      },
    }

    await expect(
      target.intercept(new ExecutionContextHost([]), handler).toPromise()
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 404 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => {
        const error: any = new Error()

        error.response = {
          status: 404,
        }

        return throwError(error)
      },
    }

    await expect(
      target.intercept(new ExecutionContextHost([]), handler).toPromise()
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service request 403 status error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => {
        const error: any = new Error()

        error.response = {
          status: 403,
        }

        return throwError(error)
      },
    }

    await expect(
      target.intercept(new ExecutionContextHost([]), handler).toPromise()
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })

  it('self service flow required error', async () => {
    const target = new KratosRedirectInterceptor('login')

    const handler: CallHandler = {
      handle: () => throwError(new KratosFlowRequiredException()),
    }

    await expect(
      target.intercept(new ExecutionContextHost([]), handler).toPromise()
    ).rejects.toThrowError(KratosRedirectRequiredException)
  })
})
