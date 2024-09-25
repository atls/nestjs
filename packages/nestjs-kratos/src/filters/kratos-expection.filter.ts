/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { ArgumentsHost }              from '@nestjs/common'
import type { ExceptionFilter }            from '@nestjs/common'

import { Inject }                          from '@nestjs/common'
import { Catch }                           from '@nestjs/common'
import { join }                            from 'path'

import { KratosRedirectRequiredException } from '../exceptions/index.js'
import { KRATOS_BROWSER_URLS }             from '../module/index.js'
import { KratosBrowserUrls }               from '../urls/index.js'

@Catch(KratosRedirectRequiredException)
export class KratosExceptionFilter implements ExceptionFilter {
  constructor(@Inject(KRATOS_BROWSER_URLS) private readonly urls: KratosBrowserUrls) {}

  catch(exception: KratosRedirectRequiredException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const returnTo = this.urls.createInterceptingUrl(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      join(request.path || '', '/complete'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      request.header('x-forwarded-proto'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      request.header('host'),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      request.query.return_to
    )

    const url = this.urls.get(exception.redirectTo, { returnTo })

    response.redirect(url)
  }
}
