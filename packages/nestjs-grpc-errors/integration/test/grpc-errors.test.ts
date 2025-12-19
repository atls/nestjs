/**
 * @jest-environment node
 */

import type { ServiceError }           from '@grpc/grpc-js'
import type { INestMicroservice }      from '@nestjs/common'
import type { ClientGrpc }             from '@nestjs/microservices'

import { join }                        from 'node:path'

import { ErrorStatus }                 from '@atls/grpc-error-status'
import { ClientsModule }               from '@nestjs/microservices'
import { Transport }                   from '@nestjs/microservices'
import { Test }                        from '@nestjs/testing'
import { describe }                    from '@jest/globals'
import { it }                          from '@jest/globals'
import { beforeAll }                   from '@jest/globals'
import { expect }                      from '@jest/globals'
import { afterAll }                    from '@jest/globals'
import getPort                         from 'get-port'

import { GrpcErrorsIntegrationModule } from '../src/index.js'
import { serverOptions }               from '../src/index.js'

describe('grpc error', () => {
  type TestServiceClient = {
    testValidation: (request: { id: string; child: { id: string } }) => {
      toPromise: () => Promise<unknown>
    }
  }

  let service: INestMicroservice
  let testClient: TestServiceClient

  beforeAll(async () => {
    const servicePort = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [
        GrpcErrorsIntegrationModule,
        ClientsModule.register([
          {
            name: 'client',
            transport: Transport.GRPC,
            options: {
              url: `0.0.0.0:${servicePort}`,
              package: 'test',
              protoPath: join(__dirname, '../src/test.proto'),
              loader: {
                arrays: true,
                keepCase: false,
                defaults: true,
                oneofs: true,
                includeDirs: [],
              },
            },
          },
        ]),
      ],
    }).compile()

    service = testingModule.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `0.0.0.0:${servicePort}`,
      },
    })

    await service.init()

    await service.listen()

    const grpcClient = service.get<ClientGrpc>('client')
    testClient = grpcClient.getService<TestServiceClient>('TestService')
  })

  afterAll(async () => {
    await service.close()
  })

  it(`validation errors`, async () => {
    expect.assertions(1)

    try {
      await testClient.testValidation({ id: 'test', child: { id: 'test' } }).toPromise()
    } catch (error) {
      // @ts-expect-error type mismatch
      expect(ErrorStatus.fromServiceError(error as ServiceError).toObject()).toEqual(
        expect.objectContaining({
          details: expect.arrayContaining([
            expect.objectContaining({
              '@type': 'type.googleapis.com/google.rpc.BadRequest',
              fieldViolationsList: expect.arrayContaining([
                expect.objectContaining({
                  field: 'id',
                  description: 'id must be an email',
                }),
                expect.objectContaining({
                  field: 'child.id',
                  description: 'id must be an email',
                }),
              ]),
            }),
          ]),
        })
      )
    }
  })
})
