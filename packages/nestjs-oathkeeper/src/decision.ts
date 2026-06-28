import type { OathkeeperDecisionClient }         from './client.js'
import type { OathkeeperDecisionClientResponse } from './client.js'
import type { OathkeeperDecisionRequest }        from './interfaces.js'
import type { OathkeeperDecisionResult }         from './interfaces.js'
import type { OathkeeperHeaderValue }            from './interfaces.js'
import type { OathkeeperHeaders }                from './interfaces.js'
import type { OathkeeperModuleOptions }          from './module/interfaces.js'

import { Inject }                                from '@nestjs/common'
import { Injectable }                            from '@nestjs/common'

import { OATHKEEPER_AUTHORIZATION_HEADER }       from './constants.js'
import { OATHKEEPER_DECISION_CLIENT }            from './constants.js'
import { OATHKEEPER_MODULE_OPTIONS }             from './constants.js'
import { OATHKEEPER_USER_HEADER }                from './constants.js'
import { OathkeeperDecisionConfigurationError }  from './errors/index.js'
import { OathkeeperDecisionRequestError }        from './errors/index.js'
import { OathkeeperErrorMessage }                from './errors/index.js'

@Injectable()
export class OathkeeperDecisionService {
  constructor(
    @Inject(OATHKEEPER_DECISION_CLIENT) private readonly client: OathkeeperDecisionClient,
    @Inject(OATHKEEPER_MODULE_OPTIONS) private readonly options: OathkeeperModuleOptions
  ) {}

  async decide(request: OathkeeperDecisionRequest): Promise<OathkeeperDecisionResult> {
    const headers = this.createHeaders(request)

    try {
      const response = await this.client.decide(headers)

      return this.createResult(response)
    } catch (error) {
      if (error instanceof OathkeeperDecisionRequestError) {
        throw error
      }

      throw this.createDecisionRequestError(error)
    }
  }

  private createHeaders(request: OathkeeperDecisionRequest): OathkeeperHeaders {
    const host = request.host ?? this.options.decision?.forwardedHost

    if (!host) {
      throw new OathkeeperDecisionConfigurationError(OathkeeperErrorMessage.DECISION_HOST_REQUIRED)
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

  private createResult(response: OathkeeperDecisionClientResponse): OathkeeperDecisionResult {
    const headers = this.readHeaders(response.headers)
    const { status } = response

    if (!this.isDecisionStatus(status)) {
      throw new OathkeeperDecisionRequestError(status)
    }

    return {
      allowed: status === 200,
      status,
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

  private isDecisionStatus(status: number): boolean {
    return status === 200 || status === 401 || status === 403
  }

  private createDecisionRequestError(error: unknown): OathkeeperDecisionRequestError {
    return new OathkeeperDecisionRequestError(0, { cause: error })
  }
}
