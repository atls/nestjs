import type { OathkeeperDecisionClient }        from '../client.js'
import type { OathkeeperHeaders }               from '../interfaces.js'
import type { OathkeeperModuleOptions }         from '../module/interfaces.js'

import assert                                   from 'node:assert/strict'
import { describe }                             from 'node:test'
import { it }                                   from 'node:test'

import { OathkeeperDecisionService }            from '../decision.js'
import { OathkeeperDecisionConfigurationError } from '../errors/index.js'
import { OathkeeperDecisionRequestError }       from '../errors/index.js'

describe('OathkeeperDecisionService', () => {
  it('calls the Decisions API with forwarded request headers', async () => {
    let headers: OathkeeperHeaders | undefined

    const client: OathkeeperDecisionClient = {
      async decide(forwardedHeaders: OathkeeperHeaders) {
        headers = forwardedHeaders

        return {
          status: 200,
          headers: new Headers({
            authorization: 'Bearer test',
            'x-user': 'user-1',
          }),
        }
      },
    }

    const service = new OathkeeperDecisionService(client, {
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
    const client: OathkeeperDecisionClient = {
      async decide() {
        return {
          status: 403,
          headers: new Headers(),
        }
      },
    }

    const service = new OathkeeperDecisionService(client, {
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

  it('throws typed request errors for provider failures', async () => {
    const client: OathkeeperDecisionClient = {
      async decide() {
        return {
          status: 500,
          headers: new Headers(),
        }
      },
    }

    const service = new OathkeeperDecisionService(client, {
      urls: {
        api: 'http://oathkeeper-api:4456',
      },
      decision: {
        forwardedHost: 'app.example.com',
      },
    })

    await assert.rejects(
      async () => {
        await service.decide({
          method: 'POST',
          uri: '/restricted',
        })
      },
      (error) => {
        assert.ok(error instanceof OathkeeperDecisionRequestError)
        assert.equal(error.status, 500)

        return true
      }
    )
  })

  it('requires a decision host from request or module options', async () => {
    const client: OathkeeperDecisionClient = {
      async decide() {
        assert.fail('Unexpected call')
      },
    }

    const options: OathkeeperModuleOptions = {
      urls: {
        api: 'http://oathkeeper-api:4456',
      },
    }

    const service = new OathkeeperDecisionService(client, options)

    await assert.rejects(async () => {
      await service.decide({
        method: 'GET',
        uri: '/',
      })
    }, OathkeeperDecisionConfigurationError)
  })
})
