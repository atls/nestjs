/**
 * @jest-environment node
 */

import type { INestMicroservice }      from '@nestjs/common'

import { ErrorStatus }                 from '@atls/grpc-error-status'
import { ClientsModule }               from '@nestjs/microservices'
import { Transport }                   from '@nestjs/microservices'
import { Test }                        from '@nestjs/testing'
import { describe }                    from '@jest/globals'
import { it }                          from '@jest/globals'
import { beforeAll }                   from '@jest/globals'
import { expect }                      from '@jest/globals'
import { afterAll }                    from '@jest/globals'
import { join }                        from 'path'
import getPort                         from 'get-port'

import { GrpcErrorsIntegrationModule } from '../src/index.js'
import { serverOptions }               from '../src/index.js'

describe('grpc error', () => {
  let service: INestMicroservice
  // @ts-expect-error
  let testClient

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    testClient = service.get('client').getService('TestService')
  })

  afterAll(async () => {
    await service.close()
  })

  it(`validation errors`, async () => {
    expect.assertions(1)

    try {
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await testClient.testValidation({ id: 'test', child: { id: 'test' } }).toPromise()
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(ErrorStatus.fromServiceError(error as any).toObject()).toEqual(
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
