import type { INestApplication }           from '@nestjs/common'

import assert                              from 'node:assert/strict'
import { after }                           from 'node:test'
import { before }                          from 'node:test'
import { describe }                        from 'node:test'
import { it }                              from 'node:test'

import { Test }                            from '@nestjs/testing'
import getPort                             from 'get-port'
import request                             from 'supertest'

import { GrpcPlaygroundIntegrationModule } from '../src/index.js'

describe('grpc playground', () => {
  let app: INestApplication
  let url: string

  before(async () => {
    const appPort = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [GrpcPlaygroundIntegrationModule],
    }).compile()

    app = testingModule.createNestApplication()

    await app.init()

    await app.listen(appPort, '127.0.0.1')

    url = await app.getUrl()
  })

  after(async () => {
    await app.close()
  })

  it(`html content`, async () => {
    const response = await request(url).get('/').expect(200)

    assert.ok(response.text.includes('https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app'))
  })
})
