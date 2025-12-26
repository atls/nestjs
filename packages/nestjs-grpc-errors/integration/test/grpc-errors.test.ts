import type { INestMicroservice }      from '@nestjs/common'
import type { ClientGrpc }             from '@nestjs/microservices'

import assert                          from 'node:assert/strict'
import { dirname }                     from 'node:path'
import { join }                        from 'node:path'
import { after }                       from 'node:test'
import { before }                      from 'node:test'
import { describe }                    from 'node:test'
import { it }                          from 'node:test'
import { fileURLToPath }               from 'node:url'

import { ErrorStatus }                 from '@atls/grpc-error-status'
import { ClientsModule }               from '@nestjs/microservices'
import { Transport }                   from '@nestjs/microservices'
import { Test }                        from '@nestjs/testing'
import getPort                         from 'get-port'

import { GrpcErrorsIntegrationModule } from '../src/index.js'
import { serverOptions }               from '../src/index.js'

const moduleDir = dirname(fileURLToPath(import.meta.url))

describe('grpc error', () => {
  type TestServiceClient = {
    testValidation: (request: { id: string; child: { id: string } }) => {
      toPromise: () => Promise<unknown>
    }
  }

  let service: INestMicroservice
  let testClient: TestServiceClient

  before(async () => {
    const servicePort = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [
        GrpcErrorsIntegrationModule,
        ClientsModule.register([
          {
            name: 'client',
            transport: Transport.GRPC,
            options: {
              url: `127.0.0.1:${servicePort}`,
              package: 'test',
              protoPath: join(moduleDir, '../src/test.proto'),
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
        url: `127.0.0.1:${servicePort}`,
      },
    })

    await service.init()

    await service.listen()

    const grpcClient = service.get<ClientGrpc>('client')

    testClient = grpcClient.getService<TestServiceClient>('TestService')
  })

  after(async () => {
    await service.close()
  })

  it(`validation errors`, async () => {
    await assert.rejects(
      async () => testClient.testValidation({ id: 'test', child: { id: 'test' } }).toPromise(),
      (error) => {
        const status = ErrorStatus.fromServiceError(
          error as Parameters<typeof ErrorStatus.fromServiceError>[0]
        ).toObject() as {
          details?: Array<Record<string, unknown>>
        }
        const details = status.details ?? []
        const badRequest = details.find(
          (detail) => detail['@type'] === 'type.googleapis.com/google.rpc.BadRequest'
        ) as { fieldViolationsList?: Array<{ field?: string; description?: string }> } | undefined

        assert.ok(badRequest)

        const violations = badRequest.fieldViolationsList ?? []
        const fields = violations.map((violation) => violation.field)
        const descriptions = violations.map((violation) => violation.description)

        assert.ok(fields.includes('id'))
        assert.ok(fields.includes('child.id'))
        assert.ok(descriptions.includes('id must be an email'))

        return true
      }
    )
  })
})
