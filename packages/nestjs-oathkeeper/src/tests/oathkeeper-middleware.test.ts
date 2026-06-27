import type { OathkeeperDecisionService } from '../decision.js'
import type { OathkeeperDecisionResult }  from '../interfaces.js'
import type { OathkeeperHttpRequest }     from '../middleware.js'

import assert                             from 'node:assert/strict'
import { describe }                       from 'node:test'
import { it }                             from 'node:test'

import { ForbiddenException }             from '@nestjs/common'

import { OathkeeperIdentityMiddleware }   from '../middleware.js'

const createMiddleware = (
  result: OathkeeperDecisionResult,
  mode: 'enforce' | 'enrich' = 'enforce'
): OathkeeperIdentityMiddleware => {
  const decisions = {
    decide: async () => result,
  } as unknown as OathkeeperDecisionService

  return new OathkeeperIdentityMiddleware(decisions, {
    urls: {
      api: 'http://oathkeeper-api:4456',
    },
    middleware: {
      mode,
    },
  })
}

describe('OathkeeperIdentityMiddleware', () => {
  it('enriches allowed requests with Oathkeeper response headers', async () => {
    const middleware = createMiddleware({
      allowed: true,
      status: 200,
      headers: {
        authorization: 'Bearer test',
        'x-user': 'user-1',
      },
      authorization: 'Bearer test',
      user: 'user-1',
    })
    const request: OathkeeperHttpRequest = {
      method: 'GET',
      originalUrl: '/assets',
      protocol: 'https',
      headers: {
        host: 'app.example.com',
      },
    }
    let called = false

    await middleware.use(request, undefined, () => {
      called = true
    })

    assert.equal(called, true)
    assert.equal(request.headers.authorization, 'Bearer test')
    assert.equal(request.headers['x-user'], 'user-1')
  })

  it('throws on denied requests in enforce mode', async () => {
    const middleware = createMiddleware({
      allowed: false,
      status: 403,
      headers: {},
    })
    const request: OathkeeperHttpRequest = {
      method: 'GET',
      originalUrl: '/assets',
      headers: {
        host: 'app.example.com',
      },
    }
    let called = false

    await assert.rejects(async () => {
      await middleware.use(request, undefined, () => {
        called = true
      })
    }, ForbiddenException)
    assert.equal(called, false)
  })

  it('lets denied requests continue in explicit enrich mode', async () => {
    const middleware = createMiddleware(
      {
        allowed: false,
        status: 403,
        headers: {},
      },
      'enrich'
    )
    const request: OathkeeperHttpRequest = {
      method: 'GET',
      originalUrl: '/assets',
      headers: {
        host: 'app.example.com',
      },
    }
    let called = false

    await middleware.use(request, undefined, () => {
      called = true
    })

    assert.equal(called, true)
    assert.equal(request.headers.authorization, undefined)
  })
})
