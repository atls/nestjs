/**
 * @jest-environment node
 */

import { INestApplication }                          from '@nestjs/common'
import { Test }                                      from '@nestjs/testing'
import { describe }                                  from '@jest/globals'
import { beforeAll }                       from '@jest/globals'
import { it }                   from '@jest/globals'
import { expect }           from '@jest/globals'
import { afterAll } from '@jest/globals'
import getPort                                       from 'get-port'
import request                                       from 'supertest'

import { GrpcPlaygroundIntegrationModule }           from '../src/index.js'

describe('grpc playground', () => {
  let app: INestApplication
  let url: string

  beforeAll(async () => {
    const appPort = await getPort()

    const module = await Test.createTestingModule({
      imports: [GrpcPlaygroundIntegrationModule],
    }).compile()

    app = module.createNestApplication()

    await app.init()

    await app.listen(appPort, '0.0.0.0')

    url = await app.getUrl()
  })

  afterAll(async () => {
    await app.close()
  })

  it(`html content`, async () => {
    const response = await request(url).get('/').expect(200)

    expect(response.text).toContain('https://cdn.jsdelivr.net/npm/@atls/grpc-playground-app')
  })
})
