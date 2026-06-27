import type { ApiResponse }             from '@ory/oathkeeper-client-fetch'

import type { OathkeeperDecisionApi }   from '../decision.js'
import type { OathkeeperModuleOptions } from '../module/interfaces.js'

import assert                           from 'node:assert/strict'
import { describe }                     from 'node:test'
import { it }                           from 'node:test'

import { ResponseError }                from '@ory/oathkeeper-client-fetch'

import { OathkeeperDecisionService }    from '../decision.js'

describe('OathkeeperDecisionService', () => {
  it('calls the Decisions API with forwarded request headers', async () => {
    let headers: HeadersInit | undefined

    const api: OathkeeperDecisionApi = {
      async decisionsRaw(initOverrides?: RequestInit): Promise<ApiResponse<void>> {
        headers = initOverrides?.headers

        return {
          raw: new Response(null, {
            status: 200,
            headers: {
              authorization: 'Bearer test',
              'x-user': 'user-1',
            },
          }),
          value: async () => undefined,
        }
      },
    }

    const service = new OathkeeperDecisionService(api, {
      urls: {
        api: 'http://oathkeeper-api:4456',
      },
    })

    const result = await service.decide({
      method: 'GET',
      host: 'app.example.com',
      proto: 'https',
      uri: '/assets?cursor=1',
      headers: {
        cookie: 'sid=1',
        'x-request-id': ['req-1', 'req-2'],
      },
    })

    assert.deepEqual(headers, {
      Accept: 'application/json',
      cookie: 'sid=1',
      'x-request-id': 'req-1, req-2',
      'X-Forwarded-Host': 'app.example.com',
      'X-Forwarded-Method': 'GET',
      'X-Forwarded-Proto': 'https',
      'X-Forwarded-Uri': '/assets?cursor=1',
    })
    assert.deepEqual(result, {
      allowed: true,
      status: 200,
      headers: {
        authorization: 'Bearer test',
        'x-user': 'user-1',
      },
      authorization: 'Bearer test',
      user: 'user-1',
    })
  })

  it('maps Oathkeeper denial responses to decision results', async () => {
    const api: OathkeeperDecisionApi = {
      async decisionsRaw(): Promise<ApiResponse<void>> {
        throw new ResponseError(
          new Response(null, {
            status: 403,
          }),
          'Denied'
        )
      },
    }

    const service = new OathkeeperDecisionService(api, {
      urls: {
        api: 'http://oathkeeper-api:4456',
      },
      decision: {
        forwardedHost: 'app.example.com',
      },
    })

    const result = await service.decide({
      method: 'POST',
      uri: '/restricted',
    })

    assert.deepEqual(result, {
      allowed: false,
      status: 403,
      headers: {},
      authorization: undefined,
      user: undefined,
    })
  })

  it('requires a decision host from request or module options', async () => {
    const api: OathkeeperDecisionApi = {
      async decisionsRaw(): Promise<ApiResponse<void>> {
        throw new Error('Unexpected call')
      },
    }

    const options: OathkeeperModuleOptions = {
      urls: {
        api: 'http://oathkeeper-api:4456',
      },
    }

    const service = new OathkeeperDecisionService(api, options)

    await assert.rejects(async () => {
      await service.decide({
        method: 'GET',
        uri: '/',
      })
    }, /Oathkeeper decision host is required/)
  })
})
