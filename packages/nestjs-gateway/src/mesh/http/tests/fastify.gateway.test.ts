import type { GatewayGraphQLRuntime }         from '../../interfaces.js'

import assert                                 from 'node:assert/strict'
import { describe }                           from 'node:test'
import { it }                                 from 'node:test'

import { GatewayUnsupportedHttpAdapterError } from '../../errors/unsupported.js'
import { FastifyGraphQLGateway }              from '../fastify.gateway.js'

const createRuntime = (): GatewayGraphQLRuntime => ({
  mesh: {} as GatewayGraphQLRuntime['mesh'],
  schema: {} as GatewayGraphQLRuntime['schema'],
  contextBuilder: async () => ({}),
  apolloServer: {} as GatewayGraphQLRuntime['apolloServer'],
})

describe('FastifyGraphQLGateway', () => {
  it('keeps the fastify boundary explicit until fastify support is implemented', async () => {
    await assert.rejects(
      async () => new FastifyGraphQLGateway().register(createRuntime(), {}),
      new GatewayUnsupportedHttpAdapterError('fastify')
    )
  })
})
