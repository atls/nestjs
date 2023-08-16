/**
 * @jest-environment node
 */

import { ErrorStatus }                 from '@atls/grpc-error-status'
import { INestMicroservice }           from '@nestjs/common'
import { ClientsModule }               from '@nestjs/microservices'
import { Transport }                   from '@nestjs/microservices'
import { Test }                        from '@nestjs/testing'

import getPort                         from 'get-port'
import { join }                        from 'path'

import { GrpcErrorsIntegrationModule } from '../src'
import { serverOptions }               from '../src'

describe('grpc error', () => {
  let service: INestMicroservice
  let testClient

  beforeAll(async () => {
    const servicePort = await getPort()

    const module = await Test.createTestingModule({
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

    service = module.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `0.0.0.0:${servicePort}`,
      },
    })

    await service.init()

    await service.listen()

    testClient = service.get('client').getService('TestService')
  })

  afterAll(async () => {
    await service.close()
  })

  it(`validation errors`, async () => {
    expect.assertions(1)

    try {
      await testClient.testValidation({ id: 'test', child: { id: 'test' } }).toPromise()
    } catch (error) {
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
