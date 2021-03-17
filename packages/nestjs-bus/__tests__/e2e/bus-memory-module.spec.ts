import request from 'supertest'
import { Test } from '@nestjs/testing'
import { HttpStatus, INestApplication } from '@nestjs/common'
import { BusMemoryModule, CreateUserCommand, userRepository } from './src'
import { Bus } from '../../src'

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
      username: Math.random().toString(16).slice(2),
    }

    return request(app.getHttpServer())
      .post('/user')
      .send(payload)
      .set('Accept', 'application/json')
      .expect(HttpStatus.OK)
  })

  afterAll(async () => {
    await app.close()
  })
})
