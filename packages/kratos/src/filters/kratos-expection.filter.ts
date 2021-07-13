import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common'
import { join }                                  from 'path'

import { KratosRedirectRequiredException }       from '../exceptions'
import { KratosBrowserUrls }                     from '../urls'

@Catch(KratosRedirectRequiredException)
export class KratosExceptionFilter implements ExceptionFilter {
  constructor(private readonly urls: KratosBrowserUrls) {}

  catch(exception: KratosRedirectRequiredException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest()
    const response = ctx.getResponse()

    const returnTo = this.urls.createInterceptingUrl(
      join(request.path || '', '/complete'),
      request.header('x-forwarded-proto'),
      request.header('host'),
      request.query.return_to
    )

    const url = this.urls.get(exception.redirectTo, { returnTo })

    response.redirect(url)
  }
}
