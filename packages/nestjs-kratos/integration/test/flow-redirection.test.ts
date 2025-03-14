/**
 * @jest-environment node
 */

import type { INestApplication }   from '@nestjs/common'

import { Test }                    from '@nestjs/testing'
import { describe }                from '@jest/globals'
import { it }                      from '@jest/globals'
import { expect }                  from '@jest/globals'
import { beforeAll }               from '@jest/globals'
import { afterAll }                from '@jest/globals'
import getPort                     from 'get-port'
import request                     from 'supertest'

import { KRATOS_MODULE_OPTIONS }   from '../../src/index.js'
import { KratosIntegrationModule } from '../src/index.js'

describe('kratos flow redirection', () => {
  let app: INestApplication
  let url: string

  beforeAll(async () => {
    const port = await getPort()

    const testingModule = await Test.createTestingModule({
      imports: [KratosIntegrationModule],
    })
      .overrideProvider(KRATOS_MODULE_OPTIONS)
      .useValue({
        browser: `http://127.0.0.1:${port}`,
        public: `http://127.0.0.1:${port}`,
      })
      .compile()

    app = testingModule.createNestApplication() as INestApplication

    await app.init()
    await app.listen(port, '0.0.0.0')

    url = await app.getUrl()
  })

  afterAll(async () => {
    await app.close()
  })

  it(`redirect 403`, async () => {
    const response = await request(url).get('/redirect/403').expect(302)

    expect(response.get('location')).toEqual(expect.stringContaining('/self-service/login/browser'))
  })

  it(`redirect 404`, async () => {
    const response = await request(url).get('/redirect/404').expect(302)

    expect(response.get('location')).toEqual(expect.stringContaining('/self-service/login/browser'))
  })

  it(`redirect 410`, async () => {
    const response = await request(url).get('/redirect/410').expect(302)

    expect(response.get('location')).toEqual(expect.stringContaining('/self-service/login/browser'))
  })

  it(`redirect empty flow`, async () => {
    const response = await request(url).get('/redirect/flow').expect(302)

    expect(response.get('location')).toEqual(expect.stringContaining('/self-service/login/browser'))
  })
})
