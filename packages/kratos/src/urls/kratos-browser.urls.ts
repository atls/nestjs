import { Injectable }            from '@nestjs/common'
import { Inject }                from '@nestjs/common'
import path                      from 'path'

import { KratosModuleOptions }   from '../module'
import { KRATOS_MODULE_OPTIONS } from '../module'

export type KratosBrowserUrlFlow =
  | 'login'
  | 'recovery'
  | 'registration'
  | 'settings'
  | 'verification'
  | 'logout'

export interface KratosBrowserUrlParams {
  returnTo?: string
}

@Injectable()
export class KratosBrowserUrls {
  private login: string

  private recovery: string

  private registration: string

  private settings: string

  private verification: string

  private logout: string

  constructor(@Inject(KRATOS_MODULE_OPTIONS) private readonly options: KratosModuleOptions) {
    this.login = KratosBrowserUrls.formatUrl(options.browser, '/self-service/login/browser')
    this.recovery = KratosBrowserUrls.formatUrl(options.browser, '/self-service/recovery/browser')
    this.registration = KratosBrowserUrls.formatUrl(
      options.browser,
      '/self-service/registration/browser'
    )
    this.settings = KratosBrowserUrls.formatUrl(options.browser, '/self-service/settings/browser')
    this.verification = KratosBrowserUrls.formatUrl(
      options.browser,
      '/self-service/verification/browser'
    )
    this.logout = KratosBrowserUrls.formatUrl(options.browser, '/self-service/browser/flows/logout')
  }

  static formatUrl(root, target) {
    const rootUrl = new URL(root)

    return new URL(path.join(rootUrl.pathname, target), rootUrl.origin).toString()
  }

  get(flow: KratosBrowserUrlFlow, params?: KratosBrowserUrlParams) {
    if (!(params && params.returnTo)) {
      return this[flow]
    }

    const url = new URL(this[flow])

    url.searchParams.append('return_to', params.returnTo)

    return url.toString()
  }

  createInterceptingUrl(interceptorPath: string, proto?: string, host?: string, returnTo?: string) {
    if (proto !== 'https' || !host || !returnTo) {
      return undefined
    }

    const url = new URL(interceptorPath, `${proto}://${host}`)

    url.searchParams.append('return_to', returnTo)

    return url.toString()
  }
}
