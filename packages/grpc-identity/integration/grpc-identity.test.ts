/**
 * @jest-environment node
 */

import getPort                           from 'get-port'
import { INestMicroservice }             from '@nestjs/common'
import { ClientsModule }                 from '@nestjs/microservices'
import { Transport }                     from '@nestjs/microservices'
import { Test }                          from '@nestjs/testing'
import { sign }                          from 'jsonwebtoken'
import { Metadata }                      from 'grpc'
import { status }                        from 'grpc'
import { join }                          from 'path'
import { readFileSync }                  from 'fs'

import { GrpcIdentityIntegrationModule } from './src'
import { serverOptions }                 from './src'

describe('grpc identity', () => {
  let service: INestMicroservice
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
    await service.listenAsync()

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
      expect(error.code).toBe(status.UNAUTHENTICATED)
    }
  })
})
