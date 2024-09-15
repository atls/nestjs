/**
 * @jest-environment node
 */

import { Metadata }                                  from '@grpc/grpc-js'
import { INestMicroservice }                         from '@nestjs/common'
import { ClientsModule }                             from '@nestjs/microservices'
import { Transport }                                 from '@nestjs/microservices'
import { Test }                                      from '@nestjs/testing'
import { status }                                    from '@grpc/grpc-js'
import { describe }                                  from '@jest/globals'
import { beforeAll }                       from '@jest/globals'
import { it }                   from '@jest/globals'
import { expect }           from '@jest/globals'
import { afterAll } from '@jest/globals'
import { readFileSync }                              from 'fs'
import { sign }                                      from 'jsonwebtoken'
import { join }                                      from 'path'
import getPort                                       from 'get-port'

import { GrpcIdentityIntegrationModule }             from './src/index.js'
import { serverOptions }                             from './src/index.js'

describe('grpc identity', () => {
  let service: INestMicroservice
  // @ts-ignore
  let client

  beforeAll(async () => {
    const servicePort = await getPort()

    const module = await Test.createTestingModule({
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

    service = module.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `0.0.0.0:${servicePort}`,
      },
    })

    await service.init()
    await service.listen()

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

    // @ts-ignore
    const result = await client.test({ id: 'test' }, metadata).toPromise()

    expect(result.id).toBe('test')
  })

  it(`check failed`, async () => {
    expect.assertions(1)

    try {
      const metadata = new Metadata()

      metadata.add('authorization', `Bearer test`)

      // @ts-ignore
      await client.test({ id: 'test' }, metadata).toPromise()
    } catch (error) {
      expect((error as any).code).toBe(status.UNAUTHENTICATED)
    }
  })
})
