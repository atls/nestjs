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
    const use = mock.fn()
    const adapterHost = {
      httpAdapter: {
        getInstance: () => ({ use }),
      },
    } as unknown as HttpAdapterHost

    await new ExpressGraphQLGateway(adapterHost).register(createRuntime(), {
      path: '/graphql',
      cors: false,
      limit: '1mb',
    })

    const useMock = use as unknown as MockedFunction

    assert.equal(useMock.mock.callCount(), 1)
    assert.equal(useMock.mock.calls[0].arguments[0], '/graphql')
    assert.equal(useMock.mock.calls[0].arguments.length, 3)
  })
})
