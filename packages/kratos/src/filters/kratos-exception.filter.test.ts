import { ArgumentsHost }                   from '@nestjs/common'
import { HttpArgumentsHost }               from '@nestjs/common/interfaces/features/arguments-host.interface.js'
import { describe }                        from '@jest/globals'
import { it }                              from '@jest/globals'
import { expect }                          from '@jest/globals'
import { jest }                            from '@jest/globals'

import { KratosRedirectRequiredException } from '../exceptions/index.js'
import { KratosBrowserUrls }               from '../urls/index.js'
import { KratosExceptionFilter }           from './kratos-expection.filter.js'

describe('KratosExceptionFilter', () => {
  it('redirect on KratosFlowRequiredException', async () => {
    const filter = new KratosExceptionFilter(
      new KratosBrowserUrls({
        browser: 'http://localhost:3000',
        public: 'http://localhost:3000',
      })
    )

    const response = {
      redirect: jest.fn(),
    }

    const argumentHost = {
      getResponse: () => response as any,
      getRequest: () => ({
        header: () => undefined,
        query: {},
      }),
    }

    const host = {
      switchToHttp: () => argumentHost as HttpArgumentsHost,
    }

    filter.catch(new KratosRedirectRequiredException('login'), host as ArgumentsHost)

    expect(response.redirect).toBeCalledWith('http://localhost:3000/self-service/login/browser')
  })

  it('redirect on KratosFlowRequiredException with return_to interception', async () => {
    const filter = new KratosExceptionFilter(
      new KratosBrowserUrls({
        browser: 'http://localhost:3000',
        public: 'http://localhost:3000',
      })
    )

    const response = {
      redirect: jest.fn(),
    }

    const argumentHost = {
      getResponse: () => response as any,
      getRequest: () => ({
        path: '/',
        query: {
          return_to: 'http://localhost:3000',
        },
        header: (name: string) => {
          if (name === 'x-forwarded-proto') {
            return 'https'
          }

          if (name === 'host') {
            return 'localhost'
          }

          return undefined
        },
      }),
    }

    const host = {
      switchToHttp: () => argumentHost as HttpArgumentsHost,
    }

    filter.catch(new KratosRedirectRequiredException('login'), host as ArgumentsHost)

    expect(response.redirect).toBeCalledWith(
      'http://localhost:3000/self-service/login/browser?return_to=https%3A%2F%2Flocalhost%2Fcomplete%3Freturn_to%3Dhttp%253A%252F%252Flocalhost%253A3000'
    )
  })
})
