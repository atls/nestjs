import type { INestMicroservice }        from '@nestjs/common'
import type { ClientGrpc }               from '@nestjs/microservices'

import assert                            from 'node:assert/strict'
import { readFile }                      from 'node:fs/promises'
import { dirname }                       from 'node:path'
import { join }                          from 'node:path'
import { after }                         from 'node:test'
import { before }                        from 'node:test'
import { describe }                      from 'node:test'
import { it }                            from 'node:test'
import { fileURLToPath }                 from 'node:url'

import { Metadata }                      from '@grpc/grpc-js'
import { ClientsModule }                 from '@nestjs/microservices'
import { Transport }                     from '@nestjs/microservices'
import { Test }                          from '@nestjs/testing'
import { status }                        from '@grpc/grpc-js'
import getPort                           from 'get-port'
import jwt                               from 'jsonwebtoken'

import { GrpcIdentityIntegrationModule } from './src/index.js'
import { serverOptions }                 from './src/index.js'

const moduleDir = dirname(fileURLToPath(import.meta.url))

describe('grpc identity', () => {
  type TestServiceClient = {
    test: (
      request: { id: string },
      metadata: Metadata
    ) => { toPromise: () => Promise<{ id: string }> }
  }

  let service: INestMicroservice
  let client: TestServiceClient

  before(async () => {
    const servicePort = await getPort()

    const testModule = await Test.createTestingModule({
      imports: [
        GrpcIdentityIntegrationModule,
        ClientsModule.register([
          {
            name: 'client',
            transport: Transport.GRPC,
            options: {
              url: `127.0.0.1:${servicePort}`,
              package: 'test',
              protoPath: join(moduleDir, 'src/test.proto'),
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
        url: `127.0.0.1:${servicePort}`,
      },
    })

    await service.init()
    await service.listen()

    const grpcClient = service.get<ClientGrpc>('client')
    client = grpcClient.getService<TestServiceClient>('TestService')
  })

  after(async () => {
    await service.close()
  })

  it(`check success`, async () => {
    const privateKey = await readFile(join(moduleDir, 'src/.jwks.pem'), 'utf-8')
    const jwks = JSON.parse(await readFile(join(moduleDir, 'src/.jwks.json'), 'utf-8'))

    const keyId = jwks.keys?.[0]?.kid

    const token = jwt.sign({ sub: 'test' }, privateKey, {
      algorithm: 'RS256',
      keyid: keyId,
    })

    const metadata = new Metadata()

    metadata.add('authorization', `Bearer ${token}`)

    const result = await client.test({ id: 'test' }, metadata).toPromise()

    assert.strictEqual(result.id, 'test')
  })

  it(`check failed`, async () => {
    const metadata = new Metadata()

    metadata.add('authorization', `Bearer test`)

    await assert.rejects(
      async () => client.test({ id: 'test' }, metadata).toPromise(),
      (error) => {
        if (!(error instanceof Error)) {
          throw error
        }

        const grpcError = error as Error & { code?: number }
        assert.strictEqual(grpcError.code, status.UNAUTHENTICATED)

        return true
      }
    )
  })
})
