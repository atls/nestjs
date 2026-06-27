import type { ApiApi }                     from '@ory/oathkeeper-client-fetch'
import type { ApiResponse }                from '@ory/oathkeeper-client-fetch'

import type { OathkeeperDecisionRequest }  from './interfaces.js'
import type { OathkeeperDecisionResult }   from './interfaces.js'
import type { OathkeeperHeaderValue }      from './interfaces.js'
import type { OathkeeperHeaders }          from './interfaces.js'
import type { OathkeeperModuleOptions }    from './module/interfaces.js'

import { Inject }                          from '@nestjs/common'
import { Injectable }                      from '@nestjs/common'
import { ResponseError }                   from '@ory/oathkeeper-client-fetch'

import { OATHKEEPER_API }                  from './constants.js'
import { OATHKEEPER_AUTHORIZATION_HEADER } from './constants.js'
import { OATHKEEPER_MODULE_OPTIONS }       from './constants.js'
import { OATHKEEPER_USER_HEADER }          from './constants.js'

export type OathkeeperDecisionApi = Pick<ApiApi, 'decisionsRaw'>

@Injectable()
export class OathkeeperDecisionService {
  constructor(
    @Inject(OATHKEEPER_API) private readonly api: OathkeeperDecisionApi,
    @Inject(OATHKEEPER_MODULE_OPTIONS) private readonly options: OathkeeperModuleOptions
  ) {}

  async decide(request: OathkeeperDecisionRequest): Promise<OathkeeperDecisionResult> {
    try {
      const response = await this.api.decisionsRaw({
        headers: this.createHeaders(request),
      })

      return this.createResult(response)
    } catch (error) {
      if (error instanceof ResponseError) {
        return this.createResult({
          raw: error.response,
          value: async () => undefined,
        })
      }

      throw error
    }
  }

  private createHeaders(request: OathkeeperDecisionRequest): OathkeeperHeaders {
    const host = request.host ?? this.options.decision?.forwardedHost

    if (!host) {
      throw new Error('Oathkeeper decision host is required')
    }

    return {
      ...this.normalizeHeaders(request.headers ?? {}),
      Accept: 'application/json',
      'X-Forwarded-Host': host,
      'X-Forwarded-Method': request.method,
      'X-Forwarded-Proto': request.proto ?? this.options.decision?.forwardedProto ?? 'http',
      'X-Forwarded-Uri': request.uri,
    }
  }

  private createResult(response: ApiResponse<void>): OathkeeperDecisionResult {
    const headers = this.readHeaders(response.raw.headers)

    return {
      allowed: response.raw.status === 200,
      status: response.raw.status,
      headers,
      authorization: headers[OATHKEEPER_AUTHORIZATION_HEADER],
      user: headers[OATHKEEPER_USER_HEADER],
    }
  }

  private normalizeHeaders(headers: Record<string, OathkeeperHeaderValue>): OathkeeperHeaders {
    return Object.entries(headers).reduce<OathkeeperHeaders>((result, [key, value]) => {
      if (Array.isArray(value)) {
        result[key] = value.join(', ')
        return result
      }

      if (typeof value === 'string') {
        result[key] = value
      }

      return result
    }, {})
  }

  private readHeaders(headers: Headers): OathkeeperHeaders {
    const result: OathkeeperHeaders = {}

    headers.forEach((value, key) => {
      result[key] = value
    })

    return result
  }
}
