import type { Client }                       from '@connectrpc/connect'
import type { INestMicroservice }            from '@nestjs/common'

import assert                                from 'node:assert/strict'
import { describe }                          from 'node:test'
import { before }                            from 'node:test'
import { after }                             from 'node:test'
import { it }                                from 'node:test'

import { ValidationError }                   from '@atls/protobuf-rpc'
import { ConnectError }                      from '@connectrpc/connect'
import { Test }                              from '@nestjs/testing'
import { findValidationErrorDetails }        from '@atls/protobuf-rpc'
import { createClient }                      from '@connectrpc/connect'
import { createGrpcTransport }               from '@connectrpc/connect-node'
import getPort                               from 'get-port'

import { ConnectRpcServer }                  from '@atls/nestjs-connectrpc'
import { ServerProtocol }                    from '@atls/nestjs-connectrpc'

import { TestService }                       from './gen/test_connect.js'
import { ConnectRpcErrorsIntegrationModule } from './src/index.js'

describe('nestjs connectrpc errors', () => {
  let service: INestMicroservice
  let client: Client<typeof TestService>

  before(async () => {
    const port = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [ConnectRpcErrorsIntegrationModule],
    }).compile()

    service = testingModule.createNestMicroservice({
      strategy: new ConnectRpcServer({
        protocol: ServerProtocol.HTTP2_INSECURE,
        port,
      }),
    })

    await service.init()
    await service.listen()

    client = createClient(
      TestService,
      createGrpcTransport({
        baseUrl: `http://localhost:${port}`,
        httpVersion: '2',
        idleConnectionTimeoutMs: 25,
      })
    )
  })

  after(async () => {
    await service.close()
  })

  it('validation errors', async () => {
    await assert.rejects(
      async () => client.testValidation({ id: 'test', child: { id: 'test' } }),
      (error) => {
        assert.ok(error instanceof ConnectError)

        const errors = findValidationErrorDetails(error)

        assert.deepEqual(errors, [
          new ValidationError({
            id: 'id',
            property: 'id',
            messages: [{ id: 'isEmail', constraint: 'id must be an email' }],
          }),
          new ValidationError({
            id: 'child.id',
            property: 'id',
            messages: [{ id: 'isEmail', constraint: 'id must be an email' }],
          }),
        ])

        return true
      }
    )
  })
})
