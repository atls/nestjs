/**
 * @jest-environment node
 */

import { INestApplication }               from '@nestjs/common'
import { INestMicroservice }              from '@nestjs/common'
import { Test }                           from '@nestjs/testing'

import getPort                            from 'get-port'
import request                            from 'supertest'

import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from '../../src'
import { GrpcHttpProxyIntegrationModule } from '../src'
import { NopeAuthenticator }              from '../src'
import { serverOptions }                  from '../src'

describe('grpc http proxy', () => {
  let service: INestMicroservice
  let app: INestApplication
  let url: string

  beforeAll(async () => {
    const servicePort = await getPort()
    const appPort = await getPort()

    const module = await Test.createTestingModule({
      imports: [GrpcHttpProxyIntegrationModule],
    })
      .overrideProvider(GRPC_HTTP_PROXY_MODULE_OPTIONS)
      .useValue({
        options: {
          ...serverOptions.options,
          url: `0.0.0.0:${servicePort}`,
        },
        authenticator: new NopeAuthenticator(),
      })
      .compile()

    service = module.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `0.0.0.0:${servicePort}`,
      },
    })

    app = module.createNestApplication()

    await service.init()
    await app.init()

    await app.listen(appPort, '0.0.0.0')
    await service.listenAsync()

    url = await app.getUrl()
  })

  afterAll(async () => {
    await service.close()
    await app.close()
  })

  it(`call method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/Test')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(response.body.id).toBe('test')
  })

  it(`call error method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/TestError')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(response.body.code).toBe(2)
    expect(response.body.details).toBeDefined()
  })

  it(`call stream method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/TestStream')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(response.body.id).toBe('test')
  })

  it(`call auth method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/TestAuth')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    expect(response.body.id).toBe('nope')
  })
})
