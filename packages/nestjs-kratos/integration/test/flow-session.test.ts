/**
 * @jest-environment node
 */

import { INestApplication }        from '@nestjs/common'
import { Test }                    from '@nestjs/testing'

import getPort                     from 'get-port'
import request                     from 'supertest'

import { KRATOS_MODULE_OPTIONS }   from '../../src'
import { KratosIntegrationModule } from '../src'

describe('kratos flow session', () => {
  let app: INestApplication
  let url: string

  beforeAll(async () => {
    const port = await getPort()

    const module = await Test.createTestingModule({
      imports: [KratosIntegrationModule],
    })
      .overrideProvider(KRATOS_MODULE_OPTIONS)
      .useValue({
        browser: `http://127.0.0.1:${port}`,
        public: `http://127.0.0.1:${port}`,
      })
      .compile()

    app = module.createNestApplication()

    await app.init()
    await app.listen(port, '0.0.0.0')

    url = await app.getUrl()
  })

  afterAll(async () => {
    await app.close()
  })

  it(`exists session`, async () => {
    const response = await request(url)
      .get('/identity/session/whoami')
      .set('Authorization', 'test')
      .expect(200)

    expect(response.body.id).toBe('test')
  })

  it(`empty session`, async () => {
    const response = await request(url).get('/identity/session/whoami').expect(200)

    expect(response.body.id).not.toBeDefined()
  })
})
