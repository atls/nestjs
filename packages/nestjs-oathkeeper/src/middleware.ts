import type { NestMiddleware }                 from '@nestjs/common'

import type { OathkeeperDecisionResult }       from './interfaces.js'
import type { OathkeeperHeaderValue }          from './interfaces.js'
import type { OathkeeperHeaders }              from './interfaces.js'
import type { OathkeeperHttpRequest }          from './interfaces.js'
import type { OathkeeperRequestHeaders }       from './interfaces.js'
import type { OathkeeperModuleOptions }        from './module/interfaces.js'

import { ForbiddenException }                  from '@nestjs/common'
import { Inject }                              from '@nestjs/common'
import { Injectable }                          from '@nestjs/common'
import { UnauthorizedException }               from '@nestjs/common'

import { OATHKEEPER_DEFAULT_RESPONSE_HEADERS } from './constants.js'
import { OATHKEEPER_MODULE_OPTIONS }           from './constants.js'
import { OathkeeperDecisionService }           from './decision.js'

@Injectable()
export class OathkeeperIdentityMiddleware implements NestMiddleware {
  constructor(
    private readonly decisions: OathkeeperDecisionService,
    @Inject(OATHKEEPER_MODULE_OPTIONS) private readonly options: OathkeeperModuleOptions
  ) {}

  async use(request: OathkeeperHttpRequest, response: unknown, next: () => void): Promise<void> {
    const decision = await this.decisions.decide({
      headers: request.headers,
      host: this.getHost(request),
      method: request.method ?? 'GET',
      proto: this.getProto(request),
      uri: request.url ?? '/',
    })

    if (!decision.allowed && this.getMode() === 'enforce') {
      throw decision.status === 401 ? new UnauthorizedException() : new ForbiddenException()
    }

    if (decision.allowed) {
      this.applyHeaders(request, decision)
    }

    next()
  }

  private getMode(): 'enforce' | 'enrich' {
    return this.options.middleware?.mode ?? 'enforce'
  }

  private getHost(request: OathkeeperHttpRequest): string | undefined {
    return (
      this.options.decision?.forwardedHost ??
      request.hostname ??
      this.getHeader(request.headers, 'host')
    )
  }

  private getProto(request: OathkeeperHttpRequest): string | undefined {
    return (
      this.options.decision?.forwardedProto ??
      request.protocol ??
      this.getHeader(request.headers, 'x-forwarded-proto')
    )
  }

  private applyHeaders(request: OathkeeperHttpRequest, decision: OathkeeperDecisionResult): void {
    this.getResponseHeaderNames().forEach((header) => {
      const value = this.getHeader(decision.headers, header)

      if (value) {
        request.headers[header] = value
      }
    })
  }

  private getResponseHeaderNames(): ReadonlyArray<string> {
    return this.options.decision?.responseHeaders ?? OATHKEEPER_DEFAULT_RESPONSE_HEADERS
  }

  private getHeader(
    headers: OathkeeperHeaders | OathkeeperRequestHeaders,
    name: string
  ): string | undefined {
    const normalizedName = name.toLowerCase()
    const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === normalizedName)

    if (!entry) {
      return undefined
    }

    return this.normalizeHeaderValue(entry[1])
  }

  private normalizeHeaderValue(value: OathkeeperHeaderValue): string | undefined {
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    return value
  }
}
