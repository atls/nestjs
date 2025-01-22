import type { PromiseClient }                from '@connectrpc/connect'
import type { INestMicroservice }            from '@nestjs/common'

import { ValidationError }                   from '@atls/protobuf-rpc'
import { ConnectError }                      from '@connectrpc/connect'
import { Test }                              from '@nestjs/testing'
import { createPromiseClient }               from '@connectrpc/connect'
import { createGrpcTransport }               from '@connectrpc/connect-node'
import { afterAll }                          from '@jest/globals'
import { beforeAll }                         from '@jest/globals'
import { describe }                          from '@jest/globals'
import { expect }                            from '@jest/globals'
import { it }                                from '@jest/globals'
import getPort                               from 'get-port'

import { ConnectRpcServer }                  from '@atls/nestjs-connectrpc'
import { ServerProtocol }                    from '@atls/nestjs-connectrpc'

import { TestService }                       from '../gen/test_connect.js'
import { ConnectRpcErrorsIntegrationModule } from '../src/index.js'

describe('grpc error', () => {
  let service: INestMicroservice
  let client: PromiseClient<typeof TestService>

  beforeAll(async () => {
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

    client = createPromiseClient(
      TestService,
      createGrpcTransport({
        baseUrl: `http://localhost:${port}`,
        httpVersion: '2',
        idleConnectionTimeoutMs: 25,
      })
    )
  })

  afterAll(async () => {
    await service.close()
  })

  it('validation errors', async () => {
    expect.assertions(1)

    try {
      await client.testValidation({ id: 'test', child: { id: 'test' } })
    } catch (error) {
      if (error instanceof ConnectError) {
        expect(
          // @ts-expect-error
          error.details.map((detail: { value: Uint8Array }) =>
            // @ts-expect-error
            ValidationError.fromBinary(detail.value))
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'id',
              property: 'id',
              messages: expect.arrayContaining([
                expect.objectContaining({
                  id: 'isEmail',
                  constraint: 'id must be an email',
                }),
              ]),
            }),
            expect.objectContaining({
              id: 'child.id',
              property: 'id',
              messages: expect.arrayContaining([
                expect.objectContaining({
                  id: 'isEmail',
                  constraint: 'id must be an email',
                }),
              ]),
            }),
          ])
        )
      }
    }
  })
})
