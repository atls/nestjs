import type { INestApplication }          from '@nestjs/common'
import type { INestMicroservice }         from '@nestjs/common'

import assert                             from 'node:assert/strict'
import { after }                          from 'node:test'
import { before }                         from 'node:test'
import { describe }                       from 'node:test'
import { it }                             from 'node:test'

import { Test }                           from '@nestjs/testing'
import getPort                            from 'get-port'
import request                            from 'supertest'

import { GRPC_HTTP_PROXY_MODULE_OPTIONS } from '../../src/index.js'
import { GrpcHttpProxyIntegrationModule } from '../src/index.js'
import { NopeAuthenticator }              from '../src/index.js'
import { serverOptions }                  from '../src/index.js'

describe('grpc http proxy', () => {
  let service: INestMicroservice
  let app: INestApplication
  let url: string

  before(async () => {
    const servicePort = await getPort()
    const appPort = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [GrpcHttpProxyIntegrationModule],
    })
      .overrideProvider(GRPC_HTTP_PROXY_MODULE_OPTIONS)
      .useValue({
        options: {
          ...serverOptions.options,
          url: `127.0.0.1:${servicePort}`,
        },
        authenticator: new NopeAuthenticator(),
      })
      .compile()

    service = testingModule.createNestMicroservice({
      ...serverOptions,
      options: {
        ...serverOptions.options,
        url: `127.0.0.1:${servicePort}`,
      },
    })

    app = testingModule.createNestApplication()

    await service.init()
    await app.init()

    await app.listen(appPort, '127.0.0.1')
    await service.listen()

    url = await app.getUrl()
  })

  after(async () => {
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

    assert.strictEqual(response.body.id, 'test')
  })

  it(`call error method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/TestError')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    assert.strictEqual(response.body.code, 2)
    assert.ok(response.body.details)
  })

  it(`call stream method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/TestStream')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    assert.strictEqual(response.body.id, 'test')
  })

  it(`call auth method`, async () => {
    const response = await request(url)
      .post('/grpc-proxy/test.TestService/TestAuth')
      .send({
        id: 'test',
      })
      .set('Accept', 'application/json')
      .expect(200)

    assert.strictEqual(response.body.id, 'nope')
  })
})
