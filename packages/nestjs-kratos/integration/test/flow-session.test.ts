import type { INestApplication }   from '@nestjs/common'

import assert                      from 'node:assert/strict'
import { after }                   from 'node:test'
import { before }                  from 'node:test'
import { describe }                from 'node:test'
import { it }                      from 'node:test'

import { Test }                    from '@nestjs/testing'
import getPort                     from 'get-port'
import request                     from 'supertest'

import { KRATOS_MODULE_OPTIONS }   from '../../src/index.js'
import { KratosIntegrationModule } from '../src/index.js'

describe('kratos flow session', () => {
  let app: INestApplication
  let url: string

  before(async () => {
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

    app = testingModule.createNestApplication()

    await app.init()
    await app.listen(port, '127.0.0.1')

    url = await app.getUrl()
  })

  after(async () => {
    await app.close()
  })

  it(`exists session`, async () => {
    const response = await request(url)
      .get('/identity/session/whoami')
      .set('Cookie', 'test')
      .expect(200)

    assert.strictEqual(response.body.id, 'test')
  })

  it(`empty session`, async () => {
    const response = await request(url).get('/identity/session/whoami').expect(200)

    assert.equal(response.body.id, undefined)
  })
})
