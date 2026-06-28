import type { OathkeeperHeaders } from './interfaces.js'

import { ApiApi }                 from '@ory/oathkeeper-client-fetch'
import { Configuration }          from '@ory/oathkeeper-client-fetch'
import { ResponseError }          from '@ory/oathkeeper-client-fetch'

export interface OathkeeperDecisionClientResponse {
  status: number
  headers: Headers
}

export interface OathkeeperDecisionClient {
  decide: (headers: OathkeeperHeaders) => Promise<OathkeeperDecisionClientResponse>
}

export const createOathkeeperDecisionClient = (apiUrl: string): OathkeeperDecisionClient => {
  const api = new ApiApi(new Configuration({ basePath: apiUrl }))

  return {
    async decide(headers: OathkeeperHeaders): Promise<OathkeeperDecisionClientResponse> {
      try {
        const response = await api.decisionsRaw({
          headers,
        })

        return {
          status: response.raw.status,
          headers: response.raw.headers,
        }
      } catch (error) {
        if (error instanceof ResponseError) {
          return {
            status: error.response.status,
            headers: error.response.headers,
          }
        }

        throw error
      }
    },
  }
}
