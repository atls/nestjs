/* eslint-disable prettier/prettier */

import request                                                   from 'supertest'
import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common'
import { ExpressAdapter }                                        from '@nestjs/platform-express'
import { Test }                                                  from '@nestjs/testing'

import { CatsController }                                        from './resources'

describe('e2e map errors interceptor', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
    }).compile()

    app = moduleRef.createNestApplication(new ExpressAdapter())

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        exceptionFactory: (error) => new BadRequestException(error),
      })
    )

    await app.init()
  })

  it('should return the error object', async () => {
    const cat = {
      name: '1234567890',
    }

    const createCatResponse = await request(app.getHttpServer())
      .post('/cat')
      .set('Accept', 'application/json')
      .send(cat)

    expect(createCatResponse.body).toHaveProperty('errors')
  })

  it('should successfull create a cat', async () => {
    const cat = {
      name: 'Node',
    }

    const createCatResponse = await request(app.getHttpServer())
      .post('/cat')
      .set('Accept', 'application/json')
      .send(cat)

    expect(createCatResponse.body).toMatchObject({ success: true })
  })

  afterAll(async () => {
    await app.close()
  })
})
