/**
 * @jest-environment node
 */

import { INestApplication }                  from '@nestjs/common'
import { Test }                              from '@nestjs/testing'

import getPort                               from 'get-port'
import request                               from 'supertest'

import { EXTERNAL_RENDERER_MODULE_OPTIONS }  from '../../src'
import { ExternalRendererIntegrationModule } from '../src'

describe('external renderer', () => {
  let app: INestApplication
  let url: string

  beforeAll(async () => {
    const port = await getPort()

    const module = await Test.createTestingModule({
      imports: [ExternalRendererIntegrationModule],
    })
      .overrideProvider(EXTERNAL_RENDERER_MODULE_OPTIONS)
      .useValue({
        url: `http://127.0.0.1:${port}`,
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

  it(`return content`, async () => {
    const response = await request(url).get('/exec/simple').expect(200)

    expect(response.text).toBe('content')
  })

  it(`return param`, async () => {
    const response = await request(url).get('/exec/params').expect(200)

    expect(response.text).toBe('value')
  })

  it(`return param res`, async () => {
    const response = await request(url).get('/exec/res-render-params').expect(200)

    expect(response.text).toBe('value')
  })
})
