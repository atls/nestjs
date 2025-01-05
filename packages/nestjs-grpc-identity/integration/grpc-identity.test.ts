/**
 * @jest-environment node
 */

import type { INestMicroservice }        from '@nestjs/common'

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
import { readFileSync }                  from 'node:fs'
import { sign }                          from 'jsonwebtoken'
import { join }                          from 'node:path'
import getPort                           from 'get-port'

import { GrpcIdentityIntegrationModule } from './src/index.js'
import { serverOptions }                 from './src/index.js'

describe('grpc identity', () => {
  let service: INestMicroservice
  let client: any

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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    client = service.get('client').getService('TestService')
  })

  afterAll(async () => {
    await service.close()
  })

  it(`check success`, async () => {
    const privateKey = readFileSync(join(__dirname, 'src/.jwks.pem'), 'utf-8')

    const token = sign({ sub: 'test' }, privateKey, { algorithm: 'RS256' })

    const metadata = new Metadata()

    metadata.add('authorization', `Bearer ${token}`)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const result = await client.test({ id: 'test' }, metadata).toPromise()

    expect(result.id).toBe('test')
  })

  it(`check failed`, async () => {
    expect.assertions(1)

    try {
      const metadata = new Metadata()

      metadata.add('authorization', `Bearer test`)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await client.test({ id: 'test' }, metadata).toPromise()
    } catch (error) {
      expect((error as any).code).toBe(status.UNAUTHENTICATED)
    }
  })
})
