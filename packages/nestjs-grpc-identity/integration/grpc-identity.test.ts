/**
 * @jest-environment node
 */

import type { INestMicroservice }        from '@nestjs/common'
import type { ClientGrpc }               from '@nestjs/microservices'

import { readFile }                      from 'node:fs/promises'
import { join }                          from 'node:path'

import { Metadata }                      from '@grpc/grpc-js'
import { ClientsModule }                 from '@nestjs/microservices'
import { Transport }                     from '@nestjs/microservices'
import { Test }                          from '@nestjs/testing'
import { status }                        from '@grpc/grpc-js'
import { describe }                      from '@jest/globals'
import { beforeAll }                     from '@jest/globals'
import { it }                            from '@jest/globals'
import { expect }                        from '@jest/globals'
import { afterAll }                      from '@jest/globals'
import { sign }                          from 'jsonwebtoken'
import getPort                           from 'get-port'

import { GrpcIdentityIntegrationModule } from './src/index.js'
import { serverOptions }                 from './src/index.js'

describe('grpc identity', () => {
  type TestServiceClient = {
    test: (
      request: { id: string },
      metadata: Metadata
    ) => { toPromise: () => Promise<{ id: string }> }
  }

  let service: INestMicroservice
  let client: TestServiceClient

  beforeAll(async () => {
    const servicePort = await getPort()

    const testModule = await Test.createTestingModule({
      imports: [
        GrpcIdentityIntegrationModule,
        ClientsModule.register([
          {
            name: 'client',
            transport: Transport.GRPC,
            options: {
              url: `0.0.0.0:${servicePort}`,
              package: 'test',
              protoPath: join(__dirname, 'src/test.proto'),
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

    service = testModule.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `0.0.0.0:${servicePort}`,
      },
    })

    await service.init()
    await service.listen()

    const grpcClient = service.get<ClientGrpc>('client')
    client = grpcClient.getService<TestServiceClient>('TestService')
  })

  afterAll(async () => {
    await service.close()
  })

  it(`check success`, async () => {
    const privateKey = await readFile(join(__dirname, 'src/.jwks.pem'), 'utf-8')

    const token = sign({ sub: 'test' }, privateKey, { algorithm: 'RS256' })

    const metadata = new Metadata()

    metadata.add('authorization', `Bearer ${token}`)

    const result = await client.test({ id: 'test' }, metadata).toPromise()

    expect(result.id).toBe('test')
  })

  it(`check failed`, async () => {
    expect.assertions(1)

    try {
      const metadata = new Metadata()

      metadata.add('authorization', `Bearer test`)

      await client.test({ id: 'test' }, metadata).toPromise()
    } catch (error) {
      if (error instanceof Error) {
        const grpcError = error as Error & { code?: number }
        expect(grpcError.code).toBe(status.UNAUTHENTICATED)
      } else {
        throw error
      }
    }
  })
})
