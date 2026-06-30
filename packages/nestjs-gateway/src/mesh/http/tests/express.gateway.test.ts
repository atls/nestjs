import type { HttpAdapterHost }       from '@nestjs/core'

import type { GatewayGraphQLRuntime } from '../../interfaces.js'

import assert                         from 'node:assert/strict'
import { describe }                   from 'node:test'
import { it }                         from 'node:test'
import { mock }                       from 'node:test'

import { ExpressGraphQLGateway }      from '../express.gateway.js'

const createApolloServer = () =>
  ({
    assertStarted: mock.fn(),
  }) as unknown as GatewayGraphQLRuntime['apolloServer']

type MockedFunction = {
  mock: {
    callCount: () => number
    calls: Array<{ arguments: Array<unknown> }>
  }
}

const createRuntime = (): GatewayGraphQLRuntime => ({
  mesh: {} as GatewayGraphQLRuntime['mesh'],
  schema: {} as GatewayGraphQLRuntime['schema'],
  contextBuilder: async () => ({}),
  apolloServer: createApolloServer(),
})

describe('ExpressGraphQLGateway', () => {
  it('owns express middleware registration', async () => {
    const get = mock.fn()
    const use = mock.fn()
    const adapterHost = {
      httpAdapter: {
        getInstance: () => ({ get, use }),
      },
    } as unknown as HttpAdapterHost

    await new ExpressGraphQLGateway(adapterHost).register(createRuntime(), {
      path: '/graphql',
      cors: false,
      limit: '1mb',
    })

    const getMock = get as unknown as MockedFunction
    const useMock = use as unknown as MockedFunction

    assert.equal(getMock.mock.callCount(), 1)
    assert.equal(getMock.mock.calls[0].arguments[0], '/.well-known/apollo/server-health')
    assert.equal(useMock.mock.callCount(), 1)
    assert.equal(useMock.mock.calls[0].arguments[0], '/graphql')
    assert.equal(useMock.mock.calls[0].arguments.length, 3)
  })

  it('preserves the Apollo health route response', async () => {
    const get = mock.fn()
    const adapterHost = {
      httpAdapter: {
        getInstance: () => ({ get, use: mock.fn() }),
      },
    } as unknown as HttpAdapterHost

    await new ExpressGraphQLGateway(adapterHost).register(createRuntime(), {})

    const getMock = get as unknown as MockedFunction
    const healthHandler = getMock.mock.calls[0].arguments[1] as (
      request: unknown,
      response: {
        json: (body: unknown) => void
        type: (contentType: string) => void
      }
    ) => void
    const response = {
      type: mock.fn(),
      json: mock.fn(),
    }

    healthHandler({}, response)

    const typeMock = response.type as unknown as MockedFunction
    const jsonMock = response.json as unknown as MockedFunction

    assert.equal(typeMock.mock.calls[0].arguments[0], 'application/health+json')
    assert.deepEqual(jsonMock.mock.calls[0].arguments[0], { status: 'pass' })
  })
})
