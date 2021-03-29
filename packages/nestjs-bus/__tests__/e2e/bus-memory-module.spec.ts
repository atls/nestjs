import request                          from 'supertest'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { Test }                         from '@nestjs/testing'

import { BusMemoryModule }              from './src'

describe('BusModule', () => {
  let app: INestApplication

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [BusMemoryModule],
    }).compile()

    app = module.createNestApplication()

    await app.init()
  })

  it('should create a user', async () => {
    const payload = {
      id: 1,
      username: Math.random()
        .toString(16)
        .slice(2),
    }

    const createUserResponse = await request(app.getHttpServer())
      .post('/user')
      .set('Accept', 'application/json')
      .send(payload)

    expect(createUserResponse.status).toBe(HttpStatus.OK)
    expect(createUserResponse.body).toMatchObject(payload)

    const findUserResponse = await request(app.getHttpServer())
      .get(`/user/${payload.id}`)
      .set('Accept', 'application/json')
      .send()

    expect(findUserResponse.status).toBe(HttpStatus.OK)
    expect(findUserResponse.body).toMatchObject(payload)
  })

  afterAll(async () => {
    await app.close()
  })
})
